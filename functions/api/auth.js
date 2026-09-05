export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  // Step 2: GitHub redirected back with a code — exchange it for a token
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
      return new Response(
        `<script>window.opener.postMessage("authorization:github:error:${data.error_description || data.error}", window.location.origin); window.close();</script>`,
        { headers: { "Content-Type": "text/html" } }
      );
    }

    const payload = JSON.stringify({ token: data.access_token, provider: "github" });
    return new Response(
      `<script>window.opener.postMessage("authorization:github:success:${payload}", window.location.origin); window.close();</script>`,
      { headers: { "Content-Type": "text/html" } }
    );
  }

  // Step 1: Initial request — redirect to GitHub OAuth
  const redirectUri = `${url.origin}/api/auth`;
  const scope = "repo,user";
  const authUrl = `https://github.com/login/oauth/authorize?client_id=${env.GITHUB_CLIENT_ID}&scope=${encodeURIComponent(scope)}&redirect_uri=${encodeURIComponent(redirectUri)}`;

  return Response.redirect(authUrl, 302);
}
