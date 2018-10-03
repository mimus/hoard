import Vue from 'vue'
import utils from '../utils'
import storeUtils from './storeUtils'

var { loadDate, commonFindNextId } = storeUtils

var storeModule = {

  state: {
    transferEvents: [],
    transferEventsById: {}
  },

  mutations: {
    addTransferEvent (state, model) {
      state.transferEvents.push(model)
      state.transferEvents.sort(utils.dateComparatorEarliestFirst)
      Vue.set(state.transferEventsById, model.id, model)
    },

    loadTransferEvents (state, events) {
      events.sort(utils.dateComparatorEarliestFirst)
      state.transferEvents = events
      state.transferEventsById = {}
      events.forEach(x => {
        Vue.set(state.transferEventsById, x.id, x)
      })
    }
  },

  actions: {
    addTransferEvent ({ getters, commit }, model) {
      var id = model.id
      if (id && getters.transferEvent(id)) {
        console.error('Transfer event already exists with this id', id)
        return
      }
      model = {
        id: id,
        date: model.date,
        label: model.label,
        asset: model.asset,
        amount: model.amount,
        fee: model.fee,
        comments: model.comments,
        from: model.from,
        to: model.to,
        fees: model.fees,
        externalAssetLinks: model.externalAssetLinks
      }
      commit('addTransferEvent', model)
    },

    loadTransferEvents ({ commit }, events) {
      events = [].concat(events)
      events = loadDate(events)
      events.forEach(x => {
        [x, ...x.from, ...x.to, ...x.fees].forEach(item => {
          item.amount = utils.newBigNumberForAsset(item.amount, item.asset)
        })
      })
      commit('loadTransferEvents', events)
    },

    importTransferEvents ({ dispatch }, data) {
      dispatch('loadTransferEvents', data.transferEvents)
    },

    addTransfer ({ state, getters, commit, dispatch }, { asset, amount, date, label, comments, from, to, fee, externalAssetLinks }) {
      return new Promise((resolve, reject) => {
        if (!asset || !amount || !(date instanceof Date) || !label || !from || !to || !fee) {
          return reject(new Error('Not enough info provided'))
        }
        if (!getters.asset(asset)) {
          return reject(new Error('Asset not found'))
        }

        amount = utils.newBigNumberForAsset(amount, asset)
        if (amount.isNaN()) {
          return reject(new Error('Amount is not a number'))
        }

        from = from.map(x => Object.assign({}, { location: x.id, amount: utils.newBigNumberForAsset(x.amount, asset).negated(), type: 'from' }))
        to = to.map(x => Object.assign({}, { location: x.id, amount: utils.newBigNumberForAsset(x.amount, asset), type: 'to' }))
        var locations = from.concat(to)
        if (!locations.every(x => getters.location(x.location))) {
          return reject(new Error('From/To Location not found'))
        }
        if (locations.find(x => x.amount.isNaN())) {
          return reject(new Error('From/To Location has invalid amount'))
        }

        if (fee.amount) {
          fee = Object.assign({}, fee)
          // convert amounts to BigNumber
          fee.amount = utils.newBigNumberForAsset(fee.amount, fee.asset)
          if (fee.amount.isNaN()) {
            return reject(new Error('Fee amount is not a number'))
          }
          // See if there is any fee
          if (!fee.amount.isZero()) {
            // There is a fee, so GBP value is required (may still be zero)
            fee.valueGBP = utils.newBigNumberForFiat(fee.valueGBP)
            if (fee.valueGBP.isNaN()) {
              return reject(new Error('Fee value in GBP is not a number'))
            }
            // Fee can optionally come from a different asset+location
            if (fee.locationId) {
              fee.location = getters.location(fee.locationId)
              if (!fee.location) {
                return reject(new Error('Fee Location not found'))
              }
            }
            // store the asset on the fee
            fee.asset = (fee.location && fee.location.asset) || asset
          }
        }

        var eventId = getters.nextTransferEventId()
        var eventFrom = []
        var eventTo = []
        var eventFees = []

        locations.forEach(x => {
          var locationEntry = {
            id: getters.nextLocationLedgerEntryId(),
            date,
            location: x.location,
            amount: x.amount,
            label,
            comments,
            linked: [{ type: 'transferEvent', id: eventId }]
          }
          var eventItem = x.type === 'from' ? eventFrom : eventTo
          eventItem.push({
            asset,
            amount: x.amount,
            linked: [{ type: 'locationLedgerEntry', id: locationEntry.id }]
          })
          dispatch('addLocationLedgerEntry', locationEntry)
        })

        if (fee.amount.gt(0)) {
          var eventFee = {
            asset: fee.asset,
            amount: fee.amount,
            linked: []
          }

          if (fee.location) {
            var locationEntry = {
              id: getters.nextLocationLedgerEntryId(),
              date,
              location: fee.locationId,
              amount: fee.amount.negated(),
              label: `Transfer Fee: ${label}`,
              comments,
              linked: [{ type: 'transferEvent', id: eventId }]
            }
            eventFee.linked.push({ type: 'locationLedgerEntry', id: locationEntry.id })
            dispatch('addLocationLedgerEntry', locationEntry)
          }

          var assetEntry = {
            id: getters.nextAssetLedgerEntryId(),
            date,
            type: 'disposal',
            assetValueGBP: fee.valueGBP,
            asset: fee.asset,
            amount: fee.amount.negated(),
            label: `Transfer Fee: ${label}`,
            comments,
            linked: [{ type: 'transferEvent', id: eventId }]
          }
          eventFee.linked.push({ type: 'assetLedgerEntry', id: assetEntry.id })
          dispatch('addAssetLedgerEntry', assetEntry)

          eventFees.push(eventFee)
        }

        var event = {
          id: eventId,
          date,
          label,
          asset,
          amount,
          comments,
          from: eventFrom,
          to: eventTo,
          fees: eventFees,
          externalAssetLinks
        }
        dispatch('addTransferEvent', event)

        resolve()
      })
    }
  },

  getters: {
    transferEvents: (state) => state.transferEvents,
    transferEvent: (state, getters) => (eventId) => {
      eventId = +eventId
      return state.transferEventsById[eventId]
    },
    nextTransferEventId: (state) => commonFindNextId(state.transferEventsById),
    transferEventsDataForExport: (state) => ({
      transferEvents: state.transferEvents
    })
  }
}

export default storeModule
