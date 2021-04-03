import axios from 'axios'
import u from '../../utils'

var asset = 'BTC'

var addressLink = {
  link: item => (item && `https://www.blockchain.com/btc/address/${item}`) || false,
  linkTitle: item => 'View address on Blockchain',
  label: item => item,
  shortLabel: item => u.truncateToFirst(item, 6)
}

var transactionLink = {
  link: item => (item && `https://www.blockchain.com/btc/tx/${item}`) || false,
  linkTitle: item => 'View transaction on Blockchain',
  label: item => item,
  shortLabel: item => u.truncateToFirst(item, 6)
}

var fetchTransaction = function (transactionId) {
  return new Promise((resolve, reject) => {
    var url = `https://blockchain.info/rawtx/${transactionId}?cors=true`
    axios.get(url).then((response) => {
      var x = response.data
      var ins = x.inputs && x.inputs.filter(input => input.prev_out && input.prev_out.addr)
      var inputAddresses = ins.map(input => input.prev_out.addr)
      inputAddresses = [...new Set(inputAddresses)]
      var inputsByAddress = ins.reduce((memo, input) => {
        var address = input.prev_out.addr
        if (!memo[address]) {
          memo[address] = { address, value: u.newBigNumberForAsset(0, asset) }
        }
        var inputValue = u.newBigNumberForAsset(input.prev_out.value, asset).div(10e7) // value is a number in satoshis
        memo[address].value = memo[address].value.plus(inputValue)
        return memo
      }, {})
      var inputs = Object.values(inputsByAddress)
      inputs.forEach(input => { input.value = input.value.toString() })
      var outputs = x.out.map(output => {
        var outAddresses = [output.addr]
        var outputValue = u.newBigNumberForAsset(output.value, asset).div(10e7) // value is a number in satoshis
        return {
          addresses: outAddresses,
          value: outputValue.toString(),
          isToSingleAddress: outAddresses && outAddresses.length === 1
        }
      })
      // Fee is not included in API response: sum the inputs and outputs to work it out
      var totalInputs = inputs.reduce((memo, input) => memo.plus(input.value), u.newBigNumberForAsset(0, asset))
      var totalOutputs = outputs.reduce((memo, output) => memo.plus(output.value), u.newBigNumberForAsset(0, asset))
      var fee = totalInputs.minus(totalOutputs)

      var transaction = {
        transactionId: x.hash,
        date: new Date(x.time * 1000), // N.B. this is the time added to mempool: prefer to get the block time, use blockcypher API instead
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

// Fetch transactions for an address from Blockchain.com API
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
    var url = `https://blockchain.info/multiaddr?active=${address}&cors=true&n=${pageSize}&offset=${offset}`
    axios.get(url).then((response) => {
      var fetchedAll = false
      var hasMore = false
      var newOffset = offset
      // see if there are more pages of transactions to fetch
      if (response.data.txs.length < pageSize) {
        fetchedAll = true
      } else {
        hasMore = true
        newOffset += pageSize
      }
      var transactions = response.data.txs.map(x => {
        var ins = x.inputs && x.inputs.filter(input => input.prev_out && input.prev_out.addr)
        var inputAddresses = ins.map(input => input.prev_out.addr)
        inputAddresses = [...new Set(inputAddresses)]
        var outputs = x.out.map(output => {
          var outAddresses = [output.addr]
          var valueNum = u.newBigNumberForAsset(output.value, asset).div(10e7) // value is a number in satoshis
          return {
            addresses: outAddresses,
            value: valueNum.toString(),
            isToSingleAddress: outAddresses && outAddresses.length === 1,
            isToThisAddress: outAddresses && outAddresses.indexOf(address) !== -1
          }
        })

        return {
          transactionId: x.hash,
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
  id: 'blockchain',
  label: 'Blockchain.com',
  addressLink,
  transactionLink,
  fetchTransaction,
  fetchTransactions
}
