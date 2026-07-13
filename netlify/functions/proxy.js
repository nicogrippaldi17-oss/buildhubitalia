const https = require('https');
const querystring = require('querystring');

const GITHUB_TOKEN = process.env.GITHUB_PAT;
const GITHUB_API_HOST = 'api.github.com';

exports.handler = async (event) => {
  if (!GITHUB_TOKEN) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'GITHUB_PAT not configured on the server' })
    };
  }

  const { path, httpMethod, headers, body, queryStringParameters, isBase64Encoded } = event;

  const githubPath = path.replace('/.netlify/functions/proxy', '');
  const query = (queryStringParameters && Object.keys(queryStringParameters).length > 0)
    ? '?' + querystring.stringify(queryStringParameters)
    : '';

  const opts = {
    hostname: GITHUB_API_HOST,
    path: githubPath + query,
    method: httpMethod,
    headers: {
      'Authorization': 'Bearer ' + GITHUB_TOKEN,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'BuildHub-CMS-Proxy'
    }
  };

  if (headers['content-type']) {
    opts.headers['Content-Type'] = headers['content-type'];
  }

  return new Promise((resolve) => {
    const req = https.request(opts, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: {
            'Content-Type': res.headers['content-type'] || 'application/json',
            'Cache-Control': 'no-cache'
          },
          body: data
        });
      });
    });

    req.on('error', (err) => {
      resolve({
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: err.message })
      });
    });

    if (body) {
      const payload = isBase64Encoded ? Buffer.from(body, 'base64').toString() : body;
      req.write(payload);
    }

    req.end();
  });
};
