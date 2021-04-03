import Vue from 'vue'
import utils from '../utils'
import storeUtils from './storeUtils'

var { loadDate, commonFindNextId } = storeUtils

var storeModule = {

  state: {
    incomeEvents: [],
    incomeEventsById: {}
  },

  mutations: {
    addIncomeEvent (state, model) {
      state.incomeEvents.push(model)
      state.incomeEvents.sort(utils.dateComparatorEarliestFirst)
      Vue.set(state.incomeEventsById, model.id, model)
    },

    loadIncomeEvents (state, events) {
      events.sort(utils.dateComparatorEarliestFirst)
      state.incomeEvents = events
      state.incomeEventsById = {}
      events.forEach(x => {
        Vue.set(state.incomeEventsById, x.id, x)
      })
    }
  },

  actions: {
    addIncomeEvent ({ commit }, model) {
      commit('addIncomeEvent', model)
    },

    loadIncomeEvents ({ commit }, events) {
      events = [].concat(events)
      events = loadDate(events)
      events.forEach(x => {
        x.amount = utils.newBigNumberForAsset(x.amount, x.asset)
        x.assetValueGBP = utils.newBigNumberForFiat(x.assetValueGBP)
      })
      commit('loadIncomeEvents', events)
    },

    importIncomeEvents ({ dispatch }, data) {
      dispatch('loadIncomeEvents', data.incomeEvents)
    },

    addIncome ({ state, commit, getters, dispatch }, { source, asset, amount, assetValueGBP, date, location, label, comments, originalAsset, originalLocation, externalAssetLinks }) {
      return new Promise((resolve, reject) => {
        if (!asset || !amount || !(date instanceof Date) || !location || !label) {
          return reject(new Error('Not enough info provided'))
        }
        if (!getters.location(location)) {
          return reject(new Error('Location not found'))
        }
        if (!getters.asset(asset)) {
          return reject(new Error('Asset not found'))
        }
        if (getters.asset(asset).fiat) {
          return reject(new Error('Can only receive non-fiat income'))
        }
        if (originalAsset) {
          if (!getters.asset(originalAsset)) {
            return reject(new Error('Original Asset not found'))
          }
        }
        if (originalLocation) {
          if (!getters.location(originalLocation)) {
            return reject(new Error('Original Location not found'))
          }
        }
        // Convert amount to a BigNumber
        amount = utils.newBigNumberForAsset(amount, asset)
        if (amount.isNaN()) {
          return reject(new Error('Amount is not a number'))
        }
        assetValueGBP = utils.newBigNumberForFiat(assetValueGBP)
        if (assetValueGBP.isNaN()) {
          return reject(new Error('Asset value in GBP is not a number'))
        }

        var eventId = getters.nextIncomeEventId()
        var assetEntryId = getters.nextAssetLedgerEntryId()
        var locationEntryId = getters.nextLocationLedgerEntryId()

        var originalLinked = []
        if (originalAsset) {
          originalLinked.push({ type: 'asset', id: originalAsset })
        }
        if (originalLocation) {
          originalLinked.push({ type: 'location', id: originalLocation })
        }

        var event = {
          id: eventId,
          source,
          date,
          label,
          asset,
          assetValueGBP,
          amount,
          comments,
          originalLinked,
          linked: [
            { type: 'assetLedgerEntry', id: assetEntryId },
            { type: 'locationLedgerEntry', id: locationEntryId }
          ],
          externalAssetLinks
        }
        dispatch('addIncomeEvent', event)

        var assetEntry = {
          id: assetEntryId,
          date,
          type: 'acquisition',
          assetValueGBP,
          asset,
          amount,
          label,
          comments,
          linked: [ { type: 'incomeEvent', id: eventId } ]
        }
        dispatch('addAssetLedgerEntry', assetEntry)

        var locationEntry = {
          id: locationEntryId,
          date,
          location,
          amount,
          label,
          comments,
          linked: [ { type: 'incomeEvent', id: eventId } ]
        }
        dispatch('addLocationLedgerEntry', locationEntry)

        resolve()
      })
    }
  },

  getters: {
    incomeEvents: (state) => state.incomeEvents,
    incomeEventsForAsset: (state) => (assetId) => {
      return state.incomeEvents.filter(event => event.asset === assetId)
    },
    incomeEventsForSource: (state) => (sourceId) => {
      return state.incomeEvents.filter(event => event.source === sourceId)
    },
    incomeEvent: (state, getters) => (eventId) => {
      eventId = +eventId
      return state.incomeEventsById[eventId]
    },
    nextIncomeEventId: (state) => commonFindNextId(state.incomeEventsById),
    incomeEventsDataForExport: (state) => ({
      incomeEvents: state.incomeEvents
    })
  }
}

export default storeModule
