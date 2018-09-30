import Vue from 'vue'
import utils from '../utils'
import storeUtils from './storeUtils'
import moment from 'moment'

var { loadDate, commonFindNextId } = storeUtils

var storeModule = {

  state: {
    miningEvents: [],
    miningEventsById: {},
    miningEventsByPool: {}
  },

  mutations: {
    addMiningEvent (state, model) {
      state.miningEvents.push(model)
      Vue.set(state.miningEventsById, model.id, model)
      state.miningEventsByPool[model.pool].push(model)
    },

    loadMiningEvents (state, events) {
      state.miningEvents = events
      events.forEach(x => {
        Vue.set(state.miningEventsById, x.id, x)
        if (!x.pool) {
          console.error('Mining Event has unknown pool id')
        }
        if (!state.miningEventsByPool[x.pool]) {
          Vue.set(state.miningEventsByPool[x.pool], [])
        }
        state.miningEventsByPool[x.pool].push(x)
      })
    },

    addMiningPool (state, pool) {
      // initialize storage for mining events
      if (!state.miningEventsByPool[pool.id]) {
        Vue.set(state.miningEventsByPool, pool.id, [])
      }
    },

    loadMiningPools (state, miningPools) {
      miningPools.forEach(x => {
        // initialize storage for mining events
        if (!state.miningEventsByPool[x.id]) {
          Vue.set(state.miningEventsByPool, x.id, [])
        }
      })
    }
  },

  actions: {
    addMiningEvent ({ commit, getters }, model) {
      var id = model.id
      if (id && getters.miningEvent(id)) {
        console.error('Mining event already exists with this id', id)
        return
      }
      commit('addMiningEvent', model)
    },

    loadMiningEvents ({ state, getters, commit }, events) {
      events.forEach(x => {
        var pool = getters.miningPool(x.pool)
        x.amount = utils.newBigNumberForAsset(x.amount, pool && pool.asset)
      })
      events = loadDate(events)
      events.sort(utils.dateComparatorEarliestFirst)
      commit('loadMiningEvents', events)
    },

    importMiningEvents ({ dispatch }, data) {
      dispatch('loadMiningEvents', data.miningEvents)
    },

    addNewMiningEvent ({ state, getters, commit, dispatch }, { pool, date, label, comments, locations, externalAssetLinks }) {
      return new Promise((resolve, reject) => {
        if (!pool || !label || !locations || !(date instanceof Date)) {
          return reject(new Error('Not enough info provided'))
        }
        pool = +pool
        if (!getters.miningPool(pool)) {
          return reject(new Error('Pool not found'))
        }
        var asset = getters.miningPool(pool).asset
        locations = locations.map(x => Object.assign({}, { location: x.id, amount: x.amount, valueGBP: x.valueGBP }))
        if (!locations.every(x => getters.location(x.location))) {
          return reject(new Error('Location not found'))
        }
        locations.forEach(x => {
          x.amount = utils.newBigNumberForAsset(x.amount, asset)
          x.valueGBP = utils.newBigNumberForFiat(x.valueGBP)
        })
        if (locations.find(x => x.amount.isNaN())) {
          return reject(new Error('Location has invalid amount'))
        }
        if (locations.find(x => (x.valueGBP.isNaN() || x.valueGBP.lt(0)))) {
          return reject(new Error('Location has invalid GBP value'))
        }

        var eventId = getters.nextMiningEventId()
        var linked = []
        var totalAmount = utils.newBigNumberForAsset(0, asset)
        var totalValueGBP = utils.newBigNumberForFiat(0)

        locations.forEach(x => {
          totalAmount = totalAmount.plus(x.amount)
          totalValueGBP = totalValueGBP.plus(x.valueGBP)
          var locationEntry = {
            id: getters.nextLocationLedgerEntryId(),
            date,
            location: x.location,
            amount: x.amount,
            label,
            comments,
            linked: [{ type: 'miningEvent', id: eventId }]
          }
          linked.push({ type: 'locationLedgerEntry', id: locationEntry.id })
          dispatch('addLocationLedgerEntry', locationEntry)
        })

        var assetEntry = {
          id: getters.nextAssetLedgerEntryId(),
          date,
          type: 'acquisition',
          assetValueGBP: totalValueGBP,
          asset,
          amount: totalAmount,
          label,
          comments,
          linked: [{ type: 'miningEvent', id: eventId }]
        }
        linked.push({ type: 'assetLedgerEntry', id: assetEntry.id })
        dispatch('addAssetLedgerEntry', assetEntry)

        var event = {
          id: eventId,
          pool,
          date,
          amount: totalAmount,
          label,
          comments,
          linked,
          externalAssetLinks
        }
        dispatch('addMiningEvent', event)

        resolve()
      })
    },
    addNewMiningEvents ({ state, dispatch }, miningEvents) {
      var promises = miningEvents.map(miningEvent => dispatch('addNewMiningEvent', miningEvent))
      return Promise.all(promises)
    }
  },

  getters: {
    miningEvent: (state, getters) => (eventId) => {
      eventId = +eventId
      return state.miningEventsById[eventId]
    },
    nextMiningEventId: (state) => commonFindNextId(state.miningEventsById),
    miningEventsForPool: (state, getters) => (poolId) => {
      poolId = +poolId
      return state.miningEventsByPool[poolId]
    },
    miningPoolTotal: (state, getters) => (poolId) => {
      var events = getters.miningEventsForPool(poolId) || []
      var pool = getters.miningPool(poolId)
      return events.reduce((total, { amount }) => total.plus(amount), utils.newBigNumberForAsset(0, pool && pool.asset))
    },
    miningPoolsSummary: (state, getters) => {
      var pools = getters.miningPools.map(p => {
        var copy = Object.assign({}, p)
        copy.total = getters.miningPoolTotal(copy.id)
        return copy
      })
      return pools
    },
    firstMatchingMiningEvent: (state, getters) => ({ poolId, dateStart, dateEnd, amount, locationId }) => {
      var events = getters.miningEventsForPool(poolId)
      // console.log(`Look for ${amount} on (${dateStart.format()} - ${dateEnd.format()})`, events)
      var pool = getters.miningPool(poolId)
      amount = utils.newBigNumberForAsset(amount, pool && pool.asset)
      return events.find(event => {
        var eventDate = moment(event.date)
        if (amount.eq(event.amount) && eventDate.isBetween(dateStart, dateEnd)) {
          // see if location matches too
          var matchingLocation = event.linked.find(link => {
            if (link.type === 'locationLedgerEntry') {
              var entry = getters.locationLedgerEntry(link.id)
              return entry && entry.location === locationId
            }
          })
          if (matchingLocation) { return true }
        }
      })
    },
    miningEventsDataForExport: (state) => ({
      miningEvents: state.miningEvents
    })
  }
}

export default storeModule
