import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import 'datatables.net-bs5/css/dataTables.bootstrap5.min.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import './assets/main.css'

import './lib/firebase'

const app = createApp(App)
app.use(router)
app.mount('#app')
