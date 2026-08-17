const RESEND_ENDPOINT = 'https://api.resend.com/emails';

function json(status, data) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' }
  });
}

function escapeHtml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function onRequest(context) {
  const { env } = context;

  if (!env.RESEND_API_KEY) {
    return json(500, { error: 'RESEND_API_KEY not configured' });
  }

  if (context.request.method !== 'POST') {
    return json(405, { error: 'Method not allowed' });
  }

  const form = await context.request.formData();
  const data = Object.fromEntries(form.entries());

  const nome = (data.nome || '').trim();
  const email = (data.email || '').trim();
  const telefono = (data.telefono || '').trim();
  const messaggio = (data.messaggio || '').trim();
  const privacy = data.privacy;

  if (!nome || !email || !messaggio || privacy === undefined) {
    return json(400, { error: 'Campi obbligatori mancanti' });
  }

  const servizi = form.getAll('servizi').join(', ') || 'Non specificato';

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
      <div style="background:#021164;padding:20px 24px;color:#fff">
        <h2 style="margin:0;font-size:20px">Nuova richiesta dal sito</h2>
      </div>
      <div style="padding:24px">
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <tr><td style="padding:8px 0;color:#6b7280;width:140px">Nome</td><td style="padding:8px 0;font-weight:600">${escapeHtml(nome)}</td></tr>
          <tr><td style="padding:8px 0;color:#6b7280">Email</td><td style="padding:8px 0"><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></td></tr>
          <tr><td style="padding:8px 0;color:#6b7280">Telefono</td><td style="padding:8px 0">${escapeHtml(telefono) || '—'}</td></tr>
          <tr><td style="padding:8px 0;color:#6b7280">Servizi</td><td style="padding:8px 0">${escapeHtml(servizi)}</td></tr>
        </table>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0" />
        <p style="color:#6b7280;font-size:13px;margin:0 0 8px">Messaggio:</p>
        <div style="background:#f9fafb;border-radius:8px;padding:16px;white-space:pre-wrap">${escapeHtml(messaggio)}</div>
      </div>
    </div>
  `;

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: `Build Hub <${env.CONTACT_FROM || 'noreply@buildhubitalia.com'}>`,
        to: env.CONTACT_TO || 'buildhubitalia@gmail.com',
        subject: `Nuova richiesta da ${nome}`,
        html
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      return json(500, { error: 'Errore invio email', details: errText });
    }

    return json(200, { ok: true });
  } catch (err) {
    return json(500, { error: err.message });
  }
}