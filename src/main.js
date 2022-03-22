// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import 'babel-polyfill'
import Vue from 'vue'
import Vuetify from 'vuetify'
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/dist/vuetify.min.css'
import App from './App'
import router from './router'
import store from './store'

import './store/initial_data'

import utils from './utils'
import services, { genericServices } from './services'

window.store = store

// Enable Vue DevTools browser extension even in production
Vue.config.devtools = true

// Set up instance properties available to all Vue instances
Vue.prototype.$services = services
Vue.prototype.$genericServices = genericServices

Vue.use(Vuetify)

Vue.filter('formatAssetValue', utils.formatAssetValue)
Vue.filter('formatFiat', utils.formatFiat)
Vue.filter('formatDate', utils.formatDate)
Vue.filter('formatDateTime', utils.formatDateTime)
Vue.filter('formatDateTimePlain', utils.formatDateTimePlain)

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  vuetify: new Vuetify({
    icons: {
      iconfont: 'mdi'
    }
  }),
  store, // child components will have $store
  router,
  render: h => h(App)
}).$mount('#app')
