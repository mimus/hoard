import axios from 'axios'
import throttledQueue from '../throttled_queue'

// Limit to 5 requests per second
const throttlePriceFetch = throttledQueue(5, 1000)

// https://api.coingecko.com/api/v3/coins/list
const symbolToGeckoId = {
  BETH: 'binance-eth',
  AUTOv2: 'auto',
  BTCB: 'binance-bitcoin',
  WMATIC: 'wmatic',
  amWMATIC: 'wmatic',
  MDX: 'mdex',
  MOCA: 'museum-of-crypto-art'
}
const symbolToGeckoCurrency = {
  GBP: 'gbp'
}

const supportsSymbol = function (symbol) {
  return !!symbolToGeckoId[symbol]
}

// Fetch day price for a symbol from coingecko API
//   from: symbol to look up e.g. ZEC
//   to: symbol to get price in e.g. GBP
//   date: date object
// It extracts the price from the response and returns it in the promise
const fetchDayPrice = function ({ from, to, date }) {
  return new Promise((resolve, reject) => {
    if (from === to) {
      resolve(1)
      return
    }
    from = symbolToGeckoId[from]
    to = symbolToGeckoCurrency[to]
    const dateString = `${date.getUTCDate()}-${date.getUTCMonth() + 1}-${date.getUTCFullYear()}`
    // console.log(`Look up ${to}/${from} price`, date, dateString)
    var url = `https://api.coingecko.com/api/v3/coins/${from}/history?date=${dateString}&localization=false`
    throttlePriceFetch(() => {
      axios.get(url).then(
        (response) => {
          // console.log('Got response', response)
          if (response.data?.error) {
            reject(new Error(response.data.error))
            return
          }
          if (response.data?.['market_data']?.['current_price']?.[to]) {
            resolve(response.data.market_data.current_price[to])
          } else {
            reject(new Error('Unexpected response when fetching price'))
          }
        },
        (error) => {
          reject(error)
        }
      )
    })
  })
}

// Fetch current price for a symbol from coingecko API
//   from: symbols to look up e.g. ["BTC", "ETH"]
//   to: symbol to get price in e.g. GBP
// It extracts the prices from the response and returns it in the promise
// as a map of { fromSymbol: price }
var fetchMultipleCurrentPrices = function ({ from, to }) {
  return new Promise((resolve, reject) => {
    if (!from || !from.length) {
      resolve({})
      return
    }
    const originalFrom = from
    from = from.map(symbol => symbolToGeckoId[symbol])
    to = symbolToGeckoCurrency[to]
    var url = `https://api.coingecko.com/api/v3/simple/price?ids=${from.join(',')}&vs_currencies=${to}`
    throttlePriceFetch(() => {
      axios.get(url).then(
        (response) => {
          // console.log('Got response', response)
          if (response.data && typeof response.data[from[0]] !== 'undefined' && typeof response.data[from[0]][to] !== 'undefined') {
            var pricesBySymbol = {}
            for (var i = 0; i < from.length; i++) {
              const fromSymbol = from[i]
              const originalFromSymbol = originalFrom[i]
              pricesBySymbol[originalFromSymbol] = response.data[fromSymbol][to]
            }
            resolve(pricesBySymbol)
          } else {
            reject(new Error('Unexpected response when fetching prices'))
          }
        },
        (error) => {
          reject(error)
        }
      )
    })
  })
}

export default { fetchDayPrice, fetchMultipleCurrentPrices, supportsSymbol }
