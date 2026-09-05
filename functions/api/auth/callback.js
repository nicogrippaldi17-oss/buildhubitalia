export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  const cookieHeader = request.headers.get("Cookie") || "";
  const storedState = cookieHeader.match(/(?:^|;\s*)oauth_state=([^;]+)/)?.[1];

  if (state && storedState && state !== storedState) {
    return new Response("Invalid state parameter", { status: 403 });
  }

  if (!code) {
    return new Response("Missing code parameter", { status: 400 });
  }

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
      `authorization:github:error:${data.error_description || data.error}`,
      { status: 401 }
    );
  }

  const html = `
    <script>
      window.opener.postMessage(
        'authorization:github:success:${JSON.stringify({
          token: data.access_token,
          provider: "github",
        })}',
        window.location.origin
      );
      window.close();
    </script>`;

  return new Response(html, {
    headers: { "Content-Type": "text/html" },
  });
}
