const https = require('https');
const crypto = require('crypto');

const GITHUB_TOKEN = process.env.GITHUB_PAT;
const REPO = process.env.REPO || 'nicogrippaldi17-oss/buildhubitalia';
const DEF_BRANCH = 'main';
const MEDIA_FOLDER = 'src/img/projects';
const API_HOST = 'api.github.com';

function githubRequest(method, path, body) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: API_HOST,
      path: `/repos/${REPO}${path}`,
      method,
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'BuildHub-CMS-Proxy'
      }
    };
    if (body) opts.headers['Content-Type'] = 'application/json';
    const req = https.request(opts, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let parsed;
        try { parsed = JSON.parse(data); } catch { parsed = {}; }
        resolve({ status: res.statusCode, data: parsed });
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function getSha(path, branch) {
  const r = await githubRequest('GET', `/contents/${encodeURIComponent(path)}?ref=${branch}`);
  return r.status === 200 ? r.data.sha : null;
}

function decodeB64(s) {
  return Buffer.from(s, 'base64').toString('utf-8');
}

function encodeB64(s) {
  return Buffer.from(s, 'utf-8').toString('base64');
}

function computeId(content) {
  return crypto.createHash('sha256').update(content).digest('hex');
}

async function readFile(path, branch) {
  const r = await githubRequest('GET', `/contents/${encodeURIComponent(path)}?ref=${branch}`);
  if (r.status !== 200) return null;
  return {
    content: decodeB64(r.data.content),
    sha: r.data.sha
  };
}

exports.handler = async (event) => {
  if (!GITHUB_TOKEN) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'GITHUB_PAT not configured' })
    };
  }

  let body;
  try { body = JSON.parse(event.body || '{}'); } catch { body = {}; }
  const action = body.action;
  const params = body.params || {};
  const branch = body.branch || DEF_BRANCH;

  try {
    switch (action) {
      case 'info': {
        const { data } = await githubRequest('GET', '');
        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            repo: data.full_name,
            publish_modes: ['simple'],
            type: 'local_git'
          })
        };
      }

      case 'entriesByFolder': {
        const folder = params.folder;
        const { data } = await githubRequest('GET', `/git/trees/${branch}?recursive=1`);
        const files = (data.tree || []).filter(f =>
          f.path.startsWith(folder + '/') && f.type === 'blob'
        );
        const entries = [];
        for (const file of files) {
          const fd = await readFile(file.path, branch);
          if (!fd) continue;
          entries.push({
            data: fd.content,
            file: { path: file.path, label: null, id: computeId(fd.content) }
          });
        }
        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entries)
        };
      }

      case 'entries': {
        const folder = (params.collection && params.collection.folder) || params.folder;
        const { data } = await githubRequest('GET', `/git/trees/${branch}?recursive=1`);
        const files = (data.tree || []).filter(f =>
          f.path.startsWith(folder + '/') && f.type === 'blob'
        );
        const entries = [];
        for (const file of files) {
          const fd = await readFile(file.path, branch);
          if (!fd) continue;
          entries.push({
            data: fd.content,
            file: { path: file.path, label: null, id: computeId(fd.content) }
          });
        }
        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entries)
        };
      }

      case 'entriesByFiles': {
        const files = params.files || [];
        const entries = [];
        for (const f of files) {
          const fd = await readFile(f.path, branch);
          if (!fd) continue;
          entries.push({
            data: fd.content,
            file: { path: f.path, label: null, id: computeId(fd.content) }
          });
        }
        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entries)
        };
      }

      case 'getEntry': {
        const path = params.path;
        const fd = await readFile(path, branch);
        if (!fd) {
          return {
            statusCode: 404,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Entry not found' })
          };
        }
        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            data: fd.content,
            file: { path, label: null, id: computeId(fd.content) }
          })
        };
      }

      case 'persistEntry': {
        const dataFiles = params.dataFiles || [];
        const assets = params.assets || [];
        const commitMessage = (params.options && params.options.commitMessage) || 'Update via CMS';
        for (const df of dataFiles) {
          const sha = await getSha(df.path, branch);
          const req = { message: commitMessage, content: encodeB64(df.raw), branch };
          if (sha) req.sha = sha;
          await githubRequest('PUT', `/contents/${encodeURIComponent(df.path)}`, req);
        }
        for (const asset of assets) {
          const sha = await getSha(asset.path, branch);
          const req = { message: `Media: ${asset.path}`, content: asset.content, branch };
          if (sha) req.sha = sha;
          await githubRequest('PUT', `/contents/${encodeURIComponent(asset.path)}`, req);
        }
        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: 'entry persisted' })
        };
      }

      case 'deleteFile': {
        const path = params.path;
        const sha = await getSha(path, branch);
        if (!sha) {
          return {
            statusCode: 404,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'File not found' })
          };
        }
        await githubRequest('DELETE', `/contents/${encodeURIComponent(path)}`, {
          message: `Delete ${path}`, sha, branch
        });
        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: `deleted file ${path}` })
        };
      }

      case 'deleteFiles': {
        const paths = params.paths || [];
        for (const p of paths) {
          const sha = await getSha(p, branch);
          if (!sha) continue;
          await githubRequest('DELETE', `/contents/${encodeURIComponent(p)}`, {
            message: `Delete ${p}`, sha, branch
          });
        }
        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: `deleted files ${paths.join(', ')}` })
        };
      }

      case 'getMedia': {
        const mediaFolder = params.mediaFolder || MEDIA_FOLDER;
        const { data } = await githubRequest('GET', `/contents/${mediaFolder}?ref=${branch}`);
        const files = Array.isArray(data) ? data : [];
        const media = [];
        for (const f of files) {
          const r = await githubRequest('GET', `/contents/${encodeURIComponent(f.path)}?ref=${branch}`);
          if (r.status !== 200) continue;
          media.push({
            id: computeId(r.data.content),
            content: r.data.content,
            encoding: 'base64',
            path: f.path,
            name: f.name
          });
        }
        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(media)
        };
      }

      case 'getMediaFile': {
        const path = params.path;
        const r = await githubRequest('GET', `/contents/${encodeURIComponent(path)}?ref=${branch}`);
        if (r.status !== 200) {
          return {
            statusCode: 404,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Media not found' })
          };
        }
        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: computeId(r.data.content),
            content: r.data.content,
            encoding: 'base64',
            path: r.data.path,
            name: r.data.name
          })
        };
      }

      case 'persistMedia': {
        const asset = params.asset;
        const commitMessage = (params.options && params.options.commitMessage) || 'Add media via CMS';
        const sha = await getSha(asset.path, branch);
        const req = { message: commitMessage, content: asset.content, branch };
        if (sha) req.sha = sha;
        await githubRequest('PUT', `/contents/${encodeURIComponent(asset.path)}`, req);
        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: computeId(asset.content),
            content: asset.content,
            encoding: 'base64',
            path: asset.path,
            name: asset.path.split('/').pop()
          })
        };
      }

      case 'getDeploy':
      case 'getDeployPreview':
      case 'unpublishedEntries':
        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify([])
        };

      case 'getUnpublishedEntry':
      case 'unpublishedEntry':
      case 'unpublishedEntryDataFile':
      case 'unpublishedEntryMediaFile':
        return {
          statusCode: 404,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'not found' })
        };

      case 'persistUnpublishedEntry':
      case 'updateUnpublishedEntryStatus':
      case 'publishUnpublishedEntry':
      case 'deleteUnpublishedEntry':
        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: 'ok' })
        };

      default:
        return {
          statusCode: 400,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Unknown action: ' + action })
        };
    }
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: err.message })
    };
  }
};
