import Vue from 'vue'
import storeUtils from './storeUtils'

var { commonFindNextId, commonUpdateModel } = storeUtils

var storeModule = {

  state: {
    miningPools: [],
    miningPoolsById: {}
  },

  mutations: {
    addMiningPool (state, pool) {
      state.miningPools.push(pool)
      Vue.set(state.miningPoolsById, pool.id, pool)
    },

    updateMiningPool (state, model) {
      commonUpdateModel(model, state.miningPoolsById)
    },

    loadMiningPools (state, pools) {
      state.miningPools = pools
      state.miningPoolsById = {}
      pools.forEach(x => {
        Vue.set(state.miningPoolsById, x.id, x)
      })
    }
  },

  actions: {
    addMiningPool ({ commit, getters }, pool) {
      pool = {
        id: getters.nextMiningPoolId(),
        label: pool.label,
        asset: pool.asset,
        comments: pool.comments
      }
      commit('addMiningPool', pool)
    },
    updateMiningPool ({ commit }, pool) {
      commit('updateMiningPool', pool)
    },
    loadMiningPools ({ commit }, pools) {
      pools = [].concat(pools)
      pools.sort((a, b) => a.label.toLowerCase().localeCompare(b.label.toLowerCase()))
      commit('loadMiningPools', pools)
    },
    importMiningPools ({ dispatch }, data) {
      dispatch('loadMiningPools', data.miningPools)
    }
  },

  getters: {
    miningPoolBreadcrumbLabel: (state, getters) => (poolId) => {
      var pool = getters.miningPool(poolId)
      return pool && pool.label
    },
    miningPools: (state) => state.miningPools,
    miningPool: (state, getters) => (poolId) => {
      poolId = +poolId
      return state.miningPoolsById[poolId]
    },
    nextMiningPoolId: (state) => commonFindNextId(state.miningPoolsById),
    miningPoolsDataForExport: (state) => ({
      miningPools: state.miningPools
    })
  }
}

export default storeModule
