<template>
  <main class="container mt-4" style="max-width:720px">
    <h2 class="mb-3">Send Email with Attachment</h2>

    <!-- Recipient -->
    <div class="mb-3">
      <label class="form-label">To</label>
      <input
        v-model.trim="to"
        type="email"
        class="form-control"
        placeholder="to@example.com"
      />
      <div class="form-text">Use a valid email address.</div>
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

    <!-- Optional message -->
    <div class="mb-3">
      <label class="form-label">Message (optional)</label>
      <textarea
        v-model.trim="message"
        rows="4"
        class="form-control"
        placeholder="Say something..."
      />
    </div>

    <!-- Attachment -->
    <div class="mb-3">
      <label class="form-label">Attachment (optional)</label>
      <input ref="fileEl" type="file" class="form-control" />
      <div class="form-text">
        Max 10 MB. Raw base64 is sent to the API (no data:... prefix).
      </div>
    </div>

    <!-- Actions -->
    <button
      class="btn btn-primary"
      :disabled="sending || !to"
      @click="send"
    >
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

import { ref } from 'vue'
import { auth } from '@/lib/firebase'

const to = ref('')
const subject = ref('Assignment Test')
const message = ref('Hello from the web app.')
const fileEl = ref(null)
const result = ref('Waiting…')
const sending = ref(false)


const PROJECT_ID = import.meta.env.VITE_PROJECT_ID || 'fit5032-assignmnet3'
const API_BASE =
  import.meta.env.VITE_API_BASE ||
  ((location.hostname === 'localhost' || location.hostname === '127.0.0.1')
    ? `http://127.0.0.1:5001/${PROJECT_ID}/us-central1`
    : '/api')

const ENDPOINT = `${API_BASE}/sendEmail`


const NEED_AUTH =
  API_BASE.startsWith('http://127.0.0.1') ||
  API_BASE.includes('cloudfunctions.net')

const MAX_FILE_BYTES = 10 * 1024 * 1024 

async function fileToBase64(file) {
  const buf = await file.arrayBuffer()

  return btoa(String.fromCharCode(...new Uint8Array(buf)))
}

function smartFormat(text) {
  try {
    const obj = JSON.parse(text)
    return JSON.stringify(obj, null, 2)
  } catch {
    return text
  }
}

async function buildHeaders() {
  const headers = { 'Content-Type': 'application/json' }
  if (NEED_AUTH) {
    const user = auth.currentUser
    if (!user) throw new Error('Please login first.')
    const idToken = await user.getIdToken()
    headers['Authorization'] = 'Bearer ' + idToken
  }
  return headers
}



async function send() {
  try {
    if (!to.value) {
      result.value = 'Please enter recipient email.'
      return
    }

   
    const file = fileEl.value?.files?.[0] || null
    if (file && file.size > MAX_FILE_BYTES) {
      result.value = `Attachment too large: ${(file.size / (1024 * 1024)).toFixed(2)} MB (limit 10 MB).`
      return
    }

    sending.value = true
    result.value = 'Sending…'


    const payload = {
      to: to.value,
      subject: subject.value || 'No subject',
      text: message.value || 'Hello from the web app.'
    }

    if (file) {
      payload.attachmentBase64 = await fileToBase64(file)
      payload.attachmentFilename = file.name
      payload.attachmentType = file.type || 'application/octet-stream'
    }

 
    const headers = await buildHeaders()

  
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 15000) 

    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal
    }).catch((e) => {

      throw new Error(e?.name === 'AbortError' ? 'Request timed out.' : (e?.message || 'Network error'))
    })
    clearTimeout(timer)

    const text = await res.text()
    result.value = `HTTP ${res.status}\n${smartFormat(text)}`
  } catch (err) {
    result.value = 'Error: ' + (err?.message || String(err))
  } finally {
    sending.value = false
  }
}
</script>
