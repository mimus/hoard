import Vue from 'vue'
import Vuex from 'vuex'

import taxYears from './taxYears'
import assets from './assets'
import locations from './locations'
import miningPools from './miningPools'
import miningEvents from './miningEvents'
import depositEvents from './depositEvents'
import incomeEvents from './incomeEvents'
import transferEvents from './transferEvents'
import tradeEvents from './tradeEvents'
import cgt from './cgt'
import persistence from './persistence'
import breadcrumbs from './breadcrumbs'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    breadcrumbs,
    taxYears,
    assets,
    locations,
    miningPools,
    miningEvents,
    depositEvents,
    incomeEvents,
    transferEvents,
    tradeEvents,
    cgt,
    persistence
  },

  state: {
    message: 'Hi Hoard!'
  },

  mutations: {
  },

  actions: {
  },

  getters: {
  }
})

store.dispatch('initCGT', store)

export default store
