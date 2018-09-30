import axios from 'axios'
import u from '../../utils'

var asset = 'VTC'

var addressLink = {
  link: item => (item && `https://insight.vertcoin.org/address/${item}`) || false,
  linkTitle: item => 'View address on Vertcoin.org Insight',
  label: item => item,
  shortLabel: item => u.truncateToFirst(item, 6)
}

var transactionLink = {
  link: item => (item && `https://insight.vertcoin.org/tx/${item}`) || false,
  linkTitle: item => 'View transaction on Vertcoin.org Insight',
  label: item => item,
  shortLabel: item => u.truncateToFirst(item, 6)
}

var fetchTransaction = function (transactionId) {
  return new Promise((resolve, reject) => {
    var url = `https://insight.vertcoin.org/insight-vtc-api/tx/${transactionId}`
    axios.get(url).then((response) => {
      var x = response.data
      var inputAddresses = x.vin.map(input => input.addr)
      inputAddresses = [...new Set(inputAddresses)]
      var inputsByAddress = x.vin.reduce((memo, input) => {
        var address = input.addr
        if (!memo[address]) {
          memo[address] = { address, value: u.newBigNumberForAsset(0, asset) }
        }
        memo[address].value = memo[address].value.plus(input.value)
        return memo
      }, {})
      var inputs = Object.values(inputsByAddress)
      inputs.forEach(input => { input.value = input.value.toString() })
      var outputs = x.vout.map(output => {
        var outAddresses = output.scriptPubKey.addresses
        return {
          addresses: outAddresses,
          value: output.value, // output.value is a String
          isToSingleAddress: outAddresses && outAddresses.length === 1
        }
      })
      var fee = u.newBigNumberForAsset(x.fees, asset)

      var transaction = {
        transactionId: x.txid,
        date: new Date(x.time * 1000),
        inputAddresses,
        inputs,
        outputs,
        fee: fee.toString()
      }
      resolve(transaction)
    }, (error) => {
      console.error(error)
      reject(error && error.message)
    })
  })
}

// Fetch transactions for an address from Vertcoin Insight API
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
var fetchTransactions = function (address, fetchState) {
  return new Promise((resolve, reject) => {
    var pageNum = (fetchState && fetchState.pageNum) || 0
    var url = `https://insight.vertcoin.org/insight-vtc-api/txs?address=${address}&pageNum=${pageNum}`
    axios.get(url).then((response) => {
      var fetchedAll = false
      var hasMore = false
      var newPageNum = pageNum
      // see if there are more pages of transactions to fetch
      if ((pageNum + 1) >= response.data.pagesTotal) {
        fetchedAll = true
      } else {
        hasMore = true
        newPageNum++
      }
      var transactions = response.data.txs.map(x => {
        var inputAddresses = x.vin.map(input => input.addr)
        inputAddresses = [...new Set(inputAddresses)]
        var outputs = x.vout.map(output => {
          var outAddresses = output.scriptPubKey.addresses
          return {
            addresses: outAddresses,
            value: output.value, // output.value is a String
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
          pageNum: newPageNum
        }
      })
    }, (error) => {
      console.error(error)
      reject(new Error('Error fetching transactions'))
    })
  })
}

export default {
  id: 'vertcoinInsight',
  label: 'Vertcoin.org Insight',
  addressLink,
  transactionLink,
  fetchTransaction,
  fetchTransactions
}
