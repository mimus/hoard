import Vue from 'vue'
import utils from '../utils'
import storeUtils from './storeUtils'

var { groupBy, loadDate, commonFindNextId, commonUpdateModel } = storeUtils

var storeModule = {

  state: {
    locationGroups: [],
    locationGroupsById: {},
    locations: [],
    locationsById: {},
    locationsByAsset: {},

    locationLedgerEntries: [],
    locationLedgerEntriesById: {},
    locationLedgerEntriesByLocation: {}
  },

  mutations: {
    addLocationGroup (state, model) {
      state.locationGroups.push(model)
      Vue.set(state.locationGroupsById, model.id, model)
    },

    updateLocationGroup (state, model) {
      commonUpdateModel(model, state.locationGroupsById)
    },

    addLocation (state, model) {
      state.locations.push(model)
      Vue.set(state.locationsById, model.id, model)
      // also add to index of locations by asset
      state.locationsByAsset[model.asset].push(model)
      // also add to group's list of locations
      var group = state.locationGroupsById[model.group]
      if (group) {
        if (!group.locations) {
          Vue.set(group, 'locations', [])
        }
        if (group.locations.indexOf(model.id) === -1) {
          group.locations.push(model.id)
        }
      }
      // initialize storage for ledger entries
      if (!state.locationLedgerEntriesByLocation[model.id]) {
        Vue.set(state.locationLedgerEntriesByLocation, model.id, [])
      }
    },

    updateLocation (state, model) {
      commonUpdateModel(model, state.locationsById)
    },

    addLocationLedgerEntry (state, model) {
      state.locationLedgerEntries.push(model)
      state.locationLedgerEntries.sort(utils.dateComparatorEarliestFirst)
      Vue.set(state.locationLedgerEntriesById, model.id, model)
      var entriesForLocation = state.locationLedgerEntriesByLocation[model.location]
      entriesForLocation.push(model)
      entriesForLocation.sort(utils.dateComparatorEarliestFirst)
    },

    loadLocations (state, locations) {
      state.locations = locations
      state.locationsById = {}
      state.locationLedgerEntriesByLocation = {}
      locations.forEach(x => {
        Vue.set(state.locationsById, x.id, x)
        // also add to index of locations by asset
        state.locationsByAsset[x.asset].push(x)
        // initialize storage for ledger entries
        if (!state.locationLedgerEntriesByLocation[x.id]) {
          Vue.set(state.locationLedgerEntriesByLocation, x.id, [])
        }
      })
    },

    loadLocationGroups (state, locationGroups) {
      state.locationGroups = locationGroups
      state.locationGroupsById = {}
      state.locationGroups.forEach(x => {
        Vue.set(state.locationGroupsById, x.id, x)
      })
      // mark all locations with their parent group
      state.locationGroups.forEach(group => {
        group.locations.forEach(locId => {
          var loc = state.locationsById[locId]
          if (loc) { loc.group = group.id }
        })
      })
    },

    loadLocationLedgerEntries (state, ledgerEntries) {
      ledgerEntries.sort(utils.dateComparatorEarliestFirst)
      state.locationLedgerEntries = ledgerEntries
      state.locationLedgerEntriesById = {}
      ledgerEntries.forEach(entry => {
        Vue.set(state.locationLedgerEntriesById, entry.id, entry)
        if (!state.locationLedgerEntriesByLocation[entry.location]) {
          Vue.set(state.locationLedgerEntriesByLocation, entry.location, [])
        }
        state.locationLedgerEntriesByLocation[entry.location].push(entry)
      })
    },

    addAsset (state, model) {
      // initialize storage for locations
      if (!state.locationsByAsset[model.id]) {
        Vue.set(state.locationsByAsset, model.id, [])
      }
    },

    loadAssets (state, assets) {
      state.locationsByAsset = {}
      assets.forEach(x => {
        // initialize storage for locations
        if (!state.locationsByAsset[x.id]) {
          Vue.set(state.locationsByAsset, x.id, [])
        }
      })
    }
  },

  actions: {
    addLocationGroup ({ commit, getters }, group) {
      group = {
        id: getters.nextLocationGroupId(),
        label: group.label,
        locations: []
      }
      commit('addLocationGroup', group)
    },
    updateLocationGroup ({ commit }, group) {
      commit('updateLocationGroup', group)
    },
    addLocation ({ commit, getters }, model) {
      model = {
        id: getters.nextLocationId(),
        group: +(model.group),
        label: model.label,
        asset: model.asset,
        address: model.address
      }
      commit('addLocation', model)
    },
    updateLocation ({ commit }, model) {
      commit('updateLocation', model)
    },
    addLocationLedgerEntry ({ commit, getters }, model) {
      var id = model.id
      if (id && getters.locationLedgerEntry(id)) {
        console.error('Location ledger entry already exists with this id', id)
        return
      }
      if (!id) {
        id = getters.nextLocationLedgerEntryId()
      }
      model = {
        id: id,
        date: model.date,
        location: model.location,
        amount: model.amount,
        label: model.label,
        comments: model.comments,
        linked: model.linked
      }
      commit('addLocationLedgerEntry', model)
    },
    loadLocations ({ commit }, locations) {
      locations = locations.map(location => {
        return Object.assign(
          { label: '', asset: '', address: '', url: '', comments: '', group: '' },
          location
        )
      })
      commit('loadLocations', locations)
    },
    loadLocationGroups ({ commit }, locationGroups) {
      locationGroups = locationGroups.map(group => {
        return Object.assign(
          { label: '', locations: [], url: '', comments: '' },
          group
        )
      })
      commit('loadLocationGroups', locationGroups)
    },
    loadLocationLedgerEntries ({ commit, getters }, ledgerEntries) {
      ledgerEntries = [].concat(ledgerEntries)
      ledgerEntries = loadDate(ledgerEntries)
      ledgerEntries.forEach(x => {
        var location = getters.location(x.location)
        x.amount = utils.newBigNumberForAsset(x.amount, location && location.asset)
      })
      commit('loadLocationLedgerEntries', ledgerEntries)
    },
    importLocations ({ dispatch }, data) {
      dispatch('loadLocationGroups', data.locationGroups)
      dispatch('loadLocations', data.locations)
      dispatch('loadLocationLedgerEntries', data.locationLedgerEntries)
    }
  },

  getters: {
    locationGroupBreadcrumbLabel: (state, getters) => (groupId) => {
      var group = getters.locationGroup(groupId)
      return group && group.label
    },
    locationBreadcrumbLabel: (state, getters) => (locId) => {
      var location = getters.location(locId)
      return location && location.label
    },
    locationLedgerEntry: (state, getters) => (entryId) => {
      return state.locationLedgerEntriesById[entryId]
    },
    nextLocationLedgerEntryId: (state) => commonFindNextId(state.locationLedgerEntriesById),
    ledgerEntriesForLocation: (state, getters) => (locationId) => {
      return state.locationLedgerEntriesByLocation[locationId]
    },
    ledgerEntriesForLocationCalculated: (state, getters) => (locationId) => {
      var location = getters.location(locationId)
      var entries = getters.ledgerEntriesForLocation(locationId)
      var total = utils.newBigNumberForAsset(0, location.asset)
      if (!entries) { return [] }
      return entries.map((entry, index) => {
        total = total.plus(entry.amount)
        return Object.assign({}, entry, { total: total, sortIndex: index })
      })
    },
    ledgerBalanceForLocation: (state, getters) => (locationId, atDate) => {
      var location = getters.location(locationId)
      var entries = getters.ledgerEntriesForLocation(locationId)
      if (!entries) { return 0 }
      if (atDate) {
        // filter: only ledger entries up to given date
        entries = entries.filter(x => x.date <= atDate)
      }
      return entries.reduce((total, entry) => {
        return total.plus(entry.amount)
      }, utils.newBigNumberForAsset(0, location.asset))
    },
    location: (state, getters) => (locationId) => {
      locationId = +locationId
      return state.locationsById[locationId]
    },
    nextLocationId: (state) => commonFindNextId(state.locationsById),
    locationGroups: (state) => state.locationGroups,
    locationGroup: (state, getters) => (groupId) => {
      groupId = +groupId
      return state.locationGroupsById[groupId]
    },
    nextLocationGroupId: (state) => commonFindNextId(state.locationGroupsById),
    locationsInGroup: (state, getters) => (groupId) => {
      groupId = +groupId
      var group = getters.locationGroup(groupId)
      return group.locations.map(locationId => state.locationsById[locationId])
    },
    locationsInGroupByAsset: (state, getters) => (groupId) => {
      groupId = +groupId
      var locations = getters.locationsInGroup(groupId)
      return groupBy(locations, 'asset')
    },
    locationsInGroupByAssetWithTotal: (state, getters) => (groupId) => {
      groupId = +groupId
      const locsByAsset = getters.locationsInGroupByAsset(groupId)
      const assets = {}
      Object.entries(locsByAsset).forEach(([asset, locs]) => {
        const locations = locs.map(loc => ({
          ...loc,
          total: getters.ledgerBalanceForLocation(loc.id)
        }))
        const total = locations.reduce((sum, loc) => sum.plus(loc.total), utils.newBigNumberForAsset(0, asset))
        assets[asset] = {
          locations,
          total
        }
      })
      return assets
    },
    totalLocationGroupGBPValue: (state, getters) => (groupId) => {
      if (!getters.assetPriceById) { return null }
      const locsByAsset = getters.locationsInGroupByAssetWithTotal(groupId)
      let totalGBPValue = utils.newBigNumberForFiat(0)
      Object.entries(locsByAsset).forEach(([assetId, { total }]) => {
        if (!total.isNaN()) {
          const assetGBPValue = total.times(getters.assetPriceById[assetId])
          totalGBPValue = totalGBPValue.plus(assetGBPValue)
        }
      })
      return totalGBPValue
    },
    locationsForAsset: (state, getters) => (assetId) => {
      return state.locationsByAsset[assetId] || []
    },
    locationForAddress: (state, getters) => (assetId, address) => {
      var locations = getters.locationsForAsset(assetId)
      var assetsWithoutCaseSensitiveAddresses = getters.assetsWithoutCaseSensitiveAddresses
      var found = null
      if (assetsWithoutCaseSensitiveAddresses.indexOf(assetId) !== -1) {
        found = locations.find(l => l.address && l.address.toLowerCase() === address && address.toLowerCase())
      } else {
        found = locations.find(l => l.address === address)
      }
      return found
    },
    locationsDataForExport: (state) => ({
      locations: state.locations,
      locationGroups: state.locationGroups,
      locationLedgerEntries: state.locationLedgerEntries
    })
  }
}

export default storeModule
