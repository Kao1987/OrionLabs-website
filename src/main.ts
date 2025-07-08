import { createApp } from 'vue'
import { createPinia } from 'pinia'

// Bootstrap 5 導入
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import 'bootstrap'

import App from './App.vue'
import router from './router'
import './assets/global.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
