import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './styles/element-plus.scss'
import './styles/theme.scss'
import './styles/scrollbar.scss'
import { THEME_CONFIG } from './config'
const app = createApp(App)
const pinia = createPinia()

app.use(ElementPlus)
app.use(pinia)

// 设置默认主题
document.documentElement.className = `${THEME_CONFIG.defaultTheme}-theme`

app.mount('#app')
