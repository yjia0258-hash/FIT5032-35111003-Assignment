// functions/api/sendEmail.js


const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization'
};

const MAX_ATTACHMENT_BASE64_BYTES = 10 * 1024 * 1024;

export async function onRequestOptions() {
  // Preflight for cross-origin requests
  return new Response(null, { headers: CORS_HEADERS });
}

export async function onRequestPost({ request, env }) {
  try {
    // 1) Parse & validate input
    const body = await safeJson(request);
    if (!body) return json({ ok: false, error: 'Invalid JSON body' }, 400);


    const toList = normalizeEmails(body.to);
    if (!toList.length) return json({ ok: false, error: 'Missing "to"' }, 400);

    const subject  = String(body.subject || 'No subject').slice(0, 200);
    const text     = body.text != null ? String(body.text) : '';
    const html     = body.html != null ? String(body.html) : undefined;
    const fromName = body.fromName ? String(body.fromName).slice(0, 80) : undefined;


    const replyTo  = firstValidEmail(body.replyTo);
    const ccList   = normalizeEmails(body.cc);
    const bccList  = normalizeEmails(body.bcc);


    const attachments = normalizeAttachments(body.attachmentBase64, {
      filename: body.attachmentFilename,
      type: body.attachmentType
    }, body.attachments);


    const totalAttachBytes = attachments.reduce((sum, a) => sum + byteLength(a.content || ''), 0);
    if (totalAttachBytes > MAX_ATTACHMENT_BASE64_BYTES) {
      return json({ ok: false, error: 'Attachments too large (limit ~10MB base64)' }, 413);
    }

    // 2) Read secrets from env
    const SENDGRID_API_KEY = env.SENDGRID_API_KEY;
    const SENDER_EMAIL     = env.SENDER_EMAIL;
    if (!SENDGRID_API_KEY || !SENDER_EMAIL) {
      return json({ ok: false, error: 'Server missing SENDGRID_API_KEY or SENDER_EMAIL' }, 500);
    }

    // 3) Build SendGrid payload
    const personalization = {
      to: toList.map(email => ({ email }))
    };
    if (ccList.length)  personalization.cc  = ccList.map(email => ({ email }));
    if (bccList.length) personalization.bcc = bccList.map(email => ({ email }));

    const sgPayload = {
      personalizations: [personalization],
      from: fromName ? { email: SENDER_EMAIL, name: fromName } : { email: SENDER_EMAIL },
      subject,
      content: []
    };

    if (html) sgPayload.content.push({ type: 'text/html', value: html });
    if (text || !sgPayload.content.length) {
      sgPayload.content.push({ type: 'text/plain', value: text || '' });
    }
    if (replyTo) sgPayload.reply_to = { email: replyTo };
    if (attachments.length) sgPayload.attachments = attachments;

    // 4) Call SendGrid API
    const resp = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(sgPayload)
    });

    if (!resp.ok) {
      const errText = await resp.text().catch(() => '');
      return json({ ok: false, error: `SendGrid ${resp.status}: ${errText || resp.statusText}` }, 502);
    }

    return json({ ok: true }, 200);
  } catch (e) {
    return json({ ok: false, error: String(e?.message || e) }, 500);
  }
}

/* -------------------- helpers -------------------- */

async function safeJson(request) {
  try { return await request.json(); } catch { return null; }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...CORS_HEADERS }
  });
}


function normalizeEmails(input) {
  if (!input) return [];
  const arr = Array.isArray(input) ? input : [input];
  return arr
    .map(s => String(s || '').trim())
    .filter(Boolean)
    .filter(isEmail);
}

function firstValidEmail(input) {
  const list = normalizeEmails(input);
  return list.length ? list[0] : undefined;
}

// 简单邮箱校验（够用就好）
function isEmail(s) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}


function normalizeAttachments(singleBase64, singleMeta = {}, many = undefined) {
  const out = [];

  if (singleBase64) {
    out.push({
      content: stripDataUrl(singleBase64),
      filename: singleMeta.filename || 'attachment.bin',
      type: singleMeta.type || 'application/octet-stream',
      disposition: 'attachment'
    });
  }

  if (Array.isArray(many)) {
    for (const a of many) {
      const content = stripDataUrl(a?.content || a?.base64 || '');
      if (!content) continue;
      out.push({
        content,
        filename: a.filename || 'attachment.bin',
        type: a.type || 'application/octet-stream',
        disposition: a.disposition || 'attachment'
      });
    }
  }

  return out;
}

function stripDataUrl(s) {
  const str = String(s || '').trim();
  const idx = str.indexOf('base64,');
  return idx >= 0 ? str.slice(idx + 'base64,'.length) : str;
}


function byteLength(b64) {
  return new Blob([b64]).size;
}
