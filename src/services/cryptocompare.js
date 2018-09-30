import axios from 'axios'
import throttledQueue from './throttled_queue'

var APP_NAME = 'mus_hoard'

// Limit to 5 requests per second
var throttleDayPriceFetch = throttledQueue(5, 1000)

// Fetch day price for a symbol from cryptocompare API
//   from: symbol to look up e.g. ZEC
//   to: symbol to get price in e.g. GBP
//   date: date object
// It extracts the price from the response and returns it in the promise
var fetchDayPrice = function ({from, to, date}) {
  return new Promise((resolve, reject) => {
    if (from === to) {
      resolve(1)
      return
    }
    var timestamp = Math.floor(date.getTime() / 1000)
    // console.log(`Look up ${to}/${from} price`, date, timestamp)
    var url = `https://min-api.cryptocompare.com/data/dayAvg?fsym=${from}&tsym=${to}&toTs=${timestamp}&extraParams=${APP_NAME}`
    throttleDayPriceFetch(() => {
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

export default { fetchDayPrice }

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
