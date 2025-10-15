// functions/index.js
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env.local") });

/** v2 https for onRequest (keep your existing HTTP function) */
const { onRequest } = require("firebase-functions/v2/https");

/** v1 entry for Auth trigger — try subpath first, fallback to main */
let functions;
try {
  // Newer packages expose v1 APIs under this subpath
  functions = require("firebase-functions/v1");
  console.log("[bootstrap] using firebase-functions/v1");
} catch (e) {
  // Older packages export v1 APIs from the main entry
  functions = require("firebase-functions");
  console.log("[bootstrap] using firebase-functions (legacy entry)");
}

const admin = require("firebase-admin");
const sgMail = require("@sendgrid/mail");
// ✅ NEW: FieldValue from admin/firestore (for serverTimestamp)
const { FieldValue } = require("firebase-admin/firestore");

// Initialize Firebase Admin 
try { admin.app(); } catch { admin.initializeApp(); }

/** Sanitize env values: strip BOM and surrounding whitespace */
const sanitize = (s) => (s ?? "").replace(/^\uFEFF/, "").trim();

// ---- SendGrid email  ----
const SENDGRID_API_KEY = sanitize(process.env.SENDGRID_API_KEY);
const SENDER = sanitize(process.env.SENDER_EMAIL);

console.log("[sendEmail] API key startsWith SG?:", !!SENDGRID_API_KEY && SENDGRID_API_KEY.startsWith("SG."));
console.log("[sendEmail] API key length:", (SENDGRID_API_KEY || "").length);
console.log("[sendEmail] Sender set?:", !!SENDER);

if (!SENDGRID_API_KEY || !SENDGRID_API_KEY.startsWith("SG.")) {
  throw new Error("Invalid SENDGRID_API_KEY in functions/.env.local (must start with 'SG.').");
}
if (!SENDER) throw new Error("SENDER_EMAIL is not set in functions/.env.local.");

sgMail.setApiKey(SENDGRID_API_KEY);

// Simple CORS for local development 
function setCors(res) {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
}

// Parse and validate Authorization: Bearer <ID_TOKEN> 
async function requireAuth(req) {
  const h = req.headers["authorization"] || "";
  const m = h.match(/^Bearer\s+(.+)$/i);
  if (!m) throw Object.assign(new Error("Missing Authorization Bearer token"), { status: 401 });
  const idToken = m[1];
  const decoded = await admin.auth().verifyIdToken(idToken, true);
  return decoded; // { uid, email, ... }
}

// ======================= HTTP: sendEmail  =======================
exports.sendEmail = onRequest({ cors: false }, async (req, res) => {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(204).send(); // CORS preflight
  if (req.method !== "POST") return res.status(405).send("Use POST");

  try {
    // 1) Auth: require a signed-in user
    const auth = await requireAuth(req);

    // 2) Read request body
    const {
      to,
      subject = "No subject",
      text,
      html,
      attachmentBase64,
      attachmentFilename = "attachment.bin",
      attachmentType = "application/octet-stream",
    } = req.body || {};

    if (!to) return res.status(400).json({ ok: false, error: "Missing 'to' field" });

    // 3) Build the email
    const msg = { to, from: SENDER, subject, text, html };

    if (attachmentBase64) {
      const trimmed = String(attachmentBase64).trim();
      if (/^data:.*;base64,/.test(trimmed)) {
        return res.status(400).json({
          ok: false,
          error: "attachmentBase64 should be raw base64 WITHOUT 'data:*;base64,' prefix",
        });
      }
      msg.attachments = [{
        content: trimmed,
        filename: attachmentFilename,
        type: attachmentType,
        disposition: "attachment",
      }];
    }

    // 4) Send via SendGrid
    await sgMail.send(msg);

    // 5) Audit log
    console.log("Email sent by", auth.uid, auth.email || "(no email)", "->", to, subject);
    return res.status(200).json({ ok: true, from: SENDER, byUid: auth.uid });
  } catch (err) {
    const status = err.status || 500;
    const detail = err?.response?.body || err?.message || err;
    console.error("sendEmail error:", detail);
    return res.status(status).json({ ok: false, error: detail });
  }
});


// ======================= v1 Auth Trigger: create user profile =======================
exports.onUserCreateProfile = functions.auth.user().onCreate(async (user) => {
  const { uid, email, displayName } = user;

  await admin.firestore().doc(`users/${uid}`).set({
    email: email || null,
    displayName: displayName || null,
    role: "user", // default role
    // ✅ use FieldValue from admin/firestore
    createdAt: FieldValue.serverTimestamp(),
  }, { merge: true });

  console.log("[onUserCreateProfile] profile created for", uid, email);
});
