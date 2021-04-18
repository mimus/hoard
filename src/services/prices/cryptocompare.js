import axios from 'axios'
import throttledQueue from '../throttled_queue'

var APP_NAME = 'mus_hoard'

// Limit to 5 requests per second
var throttlePriceFetch = throttledQueue(5, 1000)

const unsupportedSymbols = ['AUTOv2', 'BTCB']

const supportsSymbol = function (symbol) {
  if (unsupportedSymbols.includes(symbol)) { return false }
  return true
}

const symbolsToSubstitute = {
  'BUSD-T': 'USDT',
  'DAI-B': 'DAI'
}

const convertSymbol = function (symbol) {
  return symbolsToSubstitute[symbol] || symbol
}

// Fetch day price for a symbol from cryptocompare API
//   from: symbol to look up e.g. ZEC
//   to: symbol to get price in e.g. GBP
//   date: date object
// It extracts the price from the response and returns it in the promise
var fetchDayPrice = function ({ from, to, date }) {
  from = convertSymbol(from)

  // special case for BETH
  if (from === 'BETH') {
    return fetchBETHPrice({ from, to, date })
  }

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

// BETH (Binance staked ETH) doesn't get calculated correctly by the normal API.
// Instead we have to fetch its price in ETH explicitly from Binance, then
// get the 'to' rate for ETH and apply that.
var fetchBETHPrice = function ({ from, to, date }) {
  return new Promise((resolve, reject) => {
    if (from === to) {
      resolve(1)
      return
    }
    var timestamp = Math.floor(date.getTime() / 1000)
    // console.log(`Look up ${to}/${from} price`, date, timestamp)
    var url = `https://min-api.cryptocompare.com/data/dayAvg?e=binance&fsym=${from}&tsym=ETH&toTs=${timestamp}&extraParams=${APP_NAME}`
    throttlePriceFetch(() => {
      axios.get(url).then(
        (response) => {
          // console.log('Got response', response)
          if (response.data && response.data.Response === 'Error' && response.data.MaxLimits) {
            reject(new Error('Rate Limit exceeded when fetching price'))
            return
          }
          if (response.data && typeof response.data.ETH !== 'undefined') {
            const priceInEth = response.data.ETH
            // now fetch ETH price
            fetchDayPrice({ from: 'ETH', to, date }).then(
              (priceInTarget) => {
                // console.log('BETH price in ETH:', priceInEth, 'ETH price in ' + to, priceInTarget, 'BETH price in ' + to, priceInEth * priceInTarget)
                resolve(priceInEth * priceInTarget)
              },
              (error) => {
                reject(error)
              }
            )
          } else {
            reject(new Error('Unexpected response when fetching BETH price'))
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
    var url = `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${from.join(',')}&tsyms=${to}&extraParams=${APP_NAME}`
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
