import Vue from 'vue'
import utils from '../utils'
import storeUtils from './storeUtils'

var { loadDate, commonFindNextId } = storeUtils

const DEFAULT_SOURCE_ID = -1

var storeModule = {

  state: {
    incomeEvents: [],
    incomeEventsById: {},
    incomeEventsBySource: {}
  },

  mutations: {
    addIncomeEvent (state, model) {
      state.incomeEvents.push(model)
      state.incomeEvents.sort(utils.dateComparatorEarliestFirst)
      Vue.set(state.incomeEventsById, model.id, model)
      const sourceKey = model.source ? model.source : DEFAULT_SOURCE_ID
      if (!state.incomeEventsBySource[sourceKey]) {
        Vue.set(state.incomeEventsBySource, sourceKey, [])
      }
      var eventsForSource = state.incomeEventsBySource[sourceKey]
      eventsForSource.push(model)
      eventsForSource.sort(utils.dateComparatorEarliestFirst)
    },

    loadIncomeEvents (state, events) {
      events.sort(utils.dateComparatorEarliestFirst)
      state.incomeEvents = events
      state.incomeEventsById = {}
      events.forEach(x => {
        Vue.set(state.incomeEventsById, x.id, x)
        const sourceKey = x.source ? x.source : DEFAULT_SOURCE_ID
        if (!state.incomeEventsBySource[sourceKey]) {
          Vue.set(state.incomeEventsBySource, sourceKey, [])
        }
        state.incomeEventsBySource[sourceKey].push(x)
      })
    },

    addIncomeSource (state, source) {
      // initialize storage for income events
      if (!state.incomeEventsBySource[source.id]) {
        Vue.set(state.incomeEventsBySource, source.id, [])
      }
    },

    loadIncomeSources (state, sources) {
      state.incomeEventsBySource = {}
      sources.forEach(x => {
        // initialize storage for income events
        if (!state.incomeEventsBySource[x.id]) {
          Vue.set(state.incomeEventsBySource, x.id, [])
        }
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
        source = source ? +source : null
        if (source && !getters.incomeSource(source)) {
          return reject(new Error('Income Source not found'))
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
    incomeEvent: (state, getters) => (eventId) => {
      eventId = +eventId
      return state.incomeEventsById[eventId]
    },
    nextIncomeEventId: (state) => commonFindNextId(state.incomeEventsById),
    incomeEventsForSource: (state, getters) => (sourceId) => {
      sourceId = +sourceId
      return state.incomeEventsBySource[sourceId]
    },
    incomeSourceSummary: (state, getters) => (sourceId) => {
      var events = getters.incomeEventsForSource(sourceId) || []
      var source = getters.incomeSource(sourceId)
      const asset = source.incomeAsset ? getters.asset(source.incomeAsset) : null
      if (!asset) {
        return {
          events: events.length,
          asset: null,
          total: null
        }
      }
      return {
        events: events.length,
        asset,
        total: events.reduce((total, { amount }) => total.plus(amount), utils.newBigNumberForAsset(0, asset.id))
      }
    },
    incomeSourcesSummary: (state, getters) => {
      return getters.incomeSources.map(
        source => ({
          ...source,
          ...getters.incomeSourceSummary(source.id)
        })
      )
    },
    incomeEventsDataForExport: (state) => ({
      incomeEvents: state.incomeEvents
    })
  }
}

export default storeModule