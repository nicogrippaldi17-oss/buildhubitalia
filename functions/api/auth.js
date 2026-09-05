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
        `<html><body><h3>Errore OAuth</h3><p>${data.error_description || data.error}</p>
         <p><a href="/admin/">Torna al CMS</a></p></body></html>`,
        { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } }
      );
    }

    const token = data.access_token;
    const msg = "authorization:github:success:" + JSON.stringify({ token: token, provider: "github" });

    return new Response(
      `<html><body>
       <script>
         (function() {
           var msg = ${JSON.stringify(msg)};
           // Manda il token al CMS via postMessage
           if (window.opener) {
             window.opener.postMessage(msg, "*");
           }
           // Chiudi dopo 1 secondo (lascia tempo al CMS di ricevere il messaggio)
           setTimeout(function() { window.close(); }, 1000);
         })();
       </script>
       <p>Login effettuato. Chiudi questa finestra.</p>
       </body></html>`,
      { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }

  // Step 1: Redirect a GitHub OAuth
  const redirectUri = `${url.origin}/api/auth`;
  const scope = "repo,user";
  const authUrl = `https://github.com/login/oauth/authorize?client_id=${env.GITHUB_CLIENT_ID}&scope=${encodeURIComponent(scope)}&redirect_uri=${encodeURIComponent(redirectUri)}`;

  return new Response(
    `<html><body><p>Reindirizzamento a GitHub...</p>
     <script>window.location.href = ${JSON.stringify(authUrl)};</script></body></html>`,
    { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}
