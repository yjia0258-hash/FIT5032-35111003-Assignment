<template>
  <main class="map-page">
    <!-- Top: Controls -->
    <section class="panel">
      <h2 class="title">Trip Planner</h2>

      <!-- Origin search -->
      <div class="field">
        <label>Origin</label>
        <input
          v-model="originQuery"
          @input="debouncedSearch('origin')"
          class="input"
          placeholder="Search origin (e.g., 241 Spring St)"
        />
        <ul v-if="originSuggest.length" class="suggest">
          <li
            v-for="s in originSuggest"
            :key="s.id"
            @click="selectSuggestion('origin', s)"
          >
            {{ s.place_name }}
          </li>
        </ul>
      </div>

      <!-- Destination search -->
      <div class="field">
        <label>Destination</label>
        <input
          v-model="destQuery"
          @input="debouncedSearch('dest')"
          class="input"
          placeholder="Search destination (e.g., Federation Square)"
        />
        <ul v-if="destSuggest.length" class="suggest">
          <li
            v-for="s in destSuggest"
            :key="s.id"
            @click="selectSuggestion('dest', s)"
          >
            {{ s.place_name }}
          </li>
        </ul>
      </div>

      <!-- Mode + actions -->
      <div class="row">
        <div class="col">
          <label>Mode</label>
          <select v-model="mode" class="input">
            <option value="driving">Driving</option>
            <option value="walking">Walking</option>
            <option value="cycling">Cycling</option>
          </select>
        </div>
        <div class="col btns">
          <button class="btn primary" @click="buildRoute" :disabled="!origin || !dest">
            Build Route
          </button>
          <button class="btn" @click="clearAll">Clear</button>
        </div>
      </div>

      <!-- Error message -->
      <p v-if="err" class="err">{{ err }}</p>
    </section>

    <!-- Bottom: Map -->
    <section class="map-wrap">
      <div ref="mapEl" class="map"></div>
    </section>
  </main>
</template>

<script setup>
// Vue core
import { ref, onMounted, onBeforeUnmount } from 'vue'

// Mapbox GL + CSS
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

// Mapbox Geocoding SDK
import mbxSdk from '@mapbox/mapbox-sdk/services/geocoding'

// (Optional) Firestore persistence (kept in case you re-enable "Save Trip" later)
import { getAuth } from 'firebase/auth'
import { getFirestore, doc, setDoc } from 'firebase/firestore'

/** Environment & Mapbox setup */
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || ''
if (!MAPBOX_TOKEN) {
  console.error('VITE_MAPBOX_TOKEN is missing.')
}
mapboxgl.accessToken = MAPBOX_TOKEN

let geocodingClient = null
if (MAPBOX_TOKEN) {
  geocodingClient = mbxSdk({ accessToken: MAPBOX_TOKEN })
}

/** Map & markers */
const mapEl = ref(null)
let map
const routeLayerId = 'route-line'
let originMarker = null
let destMarker = null

/** UI state */
const originQuery = ref('')
const destQuery   = ref('')
const originSuggest = ref([])
const destSuggest   = ref([])
const origin = ref(null) // { name, center: [lng, lat] }
const dest   = ref(null)
const mode   = ref('driving')
const err    = ref('')

// Kept for potential "saveTrip" usage; not shown in UI now
const trip     = ref(null)
const saveMsg  = ref('')
const canSave  = true

/** Debounced geocoding search */
let t1 = 0, t2 = 0
const debouncedSearch = (which) => {
  const t = Date.now()
  if (which === 'origin') {
    t1 = t
    setTimeout(() => t === t1 && search('origin'), 200)
  } else {
    t2 = t
    setTimeout(() => t === t2 && search('dest'), 200)
  }
}

/** Helpers */
const mins = (sec) => Math.round(sec / 60)
const flyTo = (center) => { if (map) map.flyTo({ center, zoom: 14 }) }

function clearRoute() {
  if (!map) return
  if (map.getLayer(routeLayerId)) map.removeLayer(routeLayerId)
  if (map.getSource('route-src')) map.removeSource('route-src')
}

/** Map init */
onMounted(() => {
  if (!MAPBOX_TOKEN) {
    err.value = 'Mapbox token missing. Please set VITE_MAPBOX_TOKEN in .env.local.'
    return
  }

  map = new mapboxgl.Map({
    container: mapEl.value,
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [144.9631, -37.8136], // Melbourne CBD
    zoom: 12
  })

  map.addControl(new mapboxgl.NavigationControl(), 'top-right')

  // Surface token/URL errors to the UI (403/401 etc.)
  map.on('error', (e) => {
    if (e && e.error && e.error.status) {
      console.warn('[mapbox error]', e.error.status, e.error.url || '', e.error.message || '')
      if (e.error.status === 401 || e.error.status === 403) {
        err.value = `Map tiles error (${e.error.status}): check Access token scopes and Allowed URLs.`
      }
    }
  })
})

onBeforeUnmount(() => { if (map) map.remove() })

/** Geocoding search */
async function search(which) {
  try {
    if (!geocodingClient) {
      err.value = 'Mapbox token missing. Set VITE_MAPBOX_TOKEN.'
      return
    }
    err.value = ''
    const q = (which === 'origin' ? originQuery.value : destQuery.value).trim()
    if (!q) {
      if (which === 'origin') originSuggest.value = []
      else destSuggest.value = []
      return
    }
    const resp = await geocodingClient.forwardGeocode({
      query: q,
      limit: 5,
      autocomplete: true,
      countries: ['au']
    }).send()

    const feats = resp.body.features || []
    if (which === 'origin') originSuggest.value = feats
    else destSuggest.value = feats
  } catch (e) {
    err.value = e?.message || 'Search failed.'
  }
}

