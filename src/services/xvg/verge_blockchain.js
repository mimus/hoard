import axios from 'axios'
import u from '../../utils'

var asset = 'XVG'

var addressLink = {
  link: item => (item && `https://verge-blockchain.info/address/${item}`) || false,
  linkTitle: item => 'View address on Verge Blockchain',
  label: item => item,
  shortLabel: item => u.truncateToFirst(item, 6)
}

var transactionLink = {
  link: item => (item && `https://verge-blockchain.info/tx/${item}`) || false,
  linkTitle: item => 'View transaction on Verge Blockchain',
  label: item => item,
  shortLabel: item => u.truncateToFirst(item, 6)
}

var fetchTransaction = function (transactionId) {
  return new Promise((resolve, reject) => {
    var url = `https://verge-blockchain.info/api/getrawtransaction?txid=${transactionId}&decrypt=1`
    axios.get(url).then((response) => {
      var x = response.data
      // This API only returns transaction IDs in the vin array, not addresses.
      // Ignore them for now.
      var inputAddresses = []
      var inputs = []
      var outputs = x.vout.map(output => {
        var outAddresses = output.scriptPubKey.addresses
        var outputValue = u.newBigNumberForAsset(output.value, asset)
        return {
          addresses: outAddresses,
          value: outputValue.toString(),
          isToSingleAddress: outAddresses && outAddresses.length === 1
        }
      })
      // No fee available in this API
      var fee = '0'

      var transaction = {
        transactionId: x.txid,
        date: new Date(x.time * 1000),
        inputs,
        inputAddresses,
        outputs,
        fee
      }
      resolve(transaction)
    }, (error) => {
      console.error(error)
      reject(error && error.message)
    })
  })
}

// Fetch transactions for an address from Verge Blockchain API
// Inputs:
//   address: address to fetch
//   fetchState: object tracking state e.g. page #, offset,
//        which was originally returned by a previous fetchTransactions call
//        (structure is arbitrary)
// Returns object with:
//   transactions: in a standardized format extracted from the API response
//   fetchedAll: boolean
//   hasMore: boolean
//   fetchState: object tracking state e.g. page #, offset;
//        this should be passed to subsequent calls
//
// N.B. this API only provides the most recent 500 transactions.
//
// The API requires 2 stages:
//   1) fetch full list of transaction IDs for an account (most recent 500)
//   2) fetch individual transaction details
// Artificially introduce paging so that we don't overload the details endpoint.
// The array of transactionIds will be cached in the fetchState, so it can be reused for new 'pages'
var fetchTransactions = function (address, fetchState) {
  return new Promise((resolve, reject) => {
    var pageSize = (fetchState && fetchState.pageSize) || 20
    var offset = (fetchState && fetchState.offset) || 0
    var transactionIds = (fetchState && fetchState.transactionIds) || null

    var initialFetch = null
    if (!transactionIds) {
      // fetch initial list of transactions
      var url = `https://verge-blockchain.info/ext/getaddress/${address}`
      initialFetch = axios.get(url)
      initialFetch.then((response) => {
        transactionIds = response.data.last_txs.map(t => t.addresses)
        // These IDs are provided earliest first. Reverse them so we fetch the latest first (for checking for new transactions)
        transactionIds.reverse()
      }, (error) => {
        console.log('Initial transactions fetch error', error)
        reject(new Error('Error fetching transactions'))
      })
    } else {
      initialFetch = Promise.resolve()
    }

    initialFetch.then(() => {
      // For the next page of transactions, fetch the transaction details
      var pageTransactionIds = transactionIds.slice(offset, offset + pageSize)

      var promises = pageTransactionIds.map(transactionId => {
        var url = `https://verge-blockchain.info/api/getrawtransaction?txid=${transactionId}&decrypt=1`
        return axios.get(url)
      })

      Promise.all(promises).then((responses) => {
        var fetchedAll = false
        var hasMore = false
        var newOffset = offset
        // see if there are more pages of transactions to fetch

        if (offset >= transactionIds.length) {
          fetchedAll = true
        } else {
          hasMore = true
          newOffset += pageSize
        }

        var transactions = responses.map(r => r.data)
        transactions = transactions.map(x => {
          // This API only returns transaction IDs in the vin array, not addresses.
          // Ignore them for now.
          // var ins = x.vin && x.vin.filter(input => input.retrievedVout && input.retrievedVout.scriptPubKey.addresses)
          // var inputAddresses = ins.reduce((memo, input) => memo.concat(input.retrievedVout.scriptPubKey.addresses), [])
          // inputAddresses = [...new Set(inputAddresses)]
          if (!x.vout || !x.txid) {
            console.log('Unexpected transaction response', x)
            return {
              transactionId: x.txid,
              date: new Date(x.time * 1000),
              inputAddresses: [],
              outputs: [],
              errorFetchingDetails: 'Unexpected transaction response'
            }
          }
          var inputAddresses = []
          var outputs = x.vout.map(output => {
            var outAddresses = output.scriptPubKey.addresses
            var outputValue = u.newBigNumberForAsset(output.value, asset)
            return {
              addresses: outAddresses,
              value: outputValue.toString(),
              isToSingleAddress: outAddresses && outAddresses.length === 1,
              isToThisAddress: outAddresses && outAddresses.indexOf(address) !== -1
            }
          })

          return {
            transactionId: x.txid,
            date: new Date(x.time * 1000),
            inputAddresses,
            outputs
          }
        })

        resolve({
          transactions,
          fetchedAll,
          hasMore,
          fetchState: {
            pageSize,
            offset: newOffset,
            transactionIds
          }
        })
      }, (error) => {
        console.log('All promises error', error)
        reject(new Error('Error fetching transactions'))
      })
    })
  })
}

export default {
  id: 'vergeBlockchain',
  label: 'Verge-Blockchain.info',
  addressLink,
  transactionLink,
  fetchTransaction,
  fetchTransactions
}
