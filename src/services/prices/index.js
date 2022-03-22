import cryptocompare from './cryptocompare'
import coingecko from './coingecko'

const services = [cryptocompare, coingecko]

const fetchDayPrice = function (opts) {
  const service = services.find(service => service.fetchDayPrice && service.supportsSymbol(opts.from))
  if (!service) {
    throw new Error('No matching service available')
  }
  return service.fetchDayPrice(opts)
}

/* YYYY-MM-DD */
window.getAssetDayPrice = async function (assetSymbol, day) {
  const date = new Date(`${day}T00:00:00Z`)
  console.log(`getAssetDayPrice ${assetSymbol}, ${date.toString()}`)
  const result = await fetchDayPrice({ from: assetSymbol, to: 'GBP', date })
  return result
}

export default {
  fetchDayPrice,
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

    let priceMap = {}
    if (symbolsToFetch.length) {
      console.error(`No matching service available for symbols ${symbolsToFetch}: price will be treated as zero`)
      priceMap = Object.fromEntries(symbolsToFetch.map(symbol => [symbol, 0]))
    }

    return Promise.all(fetching).then((results) => {
      return Object.assign(priceMap, ...results)
    })
  }
}