function setMarker(which, center) {
  if (!map) return
  if (which === 'origin') {
    if (originMarker) originMarker.remove()
    originMarker = new mapboxgl.Marker({ color: '#2563eb' }).setLngLat(center).addTo(map)
  } else {
    if (destMarker) destMarker.remove()
    destMarker = new mapboxgl.Marker({ color: '#ef4444' }).setLngLat(center).addTo(map)
  }
}

function selectSuggestion(which, s) {
  const item = { name: s.place_name, center: s.center }
  if (which === 'origin') {
    origin.value = item
    originQuery.value = item.name
    originSuggest.value = []
  } else {
    dest.value = item
    destQuery.value = item.name
    destSuggest.value = []
    // Clear previous route when destination changes
    trip.value = null
    clearRoute()
  }
  setMarker(which, item.center)
  flyTo(item.center)
}

/** Build route (Mapbox Directions) */
async function buildRoute() {
  if (!origin.value || !dest.value) return
  if (!MAPBOX_TOKEN) {
    err.value = 'Mapbox token missing. Set VITE_MAPBOX_TOKEN.'
    return
  }
  try {
    err.value = ''
    const coords = `${origin.value.center.join(',')};${dest.value.center.join(',')}`
    const profile = mode.value // driving/walking/cycling
    const url = `https://api.mapbox.com/directions/v5/mapbox/${profile}/${coords}?geometries=geojson&steps=true&access_token=${MAPBOX_TOKEN}`

    const resp = await fetch(url)
    if (!resp.ok) throw new Error('Directions API error')
    const data = await resp.json()
    const route = data.routes?.[0]
    if (!route) throw new Error('No route')

    const line = { type: 'Feature', geometry: route.geometry, properties: {} }

    clearRoute()
    map.addSource('route-src', { type: 'geojson', data: line })
    map.addLayer({
      id: routeLayerId,
      type: 'line',
      source: 'route-src',
      paint: { 'line-color': '#1e3a8a', 'line-width': 5 }
    })

    // Fit map to route bounds
    const bounds = new mapboxgl.LngLatBounds()
    route.geometry.coordinates.forEach((c) => bounds.extend(c))
    map.fitBounds(bounds, { padding: 50 })

    // Keep distance/duration for potential future UI or saving
    const steps = []
    ;(route.legs || []).forEach((leg) => {
      (leg.steps || []).forEach((s) => steps.push(s.maneuver?.instruction || ''))
    })

    trip.value = {
      distance: route.distance,
      duration: route.duration,
      steps
    }
  } catch (e) {
    err.value = e?.message || 'Failed to build route'
  }
}

/** Optional: save trip to Firestore (not shown in UI) */
async function saveTrip() {
  try {
    const user = getAuth().currentUser
    if (!user) { err.value = 'Sign in first'; return }
    const db = getFirestore()
    const payload = {
      uid: user.uid,
      mode: mode.value,
      origin: origin.value,
      dest: dest.value,
      trip: trip.value,
      createdAt: new Date().toISOString()
    }
    await setDoc(doc(db, 'trips', crypto.randomUUID()), payload)
    saveMsg.value = 'Trip saved!'
    setTimeout(() => { saveMsg.value = '' }, 1500)
  } catch (e) {
    err.value = e?.message || 'Save failed'
  }
}

/** Clear everything */
function clearAll() {
  origin.value = null
  dest.value = null
  originQuery.value = ''
  destQuery.value = ''
  originSuggest.value = []
  destSuggest.value = []
  trip.value = null

  if (originMarker) { originMarker.remove(); originMarker = null }
  if (destMarker) { destMarker.remove(); destMarker = null }
  clearRoute()
}
</script>

<style scoped>
/* Page layout: controls on top, map at bottom */
.map-page {
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 80px);
  background: #f8fafc;
}

/* Controls panel */
.panel {
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  padding: 16px;
  overflow: auto;
}

.title {
  margin: 0 0 10px;
  font-size: 20px;
  font-weight: 700;
}

/* Inputs */
.field {
  margin-bottom: 14px;
  position: relative;
}
.input {
  width: 100%;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 8px 10px;
}

/* Autocomplete dropdown */
.suggest {
  position: absolute;
  left: 0; right: 0;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-top: 4px;
  z-index: 10;
  max-height: 200px;
  overflow: auto;
}
.suggest li {
  padding: 6px 8px;
  cursor: pointer;
}
.suggest li:hover {
  background: #f3f4f6;
}

/* Row & buttons */
.row { display: flex; gap: 8px; align-items: flex-end; }
.col { flex: 1; }
.btns { display: flex; gap: 6px; flex-wrap: wrap; }
.btn {
  border: 1px solid #d1d5db;
  background: #fff;
  padding: 6px 10px;
  border-radius: 8px;
  cursor: pointer;
}
.btn.primary {
  background: #2563eb;
  color: #fff;
  border-color: #2563eb;
}
.btn:disabled { opacity: 0.6; cursor: not-allowed; }

/* Error text */
.err { color: #b91c1c; margin-top: 10px; }

/* Map container */
.map-wrap { position: relative; height: 420px; }
.map { position: absolute; inset: 0; }

/* Responsive */
@media (max-width: 480px) {
  .map-wrap { height: 320px; }
}
</style>
