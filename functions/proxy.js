const DEF_BRANCH = 'main';
const DEF_MEDIA_FOLDER = 'src/img/projects';

async function computeId(content) {
  const data = new TextEncoder().encode(content);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function encodeB64(str) {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}

function decodeB64(b64) {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

async function githubRequest(token, repo, method, path, body) {
  const opts = {
    method,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'BuildHub-CMS-Proxy'
    }
  };
  if (body) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  }
  const res = await fetch(`https://api.github.com/repos/${repo}${path}`, opts);
  let data = {};
  try { data = await res.json(); } catch {}
  return { status: res.status, data };
}

async function getSha(token, repo, path, branch) {
  const r = await githubRequest(token, repo, 'GET', `/contents/${encodeURIComponent(path)}?ref=${branch}`);
  return r.status === 200 ? r.data.sha : null;
}

async function readFile(token, repo, path, branch) {
  const r = await githubRequest(token, repo, 'GET', `/contents/${encodeURIComponent(path)}?ref=${branch}`);
  if (r.status !== 200) return null;
  return { content: decodeB64(r.data.content), sha: r.data.sha };
}

function json(status, data) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' }
  });
}

export async function onRequest(context) {
  const { env } = context;
  const token = env.GITHUB_PAT;
  const repo = env.GITHUB_REPO || 'nicogrippaldi17-oss/buildhubitalia';
  const mediaFolder = env.MEDIA_FOLDER || DEF_MEDIA_FOLDER;

  if (!token) {
    return json(500, { error: 'GITHUB_PAT not configured' });
  }

  let body;
  try { body = await context.request.json(); } catch { body = {}; }
  const action = body.action;
  const params = body.params || {};
  const branch = body.branch || DEF_BRANCH;

  try {
    switch (action) {
      case 'info': {
        const { data } = await githubRequest(token, repo, 'GET', '');
        return json(200, {
          repo: data.full_name,
          publish_modes: ['simple'],
          type: 'local_git'
        });
      }

      case 'entriesByFolder': {
        const folder = params.folder;
        const { data } = await githubRequest(token, repo, 'GET', `/git/trees/${branch}?recursive=1`);
        const files = (data.tree || []).filter(f =>
          f.path.startsWith(folder + '/') && f.type === 'blob'
        );
        const entries = [];
        for (const file of files) {
          const fd = await readFile(token, repo, file.path, branch);
          if (!fd) continue;
          entries.push({
            data: fd.content,
            file: { path: file.path, label: null, id: await computeId(fd.content) }
          });
        }
        return json(200, entries);
      }

      case 'entries': {
        const folder = (params.collection && params.collection.folder) || params.folder;
        const { data } = await githubRequest(token, repo, 'GET', `/git/trees/${branch}?recursive=1`);
        const files = (data.tree || []).filter(f =>
          f.path.startsWith(folder + '/') && f.type === 'blob'
        );
        const entries = [];
        for (const file of files) {
          const fd = await readFile(token, repo, file.path, branch);
          if (!fd) continue;
          entries.push({
            data: fd.content,
            file: { path: file.path, label: null, id: await computeId(fd.content) }
          });
        }
        return json(200, entries);
      }

      case 'entriesByFiles': {
        const files = params.files || [];
        const entries = [];
        for (const f of files) {
          const fd = await readFile(token, repo, f.path, branch);
          if (!fd) continue;
          entries.push({
            data: fd.content,
            file: { path: f.path, label: null, id: await computeId(fd.content) }
          });
        }
        return json(200, entries);
      }

      case 'getEntry': {
        const path = params.path;
        const fd = await readFile(token, repo, path, branch);
        if (!fd) {
          return json(404, { error: 'Entry not found' });
        }
        return json(200, {
          data: fd.content,
          file: { path, label: null, id: await computeId(fd.content) }
        });
      }

      case 'persistEntry': {
        const dataFiles = params.dataFiles || [];
        const assets = params.assets || [];
        const commitMessage = (params.options && params.options.commitMessage) || 'Update via CMS';
        for (const df of dataFiles) {
          const sha = await getSha(token, repo, df.path, branch);
          const req = { message: commitMessage, content: encodeB64(df.raw), branch };
          if (sha) req.sha = sha;
          await githubRequest(token, repo, 'PUT', `/contents/${encodeURIComponent(df.path)}`, req);
        }
        for (const asset of assets) {
          const sha = await getSha(token, repo, asset.path, branch);
          const req = { message: `Media: ${asset.path}`, content: asset.content, branch };
          if (sha) req.sha = sha;
          await githubRequest(token, repo, 'PUT', `/contents/${encodeURIComponent(asset.path)}`, req);
        }
        return json(200, { message: 'entry persisted' });
      }

      case 'deleteFile': {
        const path = params.path;
        const sha = await getSha(token, repo, path, branch);
        if (!sha) {
          return json(404, { error: 'File not found' });
        }
        await githubRequest(token, repo, 'DELETE', `/contents/${encodeURIComponent(path)}`, {
          message: `Delete ${path}`, sha, branch
        });
        return json(200, { message: `deleted file ${path}` });
      }

      case 'deleteFiles': {
        const paths = params.paths || [];
        for (const p of paths) {
          const sha = await getSha(token, repo, p, branch);
          if (!sha) continue;
          await githubRequest(token, repo, 'DELETE', `/contents/${encodeURIComponent(p)}`, {
            message: `Delete ${p}`, sha, branch
          });
        }
        return json(200, { message: `deleted files ${paths.join(', ')}` });
      }

      case 'getMedia': {
        const folder = params.mediaFolder || mediaFolder;
        const { data } = await githubRequest(token, repo, 'GET', `/contents/${folder}?ref=${branch}`);
        const files = Array.isArray(data) ? data : [];
        const media = [];
        for (const f of files) {
          const r = await githubRequest(token, repo, 'GET', `/contents/${encodeURIComponent(f.path)}?ref=${branch}`);
          if (r.status !== 200) continue;
          media.push({
            id: await computeId(r.data.content),
            content: r.data.content,
            encoding: 'base64',
            path: f.path,
            name: f.name
          });
        }
        return json(200, media);
      }

      case 'getMediaFile': {
        const path = params.path;
        const r = await githubRequest(token, repo, 'GET', `/contents/${encodeURIComponent(path)}?ref=${branch}`);
        if (r.status !== 200) {
          return json(404, { error: 'Media not found' });
        }
        return json(200, {
          id: await computeId(r.data.content),
          content: r.data.content,
          encoding: 'base64',
          path: r.data.path,
          name: r.data.name
        });
      }

      case 'persistMedia': {
        const asset = params.asset;
        const commitMessage = (params.options && params.options.commitMessage) || 'Add media via CMS';
        const sha = await getSha(token, repo, asset.path, branch);
        const req = { message: commitMessage, content: asset.content, branch };
        if (sha) req.sha = sha;
        await githubRequest(token, repo, 'PUT', `/contents/${encodeURIComponent(asset.path)}`, req);
        return json(200, {
          id: await computeId(asset.content),
          content: asset.content,
          encoding: 'base64',
          path: asset.path,
          name: asset.path.split('/').pop()
        });
      }

      case 'getDeploy':
      case 'getDeployPreview':
      case 'unpublishedEntries':
        return json(200, []);

      case 'getUnpublishedEntry':
      case 'unpublishedEntry':
      case 'unpublishedEntryDataFile':
      case 'unpublishedEntryMediaFile':
        return json(404, { error: 'not found' });

      case 'persistUnpublishedEntry':
      case 'updateUnpublishedEntryStatus':
      case 'publishUnpublishedEntry':
      case 'deleteUnpublishedEntry':
        return json(200, { message: 'ok' });

      default:
        return json(400, { error: 'Unknown action: ' + action });
    }
  } catch (err) {
    return json(500, { error: err.message });
  }
}