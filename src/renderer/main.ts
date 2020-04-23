import Vue from 'vue'
import App from './App.vue'
import router from './router'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import './assets/css/index.scss'
import RendererIpcService from '@/services/ipc/renderIpcService'
import { defaultConsoleLogService } from '@/services/log/LogService'

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
// @ts-ignore
window.$IPC = Vue.prototype.$IPC = new RendererIpcService()
Vue.prototype.$log = defaultConsoleLogService

Vue.use(ElementUI)
Vue.config.productionTip = false
/* eslint-disable no-new */
new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
