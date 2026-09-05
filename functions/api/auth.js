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
      const errorMsg = data.error_description || data.error;
      return new Response(
        `<html><body><script>
          if (window.opener) {
            window.opener.postMessage("authorization:github:error:${errorMsg}", window.location.origin);
          }
          window.close();
        </script><p>Error: ${errorMsg}</p></body></html>`,
        { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } }
      );
    }

    const payload = JSON.stringify({ token: data.access_token, provider: "github" });
    return new Response(
      `<html><body><script>
        var msg = "authorization:github:success:${payload}";
        if (window.opener) {
          window.opener.postMessage(msg, window.location.origin);
        }
        window.close();
        document.body.innerHTML = "<p>Login successful. You may close this window.</p>";
      </script></body></html>`,
      { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }

  // Step 1: Initial request — redirect to GitHub OAuth via HTML (not 302)
  const redirectUri = `${url.origin}/api/auth`;
  const scope = "repo,user";
  const authUrl = `https://github.com/login/oauth/authorize?client_id=${env.GITHUB_CLIENT_ID}&scope=${encodeURIComponent(scope)}&redirect_uri=${encodeURIComponent(redirectUri)}`;

  return new Response(
    `<html><body><script>window.location.href = ${JSON.stringify(authUrl)};</script></body></html>`,
    { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}
