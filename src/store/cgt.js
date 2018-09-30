import utils from '../utils'
import cgt from '../analysis/cgt'

var storeModule = {

  state: {
    assetLedgerEntryWorkingsById: {}
  },

  mutations: {
    setNewAssetsLedgerWorkings (state, workingsById) {
      state.assetLedgerEntryWorkingsById = workingsById
    }
  },

  actions: {
    initCGT (context, store) {
      store.watch(
        // data to watch
        function (state, getters) {
          return cgt.calculateAssetsLedger(getters.assetLedgerEntriesByAsset)
        },
        // callback on change
        function (value, oldValue) {
          // 'value' contains the updated result from the above function
          // console.log('Got new assets ledger workings', value)
          store.commit('setNewAssetsLedgerWorkings', value)
        },
        { immediate: true }
      )
    },
    importCgt ({ commit }, data) {
      commit('setNewAssetsLedgerWorkings', data.assetLedgerEntryWorkingsById)
    }
  },

  getters: {
    assetLedgerEntryWorkings: (state, getters) => (entryId) => state.assetLedgerEntryWorkingsById[entryId],
    assetGainsForTaxYear: (state, getters) => (taxYearId) => {
      var year = getters.taxYear(taxYearId)
      if (!year) { return {} }
      var startDate = year.startDate
      var endDate = year.endDate
      var workingsById = state.assetLedgerEntryWorkingsById
      var results = Object.entries(getters.assetLedgerEntriesByAsset).map(([asset, entries]) => {
        var disposals = entries.filter(x => x.type === 'disposal' && x.date >= startDate && x.date <= endDate)
        var gain = disposals.reduce((sum, entry) => sum.plus(workingsById[entry.id] && workingsById[entry.id].gain), utils.newBigNumberForAsset(0, asset))
        disposals = disposals.map(x => ({ workings: workingsById[x.id] || {}, ...x }))
        return { asset, gain, disposals }
      })
      return results
    },

    miningPoolsIncomeForTaxYear: (state, getters) => (taxYearId) => {
      var year = getters.taxYear(taxYearId)
      if (!year) { return {} }
      var startDate = year.startDate
      var endDate = year.endDate
      var results = getters.miningPools.map(pool => {
        var events = getters.miningEventsForPool(pool.id)
        events = events.filter(x => x.date >= startDate && x.date <= endDate)
        events = events.map(x => Object.assign({}, x))
        events.sort(utils.dateComparatorEarliestFirst)
        events.forEach(x => {
          var assetEntryLink = x.linked.find(x => x.type === 'assetLedgerEntry')
          if (assetEntryLink) {
            var assetEntry = getters.assetLedgerEntry(assetEntryLink.id)
            if (assetEntry) {
              x.valueGBP = assetEntry.assetValueGBP
            }
          }
        })
        var totalAmount = events.reduce((sum, event) => sum.plus(event.amount), utils.newBigNumberForAsset(0, pool.asset))
        var totalValueGBP = events.reduce((sum, event) => sum.plus(event.valueGBP), utils.newBigNumberForFiat(0))
        return {
          id: pool.id,
          label: pool.label,
          asset: getters.asset(pool.asset),
          events,
          totalAmount,
          totalValueGBP
        }
      })
      return results
    },

    cgtDataForExport: (state) => ({
      assetLedgerEntryWorkingsById: state.assetLedgerEntryWorkingsById
    })
  }
}

export default storeModule
