<template>
  <main class="container mt-4" style="max-width:720px">
    <h2 class="mb-3">Send Email with Attachment</h2>

    <div class="mb-3">
      <label class="form-label">To</label>
      <input v-model.trim="to" type="email" class="form-control" placeholder="to@example.com" />
    </div>

    <div class="mb-3">
      <label class="form-label">Subject</label>
      <input v-model.trim="subject" type="text" class="form-control" placeholder="Subject" />
    </div>

    <div class="mb-3">
      <label class="form-label">Attachment (optional)</label>
      <input ref="fileEl" type="file" class="form-control" />
    </div>

    <button class="btn btn-primary" :disabled="sending" @click="send">Send</button>

    <div class="mt-3">
      <div class="small text-muted">Result</div>
      <pre class="p-2 bg-light rounded">{{ result }}</pre>
    </div>
  </main>
</template>

<script setup>
import { ref } from 'vue'
import { auth } from '@/lib/firebase'

const to = ref('')
const subject = ref('PTV Assignment Test')
const fileEl = ref(null)
const result = ref('Waiting...')
const sending = ref(false)

const PROJECT_ID = import.meta.env.VITE_PROJECT_ID || 'fit5032-assignmnet3'
const FUNC_URL = `http://127.0.0.1:5001/${PROJECT_ID}/us-central1/sendEmail`

async function fileToBase64(f) {
  const buf = await f.arrayBuffer()
  return btoa(String.fromCharCode(...new Uint8Array(buf))) // 纯 base64
}

const send = async () => {
  try {
    const user = auth.currentUser
    if (!user) { result.value = 'Please login first.'; return }
    const idToken = await user.getIdToken()

    const payload = {
      to: to.value,
      subject: subject.value || 'No subject',
      text: 'Hello from Auth + Functions'
    }

    const f = fileEl.value?.files?.[0]
    if (f) {
      payload.attachmentBase64 = await fileToBase64(f)
      payload.attachmentFilename = f.name
      payload.attachmentType = f.type || 'application/octet-stream'
    }

    sending.value = true
    const res = await fetch(FUNC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + idToken },
      body: JSON.stringify(payload)
    })
    const txt = await res.text()
    result.value = `HTTP ${res.status}\n${txt}`
  } catch (e) {
    result.value = 'Error: ' + (e?.message || e)
  } finally {
    sending.value = false
  }
}
</script>
