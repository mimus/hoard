import axios from 'axios'
import throttledQueue from '../throttled_queue'
import u from '../../utils'

// API limit is 5 requests per second
var throttleEtherscanFetch = throttledQueue(4, 1000)
var apiToken = 'S23NI7FKUCKKX5W26PH5UBNANWPMVU6FW5'

var asset = 'ETH'

var addressLink = {
  link: item => (item && `https://etherscan.io/address/${item}`) || false,
  linkTitle: item => 'View address on Etherscan',
  label: item => item,
  shortLabel: item => u.truncateToFirst(item, 6)
}

var transactionLink = {
  link: item => (item && `https://etherscan.io/tx/${item}`) || false,
  linkTitle: item => 'View transaction on Etherscan',
  label: item => item,
  shortLabel: item => u.truncateToFirst(item, 6)
}

var fetchTransaction = function (transactionId) {
  return new Promise((resolve, reject) => {
    var url = `https://api.etherscan.io/api?module=proxy&action=eth_getTransactionByHash&txhash=${transactionId}&apikey=${apiToken}`
    throttleEtherscanFetch(() => {
      axios.get(url).then((response) => {
        var x = response.data.result
        var gas = u.newBigNumberForAsset(x.gas, asset) // gas and gas price is a hex string.
        var gasPrice = u.newBigNumberForAsset(x.gasPrice, asset)
        var fee = gas.times(gasPrice).div(10e17)
        var valueReceived = u.newBigNumberForAsset(x.value, asset).div(10e17) // x.value is a hex string.
        var inputAddresses = [x.from]
        var inputs = [{
          address: x.from,
          value: valueReceived.plus(fee).toString()
        }]
        var outputs = [x.to].map(outputAddress => {
          var outAddresses = [outputAddress]
          return {
            addresses: outAddresses,
            value: valueReceived.toString(),
            isToSingleAddress: outAddresses && outAddresses.length === 1
          }
        })

        // Now need to fetch the block so we can find the timestamp...
        var blockNo = x.blockNumber / 1 // x.blockNumber is a hex string: convert to number
        var blockUrl = `https://api.etherscan.io/api?module=block&action=getblockreward&blockno=${blockNo}&apikey=${apiToken}`
        throttleEtherscanFetch(() => {
          axios.get(blockUrl).then((blockResponse) => {
            var transaction = {
              transactionId: x.hash,
              date: new Date(blockResponse.data.result.timeStamp * 1000),
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
      }, (error) => {
        console.error(error)
        reject(error && error.message)
      })
    })
  })
}

// Fetch transactions for an address from Etherscan API
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
    var pageSize = (fetchState && fetchState.pageSize) || 20
    var pageNum = (fetchState && fetchState.pageNum) || 1
    // Url: 'page' is page number, starting at 1
    //      'offset' is actually page size
    var url = `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&page=${pageNum}&offset=${pageSize}&sort=desc&apikey=${apiToken}`
    throttleEtherscanFetch(() => {
      axios.get(url).then((response) => {
        var fetchedAll = false
        var hasMore = false
        var newPageNum = pageNum
        // see if there are more pages of transactions to fetch
        // response if page > max: {"status":"0","message":"No transactions found","result":[]}
        var result = response.data.result
        if (result && result.length < pageSize) {
          fetchedAll = true
        } else {
          hasMore = true
          newPageNum++
        }
        var transactions = result.map(x => {
          var inputAddresses = [x.from]
          var valueReceived = u.newBigNumberForAsset(x.value, asset).div(10e17) // x.value is a hex string.
          var addressLowercase = address.toLowerCase()
          var outputs = [x.to].map(outputAddress => {
            var outAddresses = [outputAddress]
            return {
              addresses: outAddresses,
              value: valueReceived.toString(),
              isToSingleAddress: outAddresses && outAddresses.length === 1,
              isToThisAddress: outAddresses && outAddresses.indexOf(addressLowercase) !== -1
            }
          })

          return {
            transactionId: x.hash,
            date: new Date(x.timeStamp * 1000),
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
            pageNum: newPageNum
          }
        })
      }, (error) => {
        console.error(error)
        reject(new Error('Error fetching transactions'))
      })
    })
  })
}

export default {
  id: 'etherscan',
  label: 'Etherscan',
  addressLink,
  transactionLink,
  fetchTransaction,
  fetchTransactions
}
