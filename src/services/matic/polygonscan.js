import axios from 'axios'
import throttledQueue from '../throttled_queue'
import u from '../../utils'

// API limit is 5 requests per second
var throttlePolygonscanFetch = throttledQueue(4, 1000)
var apiToken = 'RKAM8DRST8YBYQF8VQY2UBGSA1KWRDYIM3'

var chainAsset = 'MATIC'

var addressLink = {
  link: item => (item && `https://polygonscan.com/address/${item}`) || false,
  linkTitle: item => 'View address on PolygonScan',
  label: item => item,
  shortLabel: item => u.truncateToFirst(item, 6)
}

var transactionLink = {
  link: item => (item && `https://polygonscan.com/tx/${item}`) || false,
  linkTitle: item => 'View transaction on PolygonScan',
  label: item => item,
  shortLabel: item => u.truncateToFirst(item, 6)
}

var fetchTransaction = function (transactionId) {
  return new Promise((resolve, reject) => {
    var url = `https://api.polygonscan.com/api?module=proxy&action=eth_getTransactionByHash&txhash=${transactionId}&apikey=${apiToken}`
    throttlePolygonscanFetch(() => {
      axios.get(url).then((response) => {
        var x = response.data.result
        // now fetch the transaction receipt to see how much gas was actually used
        var receiptUrl = `https://api.polygonscan.com/api?module=proxy&action=eth_getTransactionReceipt&txhash=${transactionId}&apikey=${apiToken}`

        throttlePolygonscanFetch(() => {
          axios.get(receiptUrl).then((receiptResponse) => {
            var receipt = receiptResponse.data.result
            var gasUsed = receipt.gasUsed // gasUsed is a hex string
            var gas = u.newBigNumberForAsset(gasUsed, chainAsset)
            var gasPrice = u.newBigNumberForAsset(x.gasPrice, chainAsset) // gasPrice is a hex string.
            var fee = gas.times(gasPrice).div(10e17)
            var valueReceived = u.newBigNumberForAsset(x.value, chainAsset).div(10e17) // x.value is a hex string.
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
            var blockUrl = `https://api.polygonscan.com/api?module=block&action=getblockreward&blockno=${blockNo}&apikey=${apiToken}`
            throttlePolygonscanFetch(() => {
              axios.get(blockUrl).then((blockResponse) => {
                var transaction = {
                  transactionId: x.hash,
                  date: new Date(blockResponse.data.result.timeStamp * 1000),
                  inputAddresses,
                  inputs,
                  outputs,
                  fee: fee.toString(),
                  feeAsset: chainAsset,
                  feeLocation: x.from
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
      }, (error) => {
        console.error(error)
        reject(error && error.message)
      })
    })
  })
}

export default {
  id: 'polygonscan',
  label: 'PolygonScan',
  addressLink,
  transactionLink,
  fetchTransaction
}
