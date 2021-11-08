import u from '../../utils'

// Fetch income events for an asset from Celsius 'All Transactions' exported CSV
// This finds entries for interest for the specified asset.
// Inputs:
//   asset: asset that interest is paid in
//   data: string content of the CSV file
// Returns object with:
//   incomeEvents: in a standardized format { incomeEventId, date, amount }
const loadIncomeEvents = function (assetId, data) {
  return new Promise((resolve, reject) => {
    // console.log('extract celsius interest history for', assetId, data)
    if (!data) {
      reject(new Error('No data provided.'))
      return
    }
    const lines = data.trim().split('\n')
    if (!lines.length) {
      reject(new Error('Empty data provided.'))
      return
    }
    const expectedHeaders1 = 'Internal id, Date and time, Transaction type, Coin type, Coin amount, USD Value, Original Interest Coin, Interest Amount In Original Coin, Confirmed'
    let lineItems = []

    if (lines[0] === expectedHeaders1) {
      // remove headers
      lines.shift()
      lineItems = lines.map(
        line => line.match(/^"[^"]+","(?<time>[^"]+)","(?<transactionType>[^"]+)","(?<coinType>[^"]+)","(?<amount>[^"]+)",/).groups
      )
    } else {
      reject(new Error('Unexpected data format: expecting CSV with headers ' + expectedHeaders1))
      return
    }

    // Celsius records DAI as MCDAI
    lineItems = lineItems.map(item => ({
      ...item,
      asset: item.coinType === 'MCDAI' ? 'DAI' : item.coinType
    }))

    const incomeEvents = lineItems
      .filter(({ transactionType, asset }) => (['interest'].includes(transactionType)) && asset === assetId)
      .map(({ time, asset, amount }, index) => ({
        incomeEventId: `incomeEvent${index}`,
        date: new Date(time),
        amount
      }))
      .sort(u.dateComparatorEarliestFirst)
      .reverse()

    resolve({
      incomeEvents
    })
  })
}
export default {
  id: 'celsiusStatementInterest',
  label: 'Celsius CSV Statement: Interest',
  loadIncomeEvents
}
