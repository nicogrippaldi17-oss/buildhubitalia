export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const provider = url.searchParams.get("provider") || "github";

  const coopHeaders = {
    "Cross-Origin-Opener-Policy": "unsafe-none",
    "Cross-Origin-Embedder-Policy": "unsafe-none",
  };

  const htmlHeaders = { "Content-Type": "text/html; charset=utf-8", ...coopHeaders };

  // ── FASE 2: GitHub redirected back with ?code= ──
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
      const errMsg = JSON.stringify({ message: data.error_description || data.error });
      return new Response(
        `<html><body><script>
          if (window.opener) {
            window.opener.postMessage("authorization:${provider}:error:${errMsg}", "*");
          }
          window.close();
        </script><p>Errore: ${data.error_description || data.error}</p></body></html>`,
        { status: 200, headers: htmlHeaders }
      );
    }

    const token = data.access_token;
    const successMsg = "authorization:" + provider + ":success:" + JSON.stringify({ token, provider });

    return new Response(
      `<html><body><script>
        (function() {
          var msg = ${JSON.stringify(successMsg)};
          if (window.opener) {
            window.opener.postMessage(msg, "*");
          }
          setTimeout(function() { window.close(); }, 100);
        })();
      </script></body></html>`,
      { status: 200, headers: htmlHeaders }
    );
  }

  // ── FASE 1: First load — handshake + redirect to GitHub ──
  const redirectUri = url.origin + "/api/auth";
  const scope = "repo,user";
  const authUrl = "https://github.com/login/oauth/authorize"
    + "?client_id=" + env.GITHUB_CLIENT_ID
    + "&scope=" + encodeURIComponent(scope)
    + "&redirect_uri=" + encodeURIComponent(redirectUri);

  const authUrlJson = JSON.stringify(authUrl);
  const providerJson = JSON.stringify(provider);
  const originJson = JSON.stringify(url.origin);

  return new Response(
    `<html><body><script>
      (function() {
        var provider = ${providerJson};
        var origin = ${originJson};
        var authUrl = ${authUrlJson};

        // 1. Send handshake to opener: "authorizing:github"
        if (window.opener) {
          window.opener.postMessage("authorizing:" + provider, origin);
        }

        // 2. Wait for echo from CMS, then redirect to GitHub
        function onMessage(e) {
          if (e.data === "authorizing:" + provider) {
            window.removeEventListener("message", onMessage, false);
            window.location.href = authUrl;
          }
        }
        window.addEventListener("message", onMessage, false);

        // 3. Fallback: if no opener (shouldn't happen), redirect after 2s
        setTimeout(function() {
          window.removeEventListener("message", onMessage, false);
          window.location.href = authUrl;
        }, 2000);
      })();
    </script><p>Autenticazione in corso...</p></body></html>`,
    { status: 200, headers: htmlHeaders }
  );
}
