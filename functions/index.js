// functions/index.js
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env.local") });

/** v2 HTTPS onRequest (for your HTTP function) */
const { onRequest } = require("firebase-functions/v2/https");

/** v1 entry for Auth trigger — prefer subpath, fallback to main package */
let functions;
try {
  functions = require("firebase-functions/v1");
  console.log("[bootstrap] using firebase-functions/v1");
} catch (e) {
  functions = require("firebase-functions");
  console.log("[bootstrap] using firebase-functions (legacy entry)");
}

const admin = require("firebase-admin");
const sgMail = require("@sendgrid/mail");
/** FieldValue for serverTimestamp() */
const { FieldValue } = require("firebase-admin/firestore");

/** Initialize Admin SDK (idempotent) */
try { admin.app(); } catch { admin.initializeApp(); }

/** Trim BOM/whitespace from env values */
const sanitize = (s) => (s ?? "").replace(/^\uFEFF/, "").trim();

/** ---- SendGrid ENV (do NOT throw at module load) ---- */
const SENDGRID_API_KEY = sanitize(process.env.SENDGRID_API_KEY);
const SENDER           = sanitize(process.env.SENDER_EMAIL);

const SENDGRID_READY =
  !!SENDGRID_API_KEY &&
  SENDGRID_API_KEY.startsWith("SG.") &&
  !!SENDER;

if (SENDGRID_READY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
  console.log("[sendEmail] SendGrid ready. Sender:", SENDER);
} else {
  console.warn("[sendEmail] SendGrid NOT ready.",
    "hasKey:", !!SENDGRID_API_KEY,
    "startsWithSG:", !!SENDGRID_API_KEY && SENDGRID_API_KEY.startsWith("SG."),
    "hasSender:", !!SENDER
  );
}

/** Minimal CORS for local dev */
function setCors(res) {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
}

/** Parse & verify Authorization: Bearer <ID_TOKEN> */
async function requireAuth(req) {
  const h = req.headers["authorization"] || "";
  const m = h.match(/^Bearer\s+(.+)$/i);
  if (!m) {
    const err = new Error("Missing Authorization Bearer token");
    err.status = 401;
    throw err;
  }
  const idToken = m[1];
  return admin.auth().verifyIdToken(idToken, true); // { uid, email, ... }
}

exports.sendEmail = onRequest({ cors: false }, async (req, res) => {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(204).send(); // preflight
  if (req.method !== "POST")   return res.status(405).send("Use POST");

  try {
    // 0) Config guard inside handler (soft fail instead of crashing at load)
    if (!SENDGRID_READY) {
      return res.status(500).json({
        ok: false,
        error:
          "SendGrid not configured. Set SENDGRID_API_KEY (starts with 'SG.') and SENDER_EMAIL in functions/.env.local",
      });
    }

    // 1) Auth
    const auth = await requireAuth(req);

    // 2) Body
    const {
      to,
      subject = "No subject",
      text,
      html,
      attachmentBase64,
      attachmentFilename = "attachment.bin",
      attachmentType = "application/octet-stream",
    } = req.body || {};

    if (!to) {
      return res.status(400).json({ ok: false, error: "Missing 'to' field" });
    }

    // 3) Build message
    const msg = {
      to,                    // can be string or array; SendGrid supports both
      from: SENDER,
      subject,
      text,
      html,
    };

    if (attachmentBase64) {
      const trimmed = String(attachmentBase64).trim();
      if (/^data:.*;base64,/.test(trimmed)) {
        return res.status(400).json({
          ok: false,
          error:
            "attachmentBase64 should be raw base64 WITHOUT the 'data:*;base64,' prefix",
        });
      }
      msg.attachments = [
        {
          content: trimmed,
          filename: attachmentFilename,
          type: attachmentType,
          disposition: "attachment",
        },
      ];
    }

    // 4) Send via SendGrid
    await sgMail.send(msg);

    // 5) Audit log
    console.log(
      "Email sent by",
      auth.uid,
      auth.email || "(no email)",
      "->",
      to,
      subject
    );

    return res.status(200).json({ ok: true, from: SENDER, byUid: auth.uid });
  } catch (err) {
    const status = Number(err.status || err.code || 500);
    const detail = err?.response?.body || err?.message || String(err);
    console.error("sendEmail error:", detail);
    return res.status(status).json({ ok: false, error: detail });
  }
});


exports.onUserCreateProfile = functions.auth.user().onCreate(async (user) => {
  const { uid, email, displayName } = user;

  await admin.firestore().doc(`users/${uid}`).set(
    {
      email: email || null,
      displayName: displayName || null,
      role: "user", // default role
      createdAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  console.log("[onUserCreateProfile] profile created for", uid, email);
});
