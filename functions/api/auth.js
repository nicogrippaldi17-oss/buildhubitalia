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
        `<html><body><h3>Error</h3><p>${errorMsg}</p><script>
          try { localStorage.setItem("gh_oauth_error", ${JSON.stringify(errorMsg)}); } catch(e) {}
          if (window.opener) window.opener.postMessage("authorization:github:error:${errorMsg}", "*");
          setTimeout(function() { window.close(); }, 100);
        </script></body></html>`,
        { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } }
      );
    }

    const token = data.access_token;
    const successMsg = "authorization:github:success:" + JSON.stringify({ token: token, provider: "github" });

    return new Response(
      `<html><body><h3>Login successful</h3><p>You may close this window.</p><script>
        try { localStorage.setItem("gh_oauth_token", ${JSON.stringify(token)}); } catch(e) {}
        if (window.opener) {
          window.opener.postMessage(${JSON.stringify(successMsg)}, "*");
        }
        setTimeout(function() { window.close(); }, 200);
      </script></body></html>`,
      { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }

  // Step 1: Initial request — redirect to GitHub OAuth
  const redirectUri = `${url.origin}/api/auth`;
  const scope = "repo,user";
  const authUrl = `https://github.com/login/oauth/authorize?client_id=${env.GITHUB_CLIENT_ID}&scope=${encodeURIComponent(scope)}&redirect_uri=${encodeURIComponent(redirectUri)}`;

  return new Response(
    `<html><body><p>Redirecting to GitHub...</p><script>window.location.href = ${JSON.stringify(authUrl)};</script></body></html>`,
    { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}
