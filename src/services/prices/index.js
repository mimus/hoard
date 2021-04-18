import cryptocompare from './cryptocompare'
import coingecko from './coingecko'

const services = [cryptocompare, coingecko]

export default {
  fetchDayPrice: function (opts) {
    const service = services.find(service => service.fetchDayPrice && service.supportsSymbol(opts.from))
    if (!service) {
      throw new Error('No matching service available')
    }
    return service.fetchDayPrice(opts)
  },
  fetchMultipleCurrentPrices: function (opts) {
    const fetching = []
    let symbolsToFetch = opts.from

    // fetch multiple symbols at once if possible
    for (const service of services) {
      if (service.fetchMultipleCurrentPrices) {
        const supportedSymbols = symbolsToFetch.filter(symbol => service.supportsSymbol(symbol))
        fetching.push(service.fetchMultipleCurrentPrices({ ...opts, from: supportedSymbols }))
        symbolsToFetch = symbolsToFetch.filter(symbol => !supportedSymbols.includes(symbol))
      }
    }
    // fetch individual symbols
    const now = new Date()
    for (const service of services) {
      if (service.fetchDayPrice) {
        const supportedSymbols = symbolsToFetch.filter(symbol => service.supportsSymbol(symbol))
        for (const symbol of supportedSymbols) {
          fetching.push(service.fetchDayPrice({ from: symbol, to: opts.to, date: now }))
        }
        symbolsToFetch = symbolsToFetch.filter(symbol => !supportedSymbols.includes(symbol))
      }
    }

    if (symbolsToFetch.length) {
      throw new Error(`No matching service available for symbols ${symbolsToFetch}`)
    }

    return Promise.all(fetching).then((results) => {
      return Object.assign({}, ...results)
    })
  }
}
