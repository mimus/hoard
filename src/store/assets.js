import Vue from 'vue'
import utils from '../utils'
import storeUtils from './storeUtils'

var { loadDate, commonFindNextId, commonUpdateModel } = storeUtils

var storeModule = {

  state: {
    assets: [],
    assetsById: {},

    assetLedgerEntries: [],
    assetLedgerEntriesById: {},
    assetLedgerEntriesByAsset: {}
  },

  mutations: {
    addAsset (state, model) {
      state.assets.push(model)
      Vue.set(state.assetsById, model.id, model)
      // initialize storage for ledger entries
      if (!state.assetLedgerEntriesByAsset[model.id]) {
        Vue.set(state.assetLedgerEntriesByAsset, model.id, [])
      }
    },

    updateAsset (state, model) {
      commonUpdateModel(model, state.assetsById)
    },

    loadAssets (state, assets) {
      state.assets = assets
      assets.forEach(x => {
        Vue.set(state.assetsById, x.id, x)
        // initialize storage for ledger entries
        if (!state.assetLedgerEntriesByAsset[x.id]) {
          Vue.set(state.assetLedgerEntriesByAsset, x.id, [])
        }
      })
    },

    addAssetLedgerEntry (state, model) {
      state.assetLedgerEntries.push(model)
      Vue.set(state.assetLedgerEntriesById, model.id, model)
      state.assetLedgerEntriesByAsset[model.asset].push(model)
    },

    loadAssetLedgerEntries (state, ledgerEntries) {
      state.assetLedgerEntries = ledgerEntries
      ledgerEntries.forEach(entry => {
        Vue.set(state.assetLedgerEntriesById, entry.id, entry)
        if (!state.assetLedgerEntriesByAsset[entry.asset]) {
          Vue.set(state.assetLedgerEntriesByAsset, entry.asset, [])
        }
        state.assetLedgerEntriesByAsset[entry.asset].push(entry)
      })
    }
  },

  actions: {
    addAsset ({ commit, getters }, model) {
      if (!model.id) {
        console.error('Must provide a new asset ID')
        return
      }
      if (getters.asset(model.id)) {
        console.error('Asset ID already taken')
        return
      }
      model = {
        id: model.id,
        label: model.label,
        symbol: model.symbol,
        fiat: !!model.fiat,
        caseSensitiveAddress: !!model.caseSensitiveAddress
      }
      commit('addAsset', model)
    },

    updateAsset ({ commit }, model) {
      commit('updateAsset', model)
    },

    loadAssets ({ commit }, assets) {
      commit('loadAssets', assets)
    },

    addAssetLedgerEntry ({ commit, getters }, model) {
      var id = model.id
      if (id && getters.assetLedgerEntry(id)) {
        console.error('Asset ledger entry already exists with this id', id)
        return
      }
      if (!id) {
        id = getters.nextAssetLedgerEntryId()
      }
      model = {
        id: id,
        date: model.date,
        type: model.type,
        asset: model.asset,
        assetValueGBP: model.assetValueGBP,
        amount: model.amount,
        label: model.label,
        comments: model.comments,
        linked: model.linked
      }
      commit('addAssetLedgerEntry', model)
    },

    loadAssetLedgerEntries ({ commit }, ledgerEntries) {
      ledgerEntries = [].concat(ledgerEntries)
      ledgerEntries = loadDate(ledgerEntries)
      ledgerEntries.forEach(x => {
        x.amount = utils.newBigNumberForAsset(x.amount, x.asset)
        x.assetValueGBP = utils.newBigNumberForFiat(x.assetValueGBP)
      })
      ledgerEntries.sort(utils.dateComparatorEarliestFirst)
      commit('loadAssetLedgerEntries', ledgerEntries)
    },
    importAssets ({ dispatch }, data) {
      dispatch('loadAssets', data.assets)
      dispatch('loadAssetLedgerEntries', data.assetLedgerEntries)
    }
  },

  getters: {
    assets: (state) => state.assets,
    assetLedgerEntriesByAsset: (state) => state.assetLedgerEntriesByAsset,
    assetBreadcrumbLabel: (state, getters) => (assetId) => {
      var asset = getters.asset(assetId)
      return asset && `${asset.label} (${asset.symbol})`
    },
    fiatAssets: (state, getters) => {
      return state.assets.filter(x => x.fiat)
    },
    assetsWithoutCaseSensitiveAddresses: (state, getters) => {
      return state.assets.filter(x => !x.caseSensitiveAddress).map(x => x.id)
    },
    asset: (state, getters) => (assetId) => {
      return state.assetsById[assetId]
    },
    assetLedgerEntry: (state, getters) => (entryId) => {
      return state.assetLedgerEntriesById[entryId]
    },
    nextAssetLedgerEntryId: (state) => commonFindNextId(state.assetLedgerEntriesById),
    ledgerEntriesForAsset: (state, getters) => (assetId) => {
      var entries = state.assetLedgerEntriesByAsset[assetId]
      return entries.map(entry =>
        ({
          workings: getters.assetLedgerEntryWorkings(entry.id) || {},
          ...entry
        })
      )
    },
    assetAmounts: (state, getters) => {
      var amountsByAsset = {}
      if (!state.assetLedgerEntriesByAsset) {
        return amountsByAsset
      }
      for (var [asset, entries] of Object.entries(state.assetLedgerEntriesByAsset)) {
        var amount = utils.newBigNumberForAsset(0, asset)
        if (entries && entries.length) {
          var lastEntry = entries[entries.length - 1]
          var lastEntryWorkings = getters.assetLedgerEntryWorkings(lastEntry.id)
          amount = (lastEntryWorkings && lastEntryWorkings.totalPoolAmount) || amount
        }
        amountsByAsset[asset] = amount
      }
      return amountsByAsset
    },
    assetsDataForExport: (state) => ({
      assets: state.assets,
      assetLedgerEntries: state.assetLedgerEntries
    })
  }
}

export default storeModule
