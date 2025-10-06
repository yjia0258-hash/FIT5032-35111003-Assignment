import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// Global styles
import 'bootstrap/dist/css/bootstrap.min.css'
import './assets/main.css'
import './style.css'

// Firebase init (from separate file)
import './lib/firebase'

const app = createApp(App)
app.use(router)
app.mount('#app')
