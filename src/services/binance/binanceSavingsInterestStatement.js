import u from '../../utils'

// Fetch income events for an asset from Binance 'All Transactions' exported CSV
// This finds entries for DeFi staking interest for the specified asset.
// Inputs:
//   asset: asset that interest is paid in
//   data: string content of the CSV file
// Returns object with:
//   incomeEvents: in a standardized format { incomeEventId, date, amount }
const loadIncomeEvents = function (assetId, data) {
  return new Promise((resolve, reject) => {
    // console.log('extract binance POS interest history for', assetId, data)
    if (!data) {
      reject(new Error('No data provided.'))
      return
    }
    const lines = data.split('\n')
    if (!lines.length) {
      reject(new Error('Empty data provided.'))
      return
    }
    const expectedHeaders1 = 'UTC_Time,Account,Operation,Coin,Change,Remark'
    const expectedHeaders2 = 'User_ID,UTC_Time,Account,Operation,Coin,Change,Remark'
    let lineItems = []

    if (lines[0] === expectedHeaders1) {
      // remove headers
      lines.shift()
      lineItems = lines.map(
        line => line.split(',')
      ).map(([time, account, operation, coin, change, remark]) => ({ time, account, operation, coin, change, remark }))
    } else if (lines[0] === expectedHeaders2) {
      // remove headers
      lines.shift()
      lineItems = lines.map(
        line => line.split(',')
      ).map(([userId, time, account, operation, coin, change, remark]) => ({ time, account, operation, coin, change, remark }))
    } else {
      reject(new Error('Unexpected data format: expecting CSV with headers ' + expectedHeaders1 + ' - or - ' + expectedHeaders2))
      return
    }

    const incomeEvents = lineItems
      .filter(({ operation, coin }) => (['POS savings interest', 'Savings Interest', 'ETH 2.0 Staking Rewards'].includes(operation)) && coin === assetId)
      .map(({ time, coin, change }, index) => ({
        incomeEventId: `incomeEvent${index}`,
        date: new Date(time),
        amount: change
      }))
      .sort(u.dateComparatorEarliestFirst)
      .reverse()

    resolve({
      incomeEvents
    })
  })
}
export default {
  id: 'binanceStatementSavingsInterest',
  label: 'Binance CSV Statement: Savings Interest',
  loadIncomeEvents
}
