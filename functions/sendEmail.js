
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization'
};

export async function onRequestOptions() {
  // Preflight for cross-origin requests
  return new Response(null, { headers: CORS_HEADERS });
}

export async function onRequestPost({ request, env }) {
  try {
    // --- 1) Read and validate input -----------------------------
    const body = await safeJson(request);
    if (!body) {
      return json({ ok: false, error: 'Invalid JSON body' }, 400);
    }

    const to = (body.to || '').trim();
    const subject = (body.subject || 'No subject').slice(0, 200);
    const text = (body.text || '').toString();

    if (!to) return json({ ok: false, error: 'Missing "to"' }, 400);

    // Attachment (all fields optional)
    const attachmentBase64   = body.attachmentBase64 || null;   // pure base64 (no data: prefix)
    const attachmentFilename = body.attachmentFilename || null;
    const attachmentType     = body.attachmentType || 'application/octet-stream';

    // --- 2) Read secrets from env -------------------------------
    const SENDGRID_API_KEY = env.SENDGRID_API_KEY;
    const SENDER_EMAIL     = env.SENDER_EMAIL;

    if (!SENDGRID_API_KEY || !SENDER_EMAIL) {
      return json(
        { ok: false, error: 'Server is missing SENDGRID_API_KEY or SENDER_EMAIL' },
        500
      );
    }

    // --- 3) Build SendGrid payload ------------------------------
    const payload = {
      personalizations: [{ to: [{ email: to }] }],
      from: { email: SENDER_EMAIL },
      subject,
      content: [{ type: 'text/plain', value: text }]
    };

    if (attachmentBase64 && attachmentFilename) {
      payload.attachments = [
        {
          filename: attachmentFilename,
          type: attachmentType,
          content: attachmentBase64 // SendGrid expects base64 string
        }
      ];
    }

    // --- 4) Call SendGrid API -----------------------------------
    const sgRes = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!sgRes.ok) {
      const errText = await sgRes.text();
      return json(
        { ok: false, error: `SendGrid error ${sgRes.status}: ${errText}` },
        502
      );
    }

    // Success
    return json({ ok: true }, 200);
  } catch (e) {
    return json({ ok: false, error: String(e?.message || e) }, 500);
  }
}

/* -------------------- helpers -------------------- */

async function safeJson(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...CORS_HEADERS
    }
  });
}
