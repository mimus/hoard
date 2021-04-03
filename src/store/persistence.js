var storeModule = {

  state: {
  },

  mutations: {
  },

  actions: {
    importData ({ state, commit, dispatch }, d) {
      console.log('importData', d)
      return new Promise(function (resolve, reject) {
        // Upgrade from airdropEvents to incomeEvents
        if (d && d.airdropEvents) {
          d.incomeEvents = {
            incomeEvents: d.airdropEvents.airdropEvents
          }
          delete d.airdropEvents
          // assetLedgerEntry and locationLedgerEntry can have linked 'airdropEvent': rename to 'incomeEvent'
          const ledgerEntries = (d.assets?.assetLedgerEntries || []).concat(d.locations?.locationLedgerEntries || [])
          for (let entry of ledgerEntries) {
            for (let link of entry?.linked) {
              if (link.type === 'airdropEvent') {
                link.type = 'incomeEvent'
              }
            }
          }
        }
        if (d && d.incomeEvents && !d.incomeSources) {
          // Upgrade to add incomeSources
          d.incomeSources = { incomeSources: [] }
          for (let event of d.incomeEvents?.incomeEvents) {
            event.source = null
          }
        }

        if (!d || !d.taxYears || !d.assets || !d.cgt || !d.locations || !d.miningPools ||
          !d.miningEvents || !d.transferEvents || !d.incomeSources || !d.incomeEvents || !d.depositEvents || !d.tradeEvents) {
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
        dispatch('importIncomeSources', d.incomeSources)
        dispatch('importIncomeEvents', d.incomeEvents)
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
        incomeSources: getters.incomeSourcesDataForExport,
        incomeEvents: getters.incomeEventsDataForExport,
        depositEvents: getters.depositEventsDataForExport,
        tradeEvents: getters.tradeEventsDataForExport
      }
    }
  }
}

export default storeModule
