import { createApp } from 'vue'
import { createPinia } from 'pinia'
import axios from "axios";
import VueAxios from "vue-axios"
import App from './App.vue'
import router from './router'
import "bootstrap/dist/js/bootstrap.bundle.min.js";

// API 要求：Header 需帶入 interviewerName（HTTP header 僅支援 ISO-8859-1，中文等字元改為 Base64 編碼）
const rawName = import.meta.env.VITE_INTERVIEWER_NAME ?? ''
const interviewerName =
  rawName === ''
    ? ''
    : typeof btoa !== 'undefined'
      ? btoa(unescape(encodeURIComponent(rawName)))
      : rawName
axios.defaults.headers.common['interviewerName'] = interviewerName

const app = createApp(App)

app.use(createPinia())
app.use(VueAxios,axios)
app.use(router)


app.mount('#app')
