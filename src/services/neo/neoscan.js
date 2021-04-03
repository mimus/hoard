import axios from 'axios'
import u from '../../utils'

var addressLink = {
  link: item => (item && `https://neoscan.io/address/${item}`) || false,
  linkTitle: item => 'View address on NEOSCAN',
  label: item => item,
  shortLabel: item => u.truncateToFirst(item, 6)
}

var transactionLink = {
  link: item => (item && `https://neoscan.io/transaction/${item}`) || false,
  linkTitle: item => 'View transaction on NEOSCAN',
  label: item => item,
  shortLabel: item => u.truncateToFirst(item, 6)
}

var fetchTransaction = function (transactionId) {
  return new Promise((resolve, reject) => {
    var url = `https://neoscan.io/api/main_net/v1/get_transaction/${transactionId}`
    axios.get(url).then((response) => {
      var x = response.data

      var incomeLabel = ''
      var incomeOriginal = null
      var inputAddresses = []
      var inputs = []
      var outputs = []
      var fee = '0'

      if (x.type === 'ClaimTransaction') {
        // Gas claim
        if (x.vouts && x.vouts.length === 1) {
          var vout = x.vouts[0]
          outputs.push({
            addresses: [vout.address_hash],
            value: `${vout.value}`,
            isToSingleAddress: true
          })

          incomeOriginal = {
            asset: 'NEO',
            address: vout.address_hash
          }

          incomeLabel = `Claimed ${vout.value} GAS`
        }
      }

      var transaction = {
        transactionId: x.txid,
        date: new Date(x.time * 1000),
        incomeLabel,
        incomeOriginal,
        inputAddresses,
        inputs,
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

export default {
  id: 'neoscan',
  label: 'NEOSCAN',
  addressLink,
  transactionLink,
  fetchTransaction
}
