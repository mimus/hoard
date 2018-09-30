import Vue from 'vue'
import utils from '../utils'
import storeUtils from './storeUtils'

var { loadDate, commonFindNextId } = storeUtils

var storeModule = {

  state: {
    tradeEvents: [],
    tradeEventsById: {}
  },

  mutations: {
    addTradeEvent (state, model) {
      state.tradeEvents.push(model)
      Vue.set(state.tradeEventsById, model.id, model)
    },

    loadTradeEvents (state, events) {
      state.tradeEvents = events
      events.forEach(x => {
        Vue.set(state.tradeEventsById, x.id, x)
      })
    }
  },

  actions: {
    addTradeEvent ({ commit, getters }, model) {
      var id = model.id
      if (id && getters.tradeEvent(id)) {
        console.error('Trade event already exists with this id', id)
        return
      }
      model = {
        id: id,
        date: model.date,
        label: model.label,
        comments: model.comments,
        fees: model.fees,
        disposed: model.disposed,
        acquired: model.acquired
      }
      commit('addTradeEvent', model)
    },

    loadTradeEvents ({ commit }, events) {
      events = [].concat(events)
      events = loadDate(events)
      events.forEach(x => {
        [...x.fees, ...x.disposed, ...x.acquired].forEach(item => {
          item.amount = utils.newBigNumberForAsset(item.amount, item.asset)
        })
      })
      events.sort(utils.dateComparatorEarliestFirst)
      commit('loadTradeEvents', events)
    },

    importTradeEvents ({ dispatch }, data) {
      dispatch('loadTradeEvents', data.tradeEvents)
    },

    addTrade ({ state, getters, commit, dispatch }, { date, label, comments, disposed, acquired, fees }) {
      return new Promise((resolve, reject) => {
        if (!(date instanceof Date) || !label || !disposed || !acquired || !fees) {
          return reject(new Error('Not enough info provided'))
        }

        // Use negative amounts to represent assets leaving a location (disposed & fees)

        disposed = disposed.map(x =>
          Object.assign({}, {
            asset: x.asset,
            location: x.id,
            comments: x.comments,
            type: 'disposed',
            amount: utils.newBigNumberForAsset(x.amount, x.asset).negated(),
            valueGBP: utils.newBigNumberForFiat(x.valueGBP)
          })
        )
        acquired = acquired.map(x =>
          Object.assign({}, {
            asset: x.asset,
            location: x.id,
            comments: x.comments,
            type: 'acquired',
            amount: utils.newBigNumberForAsset(x.amount, x.asset),
            valueGBP: utils.newBigNumberForFiat(x.valueGBP)
          })
        )
        fees = fees.map(x =>
          Object.assign({}, {
            asset: x.asset,
            location: x.id,
            comments: x.comments,
            type: 'fees',
            amount: utils.newBigNumberForAsset(x.amount, x.asset).negated(),
            valueGBP: utils.newBigNumberForFiat(0)
          })
        )

        var locations = disposed.concat(acquired).concat(fees)
        if (!locations.every(x => getters.asset(x.asset) && getters.location(x.location))) {
          return reject(new Error('Asset or Location not found'))
        }
        if (locations.find(x => x.amount.isNaN())) {
          return reject(new Error('Location has invalid amount'))
        }
        if (disposed.concat(acquired).find(x => (x.valueGBP.isNaN() || x.valueGBP.lt(0)))) {
          return reject(new Error('Location has invalid GBP value'))
        }

        var eventId = getters.nextTradeEventId()

        locations.forEach(x => {
          x.linked = []
          var locationEntry = {
            id: getters.nextLocationLedgerEntryId(),
            date,
            location: x.location,
            amount: x.amount,
            label,
            comments: x.comments,
            linked: [{ type: 'tradeEvent', id: eventId }]
          }
          x.linked.push({ type: 'locationLedgerEntry', id: locationEntry.id })
          dispatch('addLocationLedgerEntry', locationEntry)

          var assetLedgerType = x.type === 'acquired' ? 'acquisition' : 'disposal'
          var assetEntry = {
            id: getters.nextAssetLedgerEntryId(),
            date,
            type: assetLedgerType,
            assetValueGBP: x.valueGBP,
            asset: x.asset,
            amount: x.amount,
            label,
            comments: x.comments,
            linked: [{ type: 'tradeEvent', id: eventId }]
          }
          x.linked.push({ type: 'assetLedgerEntry', id: assetEntry.id })
          dispatch('addAssetLedgerEntry', assetEntry)
        })

        // When storing the event, use positive amounts for everything
        var event = {
          id: eventId,
          date,
          label,
          comments,
          fees: fees.map(x => ({ asset: x.asset, amount: x.amount.negated(), comments: x.comments, linked: x.linked })),
          disposed: disposed.map(x => ({ asset: x.asset, amount: x.amount.negated(), comments: x.comments, linked: x.linked })),
          acquired: acquired.map(x => ({ asset: x.asset, amount: x.amount, comments: x.comments, linked: x.linked }))
        }
        dispatch('addTradeEvent', event)

        resolve()
      })
    }
  },

  getters: {
    tradeEvents: (state) => state.tradeEvents,
    tradeEvent: (state, getters) => (eventId) => {
      eventId = +eventId
      return state.tradeEventsById[eventId]
    },
    nextTradeEventId: (state) => commonFindNextId(state.tradeEventsById),
    tradeEventsDataForExport: (state) => ({
      tradeEvents: state.tradeEvents
    })
  }
}

export default storeModule
