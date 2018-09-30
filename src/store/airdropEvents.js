import Vue from 'vue'
import utils from '../utils'
import storeUtils from './storeUtils'

var { loadDate, commonFindNextId } = storeUtils

var storeModule = {

  state: {
    airdropEvents: [],
    airdropEventsById: {}
  },

  mutations: {
    addAirdropEvent (state, model) {
      state.airdropEvents.push(model)
      Vue.set(state.airdropEventsById, model.id, model)
    },

    loadAirdropEvents (state, events) {
      state.airdropEvents = events
      events.forEach(x => {
        Vue.set(state.airdropEventsById, x.id, x)
      })
    }
  },

  actions: {
    addAirdropEvent ({commit}, model) {
      commit('addAirdropEvent', model)
    },

    loadAirdropEvents ({commit}, events) {
      events = [].concat(events)
      events = loadDate(events)
      events.forEach(x => {
        x.amount = utils.newBigNumberForAsset(x.amount, x.asset)
        x.assetValueGBP = utils.newBigNumberForFiat(x.assetValueGBP)
      })
      events.sort(utils.dateComparatorEarliestFirst)
      commit('loadAirdropEvents', events)
    },

    importAirdropEvents ({dispatch}, data) {
      dispatch('loadAirdropEvents', data.airdropEvents)
    },

    addAirdrop ({state, commit, getters, dispatch}, {asset, amount, assetValueGBP, date, location, label, comments, originalAsset, originalLocation, externalAssetLinks}) {
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
          return reject(new Error('Can only airdrop non-fiat'))
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

        var eventId = getters.nextAirdropEventId()
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
          date,
          label,
          asset,
          assetValueGBP,
          amount,
          comments,
          originalLinked: originalLinked,
          linked: [
            { type: 'assetLedgerEntry', id: assetEntryId },
            { type: 'locationLedgerEntry', id: locationEntryId }
          ],
          externalAssetLinks
        }
        dispatch('addAirdropEvent', event)

        var assetEntry = {
          id: assetEntryId,
          date,
          type: 'acquisition',
          assetValueGBP,
          asset,
          amount,
          label,
          comments,
          linked: [ { type: 'airdropEvent', id: eventId } ]
        }
        dispatch('addAssetLedgerEntry', assetEntry)

        var locationEntry = {
          id: locationEntryId,
          date,
          location,
          amount,
          label,
          comments,
          linked: [ { type: 'airdropEvent', id: eventId } ]
        }
        dispatch('addLocationLedgerEntry', locationEntry)

        resolve()
      })
    }
  },

  getters: {
    airdropEvents: (state) => state.airdropEvents,
    airdropEvent: (state, getters) => (eventId) => {
      eventId = +eventId
      return state.airdropEventsById[eventId]
    },
    nextAirdropEventId: (state) => commonFindNextId(state.airdropEventsById),
    airdropEventsDataForExport: (state) => ({
      airdropEvents: state.airdropEvents
    })
  }
}

export default storeModule
