<template>
  <main class="container mt-4" style="max-width:720px">
    <h2 class="mb-3">Send Email with Attachment</h2>

    <!-- To -->
    <div class="mb-3">
      <label class="form-label">To (comma separated)</label>
      <input
        v-model.trim="to"
        type="text"
        class="form-control"
        placeholder="alice@example.com, bob@example.com"
      />
      <div class="form-text">You can enter one or more emails separated by commas.</div>
    </div>

    <!-- Reply-To (optional) -->
    <div class="mb-3">
      <label class="form-label">Reply-To (optional)</label>
      <input
        v-model.trim="replyTo"
        type="email"
        class="form-control"
        placeholder="your-reply@example.com"
      />
    </div>

    <!-- Subject -->
    <div class="mb-3">
      <label class="form-label">Subject</label>
      <input
        v-model.trim="subject"
        type="text"
        class="form-control"
        placeholder="Subject"
      />
    </div>

    <!-- Body -->
    <div class="mb-3">
      <label class="form-label">Message</label>
      <textarea
        v-model="body"
        rows="5"
        class="form-control"
        placeholder="Type your message here..."
      ></textarea>
    </div>

    <!-- Attachment -->
    <div class="mb-3">
      <label class="form-label">Attachment (optional)</label>
      <input ref="fileEl" type="file" class="form-control" />
      <div class="form-text">Any file type is supported. It will be sent as a single attachment.</div>
    </div>

    <!-- Actions -->
    <button class="btn btn-primary" :disabled="sending" @click="send">
      <span v-if="sending" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
      {{ sending ? 'Sending…' : 'Send' }}
    </button>

    <!-- Result -->
    <div class="mt-3">
      <div class="small text-muted">Result</div>
      <pre class="p-2 bg-light rounded" style="white-space:pre-wrap">{{ result }}</pre>
    </div>
  </main>
</template>

<script setup>
// Email sender page (D.2) - works with Emulator in dev and Cloud Functions in prod
// IMPORTANT: set VITE_API_BASE in .env.development / .env.production
//
// .env.development
// VITE_API_BASE=http://127.0.0.1:5001/<YOUR_PROJECT_ID>/us-central1
//
// .env.production
// VITE_API_BASE=https://us-central1-<YOUR_PROJECT_ID>.cloudfunctions.net
//
// Then the endpoint is `${VITE_API_BASE}/sendEmail`

import { ref } from 'vue'
import { auth } from '@/lib/firebase'

// Form state
const to = ref('')
const replyTo = ref('')
const subject = ref('Assignment Test')
const body = ref('Hello from Firebase Auth + Functions.')
const fileEl = ref(null)

// UI state
const result = ref('Waiting…')
const sending = ref(false)

// Base URL from env; NEVER hardcode localhost here.
const API_BASE = import.meta.env.VITE_API_BASE

// Convert File -> raw base64 string (no data: prefix)
async function fileToBase64(file) {
  const buf = await file.arrayBuffer()
  let binary = ''
  const bytes = new Uint8Array(buf)
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
  return btoa(binary)
}

// Basic email format check (very lenient)
function looksLikeEmail(s) {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s)
}

// Split "To" field by comma into an array, trim, and filter empties
function parseRecipients(raw) {
  return (raw || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
}

async function send() {
  // Guard: auth
  const user = auth.currentUser
  if (!user) {
    result.value = 'Please login first.'
    return
  }

  // Guard: API base configured
  if (!API_BASE) {
    result.value = 'VITE_API_BASE is missing. Check your .env.development / .env.production.'
    return
  }

  // Parse and validate recipients
  const recipients = parseRecipients(to.value)
  if (!recipients.length) {
    result.value = 'Please enter at least one recipient email.'
    return
  }
  // Optional: warn if any address looks invalid (but still send)
  const invalids = recipients.filter(r => !looksLikeEmail(r))
  if (invalids.length) {
    result.value = `Warning: some emails may be invalid: ${invalids.join(', ')}`
  }

  try {
    sending.value = true
    const idToken = await user.getIdToken()

    // Build payload accepted by your Cloud Function
    const payload = {
      to: recipients.length === 1 ? recipients[0] : recipients, // SendGrid supports string or array
      subject: subject.value || 'No subject',
      text: body.value || '',
      // html: you can also send an HTML version if needed
    }

    // Optional: Reply-To header (your CF can forward this to SendGrid)
    if (replyTo.value && looksLikeEmail(replyTo.value)) {
      payload.replyTo = replyTo.value
    }

    // Attachment (optional)
    const f = fileEl.value?.files?.[0]
    if (f) {
      payload.attachmentBase64 = await fileToBase64(f)
      payload.attachmentFilename = f.name
      payload.attachmentType = f.type || 'application/octet-stream'
    }

    // Call the HTTPS function with Bearer token
    const res = await fetch(`${API_BASE}/sendEmail`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
      },
      body: JSON.stringify(payload)
    })

    // Show raw text body for transparency (good for demo/marking)
    const txt = await res.text()
    result.value = `HTTP ${res.status}\n${txt}`
  } catch (e) {
    result.value = 'Error: ' + (e?.message || String(e))
  } finally {
    sending.value = false
  }
}
</script>
