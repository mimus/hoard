import Vue from 'vue'
import Router from 'vue-router'
import store from '@/store'

import dashboard from './dashboard'
import taxYears from './taxYears'
import miningPools from './miningPools'
import assets from './assets'
import locations from './locations'
import income from './income'
import deposits from './deposits'
import transfers from './transfers'
import trades from './trades'

Vue.use(Router)

var router = new Router({
  routes: [
    ...dashboard,
    ...taxYears,
    ...miningPools,
    ...assets,
    ...locations,
    ...income,
    ...deposits,
    ...transfers,
    ...trades
  ]
})

router.afterEach((to, from) => {
  var breadcrumbs = []
  to.matched.forEach(route => {
    var params = to.params
    var text
    var path = route.path
    Object.keys(params).forEach(e => {
      path = path.replace(':' + e, params[e])
    }, this)

    if (route.meta.bcLabel) {
      text = route.meta.bcLabel
    } else if (route.meta.bcGetter) {
      var id = params[route.meta.bcIdParam]
      text = store.getters[route.meta.bcGetter](id)
    }
    if (text) { // nested '' routes shouldn't be included
      breadcrumbs.push({ text, path })
    }
  })

  // Don't link the last breadcrumb
  if (breadcrumbs.length) {
    var last = breadcrumbs[breadcrumbs.length - 1]
    delete last.path
  }

  store.commit('setBreadcrumbs', breadcrumbs)
})

export default router
