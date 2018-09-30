var storeModule = {

  state: {
  },

  mutations: {
  },

  actions: {
    importData ({ state, commit, dispatch }, d) {
      console.log('importData', d)
      return new Promise(function (resolve, reject) {
        if (!d || !d.taxYears || !d.assets || !d.cgt || !d.locations || !d.miningPools ||
          !d.miningEvents || !d.transferEvents || !d.airdropEvents || !d.depositEvents || !d.tradeEvents) {
          console.log('Invalid import', d)
          reject(new Error('Invalid import data format'))
          return
        }

        dispatch('importTaxYears', d.taxYears)
        dispatch('importAssets', d.assets)
        dispatch('importCgt', d.cgt)
        dispatch('importLocations', d.locations)
        dispatch('importMiningPools', d.miningPools)
        dispatch('importMiningEvents', d.miningEvents)
        dispatch('importTransferEvents', d.transferEvents)
        dispatch('importAirdropEvents', d.airdropEvents)
        dispatch('importDepositEvents', d.depositEvents)
        dispatch('importTradeEvents', d.tradeEvents)

        resolve()
      })
    }
  },

  getters: {
    dataForExport: (state, getters) => {
      return {
        exportDate: new Date(),
        taxYears: getters.taxYearDataForExport,
        assets: getters.assetsDataForExport,
        cgt: getters.cgtDataForExport,
        locations: getters.locationsDataForExport,
        miningPools: getters.miningPoolsDataForExport,
        miningEvents: getters.miningEventsDataForExport,
        transferEvents: getters.transferEventsDataForExport,
        airdropEvents: getters.airdropEventsDataForExport,
        depositEvents: getters.depositEventsDataForExport,
        tradeEvents: getters.tradeEventsDataForExport
      }
    }
  }
}

export default storeModule
