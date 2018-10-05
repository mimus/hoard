import Vue from 'vue'
import storeUtils from './storeUtils'

var { timezoneString, commonFindNextId, commonUpdateModel } = storeUtils

var startDateComparatorEarliestFirst = (a, b) => a.startDate - b.startDate

var storeModule = {

  state: {
    taxYears: [],
    taxYearsById: {}
  },

  mutations: {
    addTaxYear (state, taxYear) {
      state.taxYears.push(taxYear)
      state.taxYears.sort(startDateComparatorEarliestFirst)
      Vue.set(state.taxYearsById, taxYear.id, taxYear)
    },

    updateTaxYear (state, taxYear) {
      commonUpdateModel(taxYear, state.taxYearsById)
      state.taxYears.sort(startDateComparatorEarliestFirst)
    },

    loadTaxYears (state, taxYears) {
      taxYears.sort(startDateComparatorEarliestFirst)
      state.taxYears = taxYears
      state.taxYearsById = {}
      taxYears.forEach(x => {
        Vue.set(state.taxYearsById, x.id, x)
      })
    }
  },

  actions: {
    addTaxYear ({ commit, getters }, taxYear) {
      var id = getters.nextTaxYearId()
      taxYear = Object.assign(
        {},
        taxYear,
        {
          id,
          startDate: new Date(`${taxYear.startDate} 00:00:00 ${timezoneString}`),
          endDate: new Date(`${taxYear.endDate} 23:59:00 ${timezoneString}`)
        }
      )
      commit('addTaxYear', taxYear)
    },
    updateTaxYear ({ commit }, taxYear) {
      taxYear = Object.assign(
        {},
        taxYear,
        {
          startDate: new Date(`${taxYear.startDate} 00:00:00 ${timezoneString}`),
          endDate: new Date(`${taxYear.endDate} 23:59:00 ${timezoneString}`)
        }
      )
      commit('updateTaxYear', taxYear)
    },
    loadTaxYears ({ commit }, taxYears) {
      taxYears = taxYears.map(x => {
        return Object.assign(
          x,
          {
            startDate: new Date(x.startDate),
            endDate: new Date(x.endDate)
          }
        )
      })
      commit('loadTaxYears', taxYears)
    },
    importTaxYears ({ dispatch }, data) {
      dispatch('loadTaxYears', data.taxYears)
    }
  },

  getters: {
    taxYearBreadcrumbLabel: (state, getters) => (taxYearId) => {
      var year = getters.taxYear(taxYearId)
      return year && year.label
    },
    taxYears: (state) => state.taxYears,
    taxYear: (state, getters) => (taxYearId) => {
      taxYearId = +taxYearId
      return state.taxYearsById[taxYearId]
    },
    nextTaxYearId: (state) => commonFindNextId(state.taxYearsById),
    taxYearDataForExport: (state) => ({
      taxYears: state.taxYears
    })
  }
}

export default storeModule
