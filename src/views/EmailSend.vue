<template>
  <main class="container mt-4" style="max-width:720px">
    <h2 class="mb-3">Send Email with Attachment</h2>

    <div class="mb-3">
      <label class="form-label">To</label>
      <input
        v-model.trim="to"
        type="email"
        class="form-control"
        placeholder="to@example.com"
      />
    </div>

    <div class="mb-3">
      <label class="form-label">Subject</label>
      <input
        v-model.trim="subject"
        type="text"
        class="form-control"
        placeholder="Subject"
      />
    </div>

    <div class="mb-3">
      <label class="form-label">Attachment (optional)</label>
      <input ref="fileEl" type="file" class="form-control" />
    </div>

    <button class="btn btn-primary" :disabled="sending" @click="send">
      {{ sending ? 'Sending…' : 'Send' }}
    </button>

    <div class="mt-3">
      <div class="small text-muted">Result</div>
      <pre class="p-2 bg-light rounded">{{ result }}</pre>
    </div>
  </main>
</template>

<script setup>
import { ref } from 'vue'
import { auth } from '@/lib/firebase'

// ---- UI state ----
const to = ref('')
const subject = ref('Assignment Test')
const fileEl = ref(null)
const result = ref('Waiting…')
const sending = ref(false)

// ---- Build API base (works for both Emulator & Cloudflare Pages) ----
// Priority: VITE_API_BASE -> localhost emulator -> '/api' (Pages Functions)
const PROJECT_ID = import.meta.env.VITE_PROJECT_ID || 'fit5032-assignmnet3'
const API_BASE =
  import.meta.env.VITE_API_BASE ||
  (location.hostname === 'localhost' || location.hostname === '127.0.0.1'
    ? `http://127.0.0.1:5001/${PROJECT_ID}/us-central1`
    : '/api')

const ENDPOINT = `${API_BASE}/sendEmail`

// If using Firebase Functions (emulator or cloudfunctions.net) we send Authorization.
// If using Cloudflare Pages Functions at '/api', we don't.
const NEED_AUTH =
  API_BASE.startsWith('http://127.0.0.1') ||
  API_BASE.includes('cloudfunctions.net')

// ---- helpers ----
async function fileToBase64(file) {
  const buf = await file.arrayBuffer()
  return btoa(String.fromCharCode(...new Uint8Array(buf))) // pure base64
}

// ---- action ----
async function send() {
  try {
    if (!to.value) {
      result.value = 'Please enter recipient email.'
      return
    }

    sending.value = true
    result.value = 'Sending…'

    const payload = {
      to: to.value,
      subject: subject.value || 'No subject',
      text: 'Hello from the web app.'
    }

    const f = fileEl.value?.files?.[0]
    if (f) {
      payload.attachmentBase64 = await fileToBase64(f)
      payload.attachmentFilename = f.name
      payload.attachmentType = f.type || 'application/octet-stream'
    }

    // headers
    const headers = { 'Content-Type': 'application/json' }
    if (NEED_AUTH) {
      const user = auth.currentUser
      if (!user) {
        result.value = 'Please login first.'
        sending.value = false
        return
      }
      const idToken = await user.getIdToken()
      headers['Authorization'] = 'Bearer ' + idToken
    }

    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    })

    const text = await res.text()
    result.value = `HTTP ${res.status}\n${text}`
  } catch (err) {
    result.value = 'Error: ' + (err?.message || String(err))
  } finally {
    sending.value = false
  }
}
</script>
