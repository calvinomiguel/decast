import Vue from 'vue'
import App from './App.vue'
import '@/assets/styles/tailwind.css'
import '@/assets/styles/inter.css'
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import Chartkick from 'vue-chartkick'
import ChartJS from 'chart.js'
import router from './router'

Vue.use(Chartkick.use(ChartJS))

library.add(fas)
Vue.component('font-awesome-icon', FontAwesomeIcon)

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
