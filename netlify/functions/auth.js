const https = require('https')
const crypto = require('crypto')
const querystring = require('querystring')

const CLIENT_ID = process.env.GITHUB_OAUTH_CLIENT_ID
const CLIENT_SECRET = process.env.GITHUB_OAUTH_CLIENT_SECRET
const SITE_URL = 'https://buildhubitalia.netlify.app'
const CALLBACK_URL = `${SITE_URL}/.netlify/functions/auth`

function htmlResponse(body) {
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
    body
  }
}

function jsonResponse(status, data) {
  return {
    statusCode: status,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }
}

function redirectResponse(location) {
  return {
    statusCode: 302,
    headers: { Location: location },
    body: ''
  }
}

function githubPostForm(path, params) {
  return new Promise((resolve, reject) => {
    const body = querystring.stringify(params)
    const opts = {
      hostname: 'github.com',
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(body),
        'Accept': 'application/json',
        'User-Agent': 'BuildHub-CMS-Auth'
      }
    }
    const req = https.request(opts, (res) => {
      let data = ''
      res.on('data', (chunk) => data += chunk)
      res.on('end', () => {
        try { resolve(JSON.parse(data)) }
        catch { resolve(data) }
      })
    })
    req.on('error', reject)
    req.write(body)
    req.end()
  })
}

exports.handler = async (event) => {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    return jsonResponse(500, { error: 'GitHub OAuth credentials not configured' })
  }

  const { queryStringParameters } = event
  const isAuth = queryStringParameters.type === 'github' || queryStringParameters.provider === 'github'
  const isCallback = queryStringParameters.code

  if (isAuth) {
    const state = crypto.randomUUID()
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(CALLBACK_URL)}&scope=repo&state=${state}`
    return redirectResponse(githubAuthUrl)
  }

  if (isCallback) {
    try {
      const tokenData = await githubPostForm('/login/oauth/access_token', {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code: queryStringParameters.code,
        redirect_uri: CALLBACK_URL
      })

      const accessToken = tokenData.access_token
      if (!accessToken) {
        return jsonResponse(400, { error: 'Nessun access_token nella risposta', details: tokenData })
      }

      const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body>
<script>
(function() {
  function sendMessage(msg) {
    if (window.opener) {
      window.opener.postMessage(msg, '*')
    }
    if (window.parent && window.parent !== window) {
      window.parent.postMessage(msg, '*')
    }
  }
  sendMessage({ type: 'authorization', data: { token: ${JSON.stringify(accessToken)}, provider: 'github' } })
  setTimeout(function() {
    if (!window.opener && window.parent === window) {
      document.body.innerHTML = '<h3>Login riuscito! Puoi chiudere questa finestra.</h3>'
    }
  }, 2000)
})()
</script>
</body>
</html>`

      return htmlResponse(html)
    } catch (err) {
      return jsonResponse(500, { error: err.message })
    }
  }

  return jsonResponse(400, { error: 'Missing type or code parameter' })
}
