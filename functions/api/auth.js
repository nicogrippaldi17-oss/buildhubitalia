export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (code) {
    const res = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": "BuildHub-CMS-Auth",
      },
      body: JSON.stringify({
        client_id: env.GITHUB_CLIENT_ID,
        client_secret: env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });
    const data = await res.json();

    if (data.error) {
      const msg = JSON.stringify(
        "authorization:github:error:" + (data.error_description || data.error)
      );
      return new Response(`<script>sendMsg(${msg});</script>`, {
        headers: { "Content-Type": "text/html" },
      });
    }

    const payload = JSON.stringify({
      token: data.access_token,
      provider: "github",
    });
    const msg = JSON.stringify("authorization:github:success:" + payload);
    return new Response(`<script>sendMsg(${msg});</script>`, {
      headers: { "Content-Type": "text/html" },
    });
  }

  const redirectUri = `${url.origin}/api/auth`;
  const scope = url.searchParams.get("scope") || "repo,user";
  const authUrl = `https://github.com/login/oauth/authorize?client_id=${
    env.GITHUB_CLIENT_ID
  }&scope=${encodeURIComponent(scope)}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}`;
  return new Response(`<script>window.location.href = ${JSON.stringify(authUrl)};</script>`, {
    headers: { "Content-Type": "text/html" },
  });
}
