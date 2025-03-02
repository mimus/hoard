import axios from 'axios'
import throttledQueue from '../throttled_queue'
import u from '../../utils'

var APP_NAME = 'mus_hoard'

// Look up coin symbols:
// https://min-api.cryptocompare.com/data/all/coinlist

// Limit to 5 requests per second
var throttlePriceFetch = throttledQueue(5, 1000)

const unsupportedSymbols = ['AUTOv2', 'BTCB', 'WMATIC', 'amWMATIC', 'MDX', 'B-POLYDEFI', 'B-POLYDEFI-gauge', 'B-POLYDEFI2', 'MOCA', 'FUD', 'FOMO', 'ALPHA', 'KEK', 'GLTR', 'SOS', 'GONE']

const supportsSymbol = function (symbol) {
  symbol = u.getStandardAsset(symbol)
  if (unsupportedSymbols.includes(symbol)) { return false }
  return true
}

const symbolsToSubstitute = {
  'amUSDT': 'USDT',
  'amUSDC': 'USDC',
  'amWBTC': 'WBTC',
  'amAAVE': 'AAVE',
  'amCRV': 'CRV',
  'amBAL': 'BAL',
  'amDAI': 'DAI',
  'maUNI': 'UNI', // approx
  'am3CRV': 'USDT', // not totally accurate, but can't find this stablecoin pool token on price APIs
  'am3CRV-gauge': 'USDT', // not totally accurate, but can't find this stablecoin pool token on price APIs
  'btcCRV': 'BTC', // not totally accurate, but can't find this stablecoin pool token on price APIs
  'btcCRV-gauge': 'BTC', // not totally accurate, but can't find this stablecoin pool token on price APIs
  'BPSP-TUSD': 'USDT', // not totally accurate, but can't find this stablecoin pool token on price APIs
  'BETH': 'ETH' // 2024: Binance market for BETH-ETH no longer available, assume 1:1
}

const convertSymbol = function (symbol) {
  symbol = u.getStandardAsset(symbol)
  return symbolsToSubstitute[symbol] || symbol
}

// Fetch day price for a symbol from cryptocompare API
//   from: symbol to look up e.g. ZEC
//   to: symbol to get price in e.g. GBP
//   date: date object
// It extracts the price from the response and returns it in the promise
var fetchDayPrice = function ({ from, to, date }) {
  from = convertSymbol(from)

  return new Promise((resolve, reject) => {
    if (from === to) {
      resolve(1)
      return
    }
    var timestamp = Math.floor(date.getTime() / 1000)
    // console.log(`Look up ${to}/${from} price`, date, timestamp)
    var url = `https://min-api.cryptocompare.com/data/dayAvg?fsym=${from}&tsym=${to}&toTs=${timestamp}&extraParams=${APP_NAME}`
    throttlePriceFetch(() => {
      axios.get(url).then(
        (response) => {
          // console.log('Got response', response)
          if (response.data && response.data.Response === 'Error' && response.data.MaxLimits) {
            reject(new Error('Rate Limit exceeded when fetching price'))
            return
          }
          if (response.data && typeof response.data[to] !== 'undefined') {
            resolve(response.data[to])
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

// Fetch current price for a symbol from cryptocompare API
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
    from = from.map(convertSymbol)
    const uniqueFrom = [...new Set(from)]
    var url = `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${uniqueFrom.join(',')}&tsyms=${to}&extraParams=${APP_NAME}`
    throttlePriceFetch(() => {
      axios.get(url).then(
        (response) => {
          // console.log('Got response', response)
          if (response.data && response.data.Response === 'Error' && response.data.MaxLimits) {
            reject(new Error('Rate Limit exceeded when fetching prices'))
            return
          }
          if (response.data && typeof response.data[from[0]] !== 'undefined' && typeof response.data[from[0]][to] !== 'undefined') {
            var pricesBySymbol = {}
            for (var i = 0; i < from.length; i++) {
              const fromSymbol = from[i]
              const originalFromSymbol = originalFrom[i]
              pricesBySymbol[originalFromSymbol] = response.data[fromSymbol]?.[to] || 0
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

/* Response when exceeded rate limit:
{
  "Response":"Error",
  "Message":"Rate limit excedeed!",
  "Type":99,
  "Aggregated":false,
  "Data":[],
  "YourCalls": {
    "hour": {"Histo":41},
    "minute":{"Histo":18},
    "second":{"Histo":18}
  },
  "MaxLimits": {
    "Hour":8000,
    "Minute":300,
    "Second":15
  }
}
*/
