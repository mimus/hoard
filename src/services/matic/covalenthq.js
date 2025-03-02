// Covalent (now GoldRush) no longer provides a free API.
// Not using it anymore, but leaving the code here for reference
// as the polygonscan API doesn't provide decoded tx logs so can't add the more advanced logic

import axios from 'axios'
import u from '../../utils'

const API_KEY = 'ckey_7c9adaa75bad48838ec0a43d7d4'

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
        let ignoreFee = false
        const valueReceived = u.newBigNumberForAsset(x.value, chainAsset).div(10e17) // x.value is a string containing a number
        const inputAddresses = [x.from_address]
        // inspect the log_events for recognisable types of transactions
        let callingAddress = x.from_address
        let approval = null
        let tokenTransfersFromCaller = []
        let tokenTransfersToCaller = []
        // let swap = null
        // special case: 1inch OrderFilled transactions, which are called by a third party address
        // - in this case, extract the 'makerAddress' and treat it as our local 'callingAddress'
        const orderFilledEvent = x.log_events.find(event => event.decoded?.name === 'OrderFilled')
        if (orderFilledEvent) {
          // console.log({ orderFilledEvent })
          const makerAddress = orderFilledEvent.decoded.params.find(param => param.name === 'maker')?.value
          if (makerAddress && makerAddress !== callingAddress) {
            callingAddress = makerAddress
            ignoreFee = true
            console.log('found third-party OrderFilled transaction, ignoring fee', callingAddress)
          }
        }

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
                const valueNum = u.newBigNumberForAsset(transferValueString, tokenAsset).div(Math.pow(10, event.sender_contract_decimals))
                const list = transferFromAddress === callingAddress ? tokenTransfersFromCaller : tokenTransfersToCaller
                list.push({
                  address: callingAddress,
                  addressAsset: tokenAsset,
                  value: valueNum.toString(),
                  valueNum
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
            // add multiple transfers of the same asset together
            const transfersByAsset = {}
            for (const transfer of tokenTransfersToCaller) {
              if (!transfersByAsset[transfer.addressAsset]) {
                transfersByAsset[transfer.addressAsset] = {
                  addresses: [transfer.address],
                  addressAssets: [transfer.addressAsset],
                  value: transfer.value,
                  valueNum: transfer.valueNum,
                  isToSingleAddress: true
                }
              } else {
                transfersByAsset[transfer.addressAsset].valueNum = transfersByAsset[transfer.addressAsset].valueNum.plus(transfer.valueNum)
                transfersByAsset[transfer.addressAsset].value = transfersByAsset[transfer.addressAsset].valueNum.toString()
              }
            }
            outputs.push(...Object.values(transfersByAsset))
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
          fee: ignoreFee ? null : fee.toString(),
          feeAsset: ignoreFee ? null : chainAsset,
          feeLocation: ignoreFee ? null : x.from_address,
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
