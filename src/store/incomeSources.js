import Vue from 'vue'
import storeUtils from './storeUtils'

var { commonFindNextId, commonUpdateModel } = storeUtils

var storeModule = {

  state: {
    incomeSources: [],
    incomeSourcesById: {}
  },

  mutations: {
    addIncomeSource (state, source) {
      state.incomeSources.push(source)
      Vue.set(state.incomeSourcesById, source.id, source)
    },

    updateIncomeSource (state, model) {
      commonUpdateModel(model, state.incomeSourcesById)
    },

    loadIncomeSources (state, sources) {
      state.incomeSources = sources
      state.incomeSourcesById = {}
      sources.forEach(x => {
        Vue.set(state.incomeSourcesById, x.id, x)
      })
    }
  },

  actions: {
    addIncomeSource ({ commit, getters }, source) {
      source = {
        id: getters.nextIncomeSourceId(),
        label: source.label,
        originalAsset: source.originalAsset,
        originalLocation: source.originalLocation,
        incomeAsset: source.incomeAsset,
        incomeLocation: source.incomeLocation,
        comments: source.comments
      }
      commit('addIncomeSource', source)
    },
    updateIncomeSource ({ commit }, source) {
      commit('updateIncomeSource', source)
    },
    loadIncomeSources ({ commit }, sources) {
      sources = [].concat(sources)
      sources.sort((a, b) => a.label.toLowerCase().localeCompare(b.label.toLowerCase()))
      commit('loadIncomeSources', sources)
    },
    importIncomeSources ({ dispatch }, data) {
      dispatch('loadIncomeSources', data.incomeSources)
    }
  },

  getters: {
    incomeSourceBreadcrumbLabel: (state, getters) => (sourceId) => {
      var source = getters.incomeSource(sourceId)
      return source && source.label
    },
    incomeSources: (state) => state.incomeSources,
    incomeSource: (state, getters) => (sourceId) => {
      sourceId = +sourceId
      return state.incomeSourcesById[sourceId]
    },
    nextIncomeSourceId: (state) => commonFindNextId(state.incomeSourcesById),
    incomeSourcesDataForExport: (state) => ({
      incomeSources: state.incomeSources
    })
  }
}

export default storeModule
