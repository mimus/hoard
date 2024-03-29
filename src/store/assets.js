import Vue from 'vue'
import utils from '../utils'
import storeUtils from './storeUtils'
import prices from '../services/prices'

var { loadDate, commonFindNextId, commonUpdateModel } = storeUtils

var storeModule = {

  state: {
    assets: [],
    assetsById: {},

    assetLedgerEntries: [],
    assetLedgerEntriesById: {},
    assetLedgerEntriesByAsset: {},

    assetPriceById: null,
    loadingAssetPrices: false
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
      state.assetsById = {}
      state.assetLedgerEntriesByAsset = {}
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
      var entriesForAsset = state.assetLedgerEntriesByAsset[model.asset]
      entriesForAsset.push(model)
      entriesForAsset.sort(utils.dateComparatorEarliestFirst)
    },

    deleteAssetLedgerEntry (state, entryId) {
      const asset = state.assetLedgerEntriesById[entryId]?.asset
      state.assetLedgerEntries = state.assetLedgerEntries.filter(({ id }) => id !== entryId)
      Vue.delete(state.assetLedgerEntriesById, entryId)
      if (asset) {
        state.assetLedgerEntriesByAsset[asset] = state.assetLedgerEntriesByAsset[asset].filter(({ id }) => id !== entryId)
      }
    },

    loadAssetLedgerEntries (state, ledgerEntries) {
      ledgerEntries.sort(utils.dateComparatorEarliestFirst)
      state.assetLedgerEntries = ledgerEntries
      state.assetLedgerEntriesById = {}
      ledgerEntries.forEach(entry => {
        Vue.set(state.assetLedgerEntriesById, entry.id, entry)
        if (!state.assetLedgerEntriesByAsset[entry.asset]) {
          Vue.set(state.assetLedgerEntriesByAsset, entry.asset, [])
        }
        state.assetLedgerEntriesByAsset[entry.asset].push(entry)
      })
    },

    loadingAssetPrices (state, loading) {
      state.loadingAssetPrices = loading
    },

    assetPrices (state, assetPriceById) {
      state.assetPriceById = assetPriceById
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
        stablecoin: !!model.stablecoin,
        nft: !!model.nft,
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

    deleteAssetLedgerEntry ({ commit, getters }, id) {
      const entry = getters.assetLedgerEntry(id)
      if (!entry) {
        console.error('Asset ledger entry not found', id)
        return
      }
      commit('deleteAssetLedgerEntry', entry.id)
    },

    loadAssetLedgerEntries ({ commit }, ledgerEntries) {
      ledgerEntries = [].concat(ledgerEntries)
      ledgerEntries = loadDate(ledgerEntries)
      ledgerEntries.forEach(x => {
        x.amount = utils.newBigNumberForAsset(x.amount, x.asset)
        x.assetValueGBP = utils.newBigNumberForFiat(x.assetValueGBP)
      })
      commit('loadAssetLedgerEntries', ledgerEntries)
    },
    importAssets ({ dispatch }, data) {
      dispatch('loadAssets', data.assets)
      dispatch('loadAssetLedgerEntries', data.assetLedgerEntries)
    },

    fetchAssetPrices ({ state, commit }, data) {
      const assetSymbols = state.assets.filter(asset => !asset.nft).map(asset => asset.symbol)
      commit('loadingAssetPrices', true)
      const fetchingPromise = prices.fetchMultipleCurrentPrices({ from: assetSymbols, to: 'GBP' })
      fetchingPromise.then(
        // success
        (pricesBySymbol) => {
          const assetIdsBySymbol = Object.fromEntries(
            state.assets.map(asset => [
              asset.symbol,
              asset.id
            ])
          )
          const assetPriceById = Object.fromEntries(
            Object.keys(pricesBySymbol).map(symbol => [
              assetIdsBySymbol[symbol],
              pricesBySymbol[symbol]
            ])
          )
          commit('assetPrices', assetPriceById)
          commit('loadingAssetPrices', false)
        },
        // error
        (error) => {
          console.error((error && error.message) || 'Unknown Error')
          commit('loadingAssetPrices', false)
        }
      )
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
      return entries.map((entry, index) =>
        ({
          workings: getters.assetLedgerEntryWorkings(entry.id) || {},
          sortIndex: index,
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
    assetPriceById: (state) => state.assetPriceById,
    loadingAssetPrices: (state) => state.loadingAssetPrices,
    assetGBPValues: (state, getters) => {
      if (!state.assetPriceById) { return null }
      return Object.fromEntries(state.assets.map(asset => [
        asset.id,
        getters.assetAmounts[asset.id].times(state.assetPriceById[asset.id])
      ]))
    },
    totalAssetGBPValue: (state, getters) => {
      if (!getters.assetGBPValues) { return null }
      const validValues = Object.values(getters.assetGBPValues).filter(value => !value.isNaN())
      const total = validValues.reduce((sum, value) => sum + (value - 0), 0)
      return total
    },
    assetsDataForExport: (state) => ({
      assets: state.assets,
      assetLedgerEntries: state.assetLedgerEntries
    })
  }
}

export default storeModule
