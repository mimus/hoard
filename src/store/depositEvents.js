import Vue from 'vue'
import utils from '../utils'
import storeUtils from './storeUtils'

var { loadDate, commonFindNextId } = storeUtils

var storeModule = {

  state: {
    depositEvents: [],
    depositEventsById: {}
  },

  mutations: {
    addDepositEvent (state, model) {
      state.depositEvents.push(model)
      state.depositEvents.sort(utils.dateComparatorEarliestFirst)
      Vue.set(state.depositEventsById, model.id, model)
    },

    loadDepositEvents (state, events) {
      events.sort(utils.dateComparatorEarliestFirst)
      state.depositEvents = events
      state.depositEventsById = {}
      events.forEach(x => {
        Vue.set(state.depositEventsById, x.id, x)
      })
    }
  },

  actions: {
    addDepositEvent ({ commit, getters }, model) {
      var id = model.id
      if (id && getters.depositEvent(id)) {
        console.error('Deposit event already exists with this id', id)
        return
      }
      model = {
        id: id,
        date: model.date,
        label: model.label,
        asset: model.asset,
        amount: model.amount,
        comments: model.comments,
        linked: model.linked
      }
      commit('addDepositEvent', model)
    },

    loadDepositEvents ({ commit }, events) {
      events = [].concat(events)
      events = loadDate(events)
      events.forEach(x => {
        x.amount = utils.newBigNumberForAsset(x.amount, x.asset)
      })
      commit('loadDepositEvents', events)
    },

    importDepositEvents ({ dispatch }, data) {
      dispatch('loadDepositEvents', data.depositEvents)
    },

    addDeposit ({ state, commit, getters, dispatch }, { asset, amount, date, location, label, comments }) {
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
        if (!getters.asset(asset).fiat) {
          return reject(new Error('Can only deposit fiat'))
        }
        // Convert amount to a BigNumber
        amount = utils.newBigNumberForAsset(amount, asset)
        if (amount.isNaN()) {
          return reject(new Error('Amount is not a number'))
        }

        var eventId = getters.nextDepositEventId()
        var assetEntryId = getters.nextAssetLedgerEntryId()
        var locationEntryId = getters.nextLocationLedgerEntryId()

        var event = {
          id: eventId,
          date,
          label,
          asset,
          amount,
          comments,
          linked: [
            { type: 'assetLedgerEntry', id: assetEntryId },
            { type: 'locationLedgerEntry', id: locationEntryId }
          ]
        }
        dispatch('addDepositEvent', event)

        var assetEntry = {
          id: assetEntryId,
          date,
          type: 'acquisition',
          assetValueGBP: amount,
          asset,
          amount,
          label,
          comments,
          linked: [ { type: 'depositEvent', id: eventId } ]
        }
        dispatch('addAssetLedgerEntry', assetEntry)

        var locationEntry = {
          id: locationEntryId,
          date,
          location,
          amount,
          label,
          comments,
          linked: [ { type: 'depositEvent', id: eventId } ]
        }
        dispatch('addLocationLedgerEntry', locationEntry)

        resolve()
      })
    }
  },

  getters: {
    depositEvents: (state) => state.depositEvents,
    depositEvent: (state, getters) => (eventId) => {
      eventId = +eventId
      return state.depositEventsById[eventId]
    },
    nextDepositEventId: (state) => commonFindNextId(state.depositEventsById),
    depositEventsDataForExport: (state) => ({
      depositEvents: state.depositEvents
    })
  }
}

export default storeModule
