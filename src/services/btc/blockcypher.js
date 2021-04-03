import axios from 'axios'
import u from '../../utils'

var asset = 'BTC'

var fetchTransaction = function (transactionId) {
  return new Promise((resolve, reject) => {
    var url = `https://api.blockcypher.com/v1/btc/main/txs/${transactionId}`
    axios.get(url).then((response) => {
      var x = response.data
      var inputAddresses = x.inputs.map(input => input.addresses).flat()
      inputAddresses = [...new Set(inputAddresses)]
      var inputsByAddress = x.inputs.reduce((memo, input) => {
        var address = input.addresses[0]
        if (!memo[address]) {
          memo[address] = { address, value: u.newBigNumberForAsset(0, asset) }
        }
        var inputValue = u.newBigNumberForAsset(input.output_value, asset).div(10e7) // value is a number in satoshis
        memo[address].value = memo[address].value.plus(inputValue)
        return memo
      }, {})
      var inputs = Object.values(inputsByAddress)
      inputs.forEach(input => { input.value = input.value.toString() })
      var outputs = x.outputs.map(output => {
        var outAddresses = output.addresses
        var outputValue = u.newBigNumberForAsset(output.value, asset).div(10e7) // value is a number in satoshis
        return {
          addresses: outAddresses,
          value: outputValue.toString(),
          isToSingleAddress: outAddresses?.length === 1
        }
      })
      var fee = u.newBigNumberForAsset(x.fees).div(10e7).toString() // fees is a number in satoshis

      var transaction = {
        transactionId: x.hash,
        date: new Date(x.confirmed),
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
  id: 'blockcypher',
  label: 'blockcypher.com',
  fetchTransaction
}
