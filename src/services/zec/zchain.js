import axios from 'axios'
import u from '../../utils'

var asset = 'ZEC'

var addressLink = {
  link: item => (item && `https://explorer.zcha.in/accounts/${item}`) || false,
  linkTitle: item => 'View address on Zchain',
  label: item => item,
  shortLabel: item => u.truncateToFirst(item, 6)
}

var transactionLink = {
  link: item => (item && `https://explorer.zcha.in/transactions/${item}`) || false,
  linkTitle: item => 'View transaction on Zchain',
  label: item => item,
  shortLabel: item => u.truncateToFirst(item, 6)
}

var fetchTransaction = function (transactionId) {
  return new Promise((resolve, reject) => {
    var url = `https://api.zcha.in/v2/mainnet/transactions/${transactionId}`
    axios.get(url).then((response) => {
      var x = response.data
      var ins = x.vin && x.vin.filter(input => input.retrievedVout && input.retrievedVout.scriptPubKey.addresses)
      var inputAddresses = ins.reduce((memo, input) => memo.concat(input.retrievedVout.scriptPubKey.addresses), [])
      inputAddresses = [...new Set(inputAddresses)]
      var inputsByAddress = x.vin.reduce((memo, input) => {
        var address = input.retrievedVout && input.retrievedVout.scriptPubKey.addresses[0]
        if (!memo[address]) {
          memo[address] = { address, value: u.newBigNumberForAsset(0, asset) }
        }
        memo[address].value = memo[address].value.plus(input.retrievedVout.value)
        return memo
      }, {})
      var inputs = Object.values(inputsByAddress)
      inputs.forEach(input => { input.value = input.value.toString() })
      var outputs = x.vout.map(output => {
        var outAddresses = output.scriptPubKey.addresses
        var outputValue = u.newBigNumberForAsset(output.value, asset)
        return {
          addresses: outAddresses,
          value: outputValue.toString(),
          isToSingleAddress: outAddresses && outAddresses.length === 1
        }
      })
      var fee = u.newBigNumberForAsset(x.fee, asset)

      var transaction = {
        transactionId: x.hash,
        date: new Date(x.timestamp * 1000),
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

// Fetch transactions for an address from zchain API
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
    var offset = (fetchState && fetchState.offset) || 0
    var url = `https://api.zcha.in/v2/mainnet/accounts/${address}/recv?limit=${pageSize}&offset=${offset}`
    axios.get(url).then((response) => {
      var fetchedAll = false
      var hasMore = false
      var newOffset = offset
      // see if there are more pages of transactions to fetch
      if (response.data.length < pageSize) {
        fetchedAll = true
      } else {
        hasMore = true
        newOffset += pageSize
      }
      var transactions = response.data.map(x => {
        var ins = x.vin && x.vin.filter(input => input.retrievedVout && input.retrievedVout.scriptPubKey.addresses)
        var inputAddresses = ins.reduce((memo, input) => memo.concat(input.retrievedVout.scriptPubKey.addresses), [])
        inputAddresses = [...new Set(inputAddresses)]
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
          transactionId: x.hash,
          date: new Date(x.timestamp * 1000),
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
          offset: newOffset
        }
      })
    }, (error) => {
      console.error(error)
      reject(new Error('Error fetching transactions'))
    })
  })
}

export default {
  id: 'zchain',
  label: 'Zchain Blockchain explorer',
  addressLink,
  transactionLink,
  fetchTransaction,
  fetchTransactions
}
