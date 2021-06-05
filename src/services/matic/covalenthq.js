import axios from 'axios'
import u from '../../utils'

const API_KEY = 'COVALENT_HQ_API_KEY'

const chainId = 137
const chainAsset = 'MATIC'

const tokens = {}

const registerToken = function ({ assetId, address }) {
  tokens[address.toLowerCase()] = assetId
}
export { registerToken }

var fetchTransaction = function (transactionId) {
  return new Promise((resolve, reject) => {
    var url = `https://api.covalenthq.com/v1/${chainId}/transaction_v2/${encodeURIComponent(transactionId)}/?&key=${encodeURIComponent(API_KEY)}`
    axios.get(url).then((response) => {
      // console.log({ response, tokens })
      var x = response.data.data.items[0]
      if (x) {
        const gas = u.newBigNumberForAsset(x.gas_spent, chainAsset) // 51784
        const gasPrice = u.newBigNumberForAsset(x.gas_price, chainAsset) // 1000000000
        const fee = gas.times(gasPrice).div(10e17) // 51784 x 1000000000 =  51784000000000 => 0.000051784 MATIC
        const valueReceived = u.newBigNumberForAsset(x.value, chainAsset).div(10e17) // x.value is a string containing a number
        const inputAddresses = [x.from_address]
        // inspect the log_events for recognisable types of transactions
        const callingAddress = x.from_address
        let approval = null
        let tokenTransfersFromCaller = []
        let tokenTransfersToCaller = []
        // let swap = null
        x.log_events.forEach(event => {
          if (event.decoded) {
            if (event.decoded.name === 'Approval' && event.decoded.params) {
              const approvalOwner = event.decoded.params.find(param => param.name === 'owner')?.value
              if (approvalOwner === callingAddress) {
                const tokenAddress = event.sender_address
                const tokenAsset = tokens[tokenAddress.toLowerCase()]
                const tokenSymbol = event.sender_contract_ticker_symbol
                approval = {
                  tokenAddress,
                  tokenAsset,
                  tokenSymbol
                }
              }
            }
            if (event.decoded.name === 'Transfer' && event.decoded.params) {
              const transferFromAddress = event.decoded.params.find(param => param.name === 'from')?.value
              const transferToAddress = event.decoded.params.find(param => param.name === 'to')?.value
              const transferValueString = event.decoded.params.find(param => param.name === 'value')?.value
              if (transferFromAddress === callingAddress || transferToAddress === callingAddress) {
                const tokenAddress = event.sender_address
                const tokenAsset = tokens[tokenAddress.toLowerCase()]
                const value = u.newBigNumberForAsset(transferValueString, tokenAsset).div(Math.pow(10, event.sender_contract_decimals))
                const list = transferFromAddress === callingAddress ? tokenTransfersFromCaller : tokenTransfersToCaller
                list.push({
                  address: callingAddress,
                  addressAsset: tokenAsset,
                  value: value.toString()
                })
              }
            }
          }
        })

        // Construct our transaction details depending on what we found
        let label = ''
        const inputs = []
        const outputs = []
        if (approval && valueReceived.isZero() && !tokenTransfersFromCaller.length && !tokenTransfersToCaller.length) {
          label = `Approve transfer of ${approval.tokenSymbol}`
          inputs.push({
            address: callingAddress,
            addressAsset: approval.tokenAsset,
            value: '0'
          })
          outputs.push({
            addresses: [callingAddress],
            addressAssets: [approval.tokenAsset],
            value: '0',
            isToSingleAddress: true
          })
        } else if (tokenTransfersFromCaller.length || tokenTransfersToCaller.length) {
          if (tokenTransfersFromCaller.length) {
            inputs.push(...tokenTransfersFromCaller)
          }
          if (tokenTransfersToCaller.length) {
            outputs.push(...tokenTransfersToCaller.map(transfer => ({
              addresses: [transfer.address],
              addressAssets: [transfer.addressAsset],
              value: transfer.value,
              isToSingleAddress: true
            })))
          }
        } else {
          inputs.push({
            address: x.from_address,
            value: valueReceived.plus(fee).toString()
          })
          outputs.push({
            addresses: [x.to_address],
            value: valueReceived.toString(),
            isToSingleAddress: true // TODO what do multiple outputs look like in the data?
          })
        }
        var transaction = {
          transactionId: x.tx_hash,
          date: new Date(x.block_signed_at), // block_signed_at: "2021-05-30T19:04:43Z"
          inputAddresses,
          inputs,
          outputs,
          fee: fee.toString(),
          feeAsset: chainAsset,
          feeLocation: x.from_address,
          label
        }
        // console.log({ transaction })
        resolve(transaction)
      } else {
        console.error(response)
        reject(new Error("Couldn't fetch transaction data"))
      }
    }, (error) => {
      console.error(error)
      reject(error && error.message)
    })
  })
}

export default {
  id: 'covalenthq_matic',
  label: 'Covalent API',
  fetchTransaction
}
