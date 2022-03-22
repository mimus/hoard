<template>
  <v-card style="padding: 20px">
    <h1>Import and Export: Third Parties</h1>

    <h2>Export for BittyTax</h2>

    <v-btn
      style="margin-top: 10px"
      @click="generateBittyTaxExport"
    >
      Generate export
    </v-btn>
    <template v-if="bittyTaxExport">
      <v-textarea
        outlined
        :value="bittyTaxExport"
        style="margin-top: 20px; font-family: monospace; font-size: 0.85em"
      />
      <p>
        Check the console logs to see if there were any problems during the export.
      </p>
    </template>
  </v-card>
</template>

<script>
import moment from 'moment'
import { stringify } from 'csv-stringify/dist/esm/sync'

export default {
  data () {
    return {
      bittyTaxExport: ''
    }
  },
  methods: {
    generateBittyTaxExport () {
      const headers = [
        'Type',
        'Buy Quantity',
        'Buy Asset',
        'Buy Value in GBP',
        'Sell Quantity',
        'Sell Asset',
        'Sell Value in GBP',
        'Fee Quantity',
        'Fee Asset',
        'Fee Value in GBP',
        'Wallet',
        'Timestamp',
        'Note'
      ]
      const store = this.$store
      const getLocationLabelFromLinks = function (links) {
        // find locationLedgerEntry
        const link = links?.find(({ type }) => type === 'locationLedgerEntry')
        if (link) {
          const locationLedgerEntry = store.getters.locationLedgerEntry(link.id)
          if (locationLedgerEntry) {
            const location = store.getters.location(locationLedgerEntry.location)
            if (location) {
              const group = store.getters.locationGroup(location.group)

              if (location.address && group.category === 'WALLET') {
                const asset = store.getters.asset(location.asset)
                if (asset.caseSensitiveAddress) {
                  return location.address?.substring(0, 6) || location.label
                } else {
                  return location.address?.toLowerCase().substring(0, 6) || location.label
                }
              }
              return group.label || location.label
            }
          }
        }
        return ''
      }
      const getAssetLedgerEntryFromLinks = function (links) {
        // find assetLedgerEntry
        const link = links?.find(({ type }) => type === 'assetLedgerEntry')
        if (link) {
          const assetLedgerEntry = store.getters.assetLedgerEntry(link.id)
          if (assetLedgerEntry) {
            return assetLedgerEntry
          }
        }
        return null
      }
      const dateFormatForExport = function (date) {
        return moment(date).format('YYYY-MM-DDTHH:mm:ss UTC')
      }
      const MAX_DESC_LENGTH = 30
      const combineLabelAndComments = function (label, comments) {
        const result = label + (comments ? '; ' + comments : '')
        // PDF doesn't display long strings well, truncate it here
        if (result.length > MAX_DESC_LENGTH) {
          return result.substring(0, MAX_DESC_LENGTH) + '...'
        }
        return result
      }

      const spends = []

      console.group('Exporting Deposits')
      const deposits = this.$store.getters.depositEvents.map(event => [
        'Deposit',
        event.amount,
        event.asset,
        event.amount,
        null,
        null,
        null,
        null,
        null,
        null,
        getLocationLabelFromLinks(event.linked),
        dateFormatForExport(event.date),
        combineLabelAndComments(event.label, event.comments)
      ])
      console.groupEnd()

      console.group('Exporting Mining Events')
      const mining = this.$store.state.miningEvents.miningEvents.map(event => {
        const assetLedgerEntry = getAssetLedgerEntryFromLinks(event.linked)
        return [
          'Mining',
          event.amount,
          assetLedgerEntry.asset,
          assetLedgerEntry.assetValueGBP,
          null,
          null,
          null,
          null,
          null,
          null,
          getLocationLabelFromLinks(event.linked),
          dateFormatForExport(event.date),
          combineLabelAndComments(event.label, event.comments)
        ]
      })
      console.groupEnd()

      console.group('Exporting Income Events')
      const income = []
      for (const event of this.$store.getters.incomeEvents) {
        let incomeType = 'Income'
        const incomeSource = this.$store.getters.incomeSource(event.source)
        if (incomeSource && incomeSource.label.startsWith('GIFT')) {
          console.log(`GIFT source for Income event ${event.id} ${event.label} ${event.date}`)
          incomeType = 'Gift-Received'
        }
        income.push([
          incomeType,
          event.amount,
          event.asset,
          event.assetValueGBP,
          null,
          null,
          null,
          null,
          null,
          null,
          getLocationLabelFromLinks(event.linked),
          dateFormatForExport(event.date),
          combineLabelAndComments(event.label, event.comments)
        ])

        if (event.fees?.length) {
          // export fee as separate 'Spend' event
          for (const fee of event.fees) {
            const feeAssetLedgerEntry = getAssetLedgerEntryFromLinks(fee.linked)
            console.log(`Adding 'Spend' row for income event fee ${fee.amount} ${fee.asset} (${event.label} ${event.date})`)
            spends.push([
              'Spend',
              null,
              null,
              null,
              fee.amount,
              fee.asset,
              feeAssetLedgerEntry.assetValueGBP,
              null,
              null,
              null,
              getLocationLabelFromLinks(fee.linked),
              dateFormatForExport(event.date),
              combineLabelAndComments('Fee: ' + event.label, fee.comments)
            ])
          }
        }
      }
      console.groupEnd()

      // Transfers: bittytax wants these as pairs of Deposit and Withdrawal rows,
      // on the same date and with identical amounts.
      // * the withdrawn amount should be net of (without) fee
      // * if there are multiple inputs and/or outputs in the transfer (e.g. BTC), need to split this up
      console.group('Exporting Transfers')
      const transfers = []
      for (const event of this.$store.getters.transferEvents) {
        let transferDate = moment(event.date)
        let transferDateString = dateFormatForExport(transferDate.toDate())

        if (event.fees.length > 1) {
          console.error('Transfer event has more than one fee - not able to handle this', event)
        } else if (event.from.length === 1 && event.to.length === 1) {
          let amountFrom = event.from[0].amount
          if (amountFrom.isNegative()) {
            amountFrom = amountFrom.negated()
          }
          const fromLocationLabel = getLocationLabelFromLinks(event.from[0].linked)

          let fee = event.fees[0]
          let feeAssetLedgerEntry = null
          if (fee) {
            feeAssetLedgerEntry = getAssetLedgerEntryFromLinks(fee.linked)
            // If the fee is in a different location (label), we need to record a separate row for a 'Spend'.
            const feeLocationLedgerEntry = fee.linked.find(({ type }) => type === 'locationLedgerEntry')
            const feeLocationLabel = getLocationLabelFromLinks(fee.linked)
            if (feeLocationLedgerEntry && feeLocationLabel !== fromLocationLabel) {
              spends.push([
                'Spend',
                null,
                null,
                null,
                fee.amount,
                fee.asset,
                feeAssetLedgerEntry.assetValueGBP,
                null,
                null,
                null,
                getLocationLabelFromLinks(fee.linked),
                transferDateString,
                'Transfer Fee: ' + combineLabelAndComments(event.label, event.comments)
              ])
              console.log(`Adding extra 'Spend' row for the separate ${fee.asset} transfer fee (${feeLocationLabel}) of ${event.id} "${event.label}" (${event.date})`)
              // don't include the fee in the Withdrawal entry
              fee = null
            } else if (!feeLocationLedgerEntry && fee.asset === event.asset) {
              // The fee is taken from the source location (label).
              // Subtract the fee from the recorded 'from' amount
              amountFrom = amountFrom.minus(fee.amount)
            } else if (feeLocationLabel !== fromLocationLabel) {
              console.error(`Unexpected fee for ${event.id} ${event.label}: ${fee.asset} at ${feeLocationLabel}`)
            }
          }
          transfers.push([
            'Withdrawal',
            null,
            null,
            null,
            amountFrom,
            event.asset,
            null, // GBP value not needed for transfer events
            fee ? fee.amount : null,
            fee ? fee.asset : null,
            feeAssetLedgerEntry ? feeAssetLedgerEntry.assetValueGBP : null,
            fromLocationLabel,
            transferDateString,
            combineLabelAndComments(event.label, event.comments)
          ])
          transfers.push([
            'Deposit',
            event.to[0].amount,
            event.asset,
            null, // GBP value not needed for transfer events
            null,
            null,
            null,
            null,
            null,
            null,
            getLocationLabelFromLinks(event.to[0].linked),
            transferDateString,
            combineLabelAndComments(event.label, event.comments)
          ])
        } else if (event.from.length > 1 && event.to.length === 1) {
          console.log('Splitting N -> 1 transfer into N separate transfers', event.asset, event.label, event.date, event)
          let fee = event.fees[0]
          let feeAssetLedgerEntry = null
          let handledFee = true
          if (fee && fee.asset === event.asset) {
            // Find the assetLedgerEntry
            feeAssetLedgerEntry = getAssetLedgerEntryFromLinks(fee.linked)
            handledFee = false
          }
          for (const fromEntry of event.from) {
            let amountFrom = fromEntry.amount
            if (amountFrom.isNegative()) {
              amountFrom = amountFrom.negated()
            }
            if (!handledFee) {
              // Subtract the fee from this transfer's from amount
              amountFrom = amountFrom.minus(fee.amount)
            }
            transfers.push([
              'Withdrawal',
              null,
              null,
              null,
              amountFrom,
              event.asset,
              null, // GBP value not needed for transfer events
              !handledFee && fee ? fee.amount : null,
              !handledFee && fee ? fee.asset : null,
              !handledFee && feeAssetLedgerEntry ? feeAssetLedgerEntry.assetValueGBP : null,
              getLocationLabelFromLinks(fromEntry.linked),
              transferDateString,
              combineLabelAndComments(event.label, event.comments)
            ])
            transfers.push([
              'Deposit',
              amountFrom,
              event.asset,
              null, // GBP value not needed for transfer events
              null,
              null,
              null,
              null,
              null,
              null,
              getLocationLabelFromLinks(event.to[0].linked),
              transferDateString,
              combineLabelAndComments(event.label, event.comments)
            ])
            handledFee = true
            transferDate.add(10, 'seconds')
            transferDateString = dateFormatForExport(transferDate.toDate())
          }
        } else if (event.from.length === 1 && event.to.length > 1) {
          console.log('Splitting 1 -> N transfer into N separate transfers', event.id, event.label, event.date)
          let fee = event.fees[0]
          let feeAssetLedgerEntry = null
          let handledFee = true
          if (fee && fee.asset === event.asset) {
            // Find the assetLedgerEntry
            feeAssetLedgerEntry = getAssetLedgerEntryFromLinks(fee.linked)
            handledFee = false
          }
          for (const toEntry of event.to) {
            let amountTo = toEntry.amount
            transfers.push([
              'Withdrawal',
              null,
              null,
              null,
              amountTo,
              event.asset,
              null, // GBP value not needed for transfer events
              !handledFee && fee ? fee.amount : null,
              !handledFee && fee ? fee.asset : null,
              !handledFee && feeAssetLedgerEntry ? feeAssetLedgerEntry.assetValueGBP : null,
              getLocationLabelFromLinks(event.from[0].linked),
              transferDateString,
              combineLabelAndComments(event.label, event.comments)
            ])
            transfers.push([
              'Deposit',
              amountTo,
              event.asset,
              null, // GBP value not needed for transfer events
              null,
              null,
              null,
              null,
              null,
              null,
              getLocationLabelFromLinks(toEntry.linked),
              transferDateString,
              combineLabelAndComments(event.label, event.comments)
            ])
            handledFee = true
            transferDate.add(10, 'seconds')
            transferDateString = dateFormatForExport(transferDate.toDate())
          }
        } else {
          console.log('Splitting N -> N transfer into N -> 1 (temporary) and then 1 (temporary) -> N separate transfers', event.id, event.label, event.date)
          // N -> 1 (temporary 'wallet')
          const temporaryWalletLabel = 'Temporary transfer wallet'
          let fee = event.fees[0]
          let feeAssetLedgerEntry = null
          let handledFee = true
          if (fee && fee.asset === event.asset) {
            // Find the assetLedgerEntry
            feeAssetLedgerEntry = getAssetLedgerEntryFromLinks(fee.linked)
            handledFee = false
          }
          for (const fromEntry of event.from) {
            let amountFrom = fromEntry.amount
            if (amountFrom.isNegative()) {
              amountFrom = amountFrom.negated()
            }
            if (!handledFee) {
              // Subtract the fee from this transfer's from amount
              amountFrom = amountFrom.minus(fee.amount)
            }
            transfers.push([
              'Withdrawal',
              null,
              null,
              null,
              amountFrom,
              event.asset,
              null, // GBP value not needed for transfer events
              !handledFee && fee ? fee.amount : null,
              !handledFee && fee ? fee.asset : null,
              !handledFee && feeAssetLedgerEntry ? feeAssetLedgerEntry.assetValueGBP : null,
              getLocationLabelFromLinks(fromEntry.linked),
              transferDateString,
              combineLabelAndComments(event.label, event.comments)
            ])
            transfers.push([
              'Deposit',
              amountFrom,
              event.asset,
              null, // GBP value not needed for transfer events
              null,
              null,
              null,
              null,
              null,
              null,
              temporaryWalletLabel,
              transferDateString,
              combineLabelAndComments(event.label, event.comments)
            ])
            handledFee = true
            transferDate.add(10, 'seconds')
            transferDateString = dateFormatForExport(transferDate.toDate())
          }

          // 1 -> N separate transfers
          for (const toEntry of event.to) {
            let amountTo = toEntry.amount
            transfers.push([
              'Withdrawal',
              null,
              null,
              null,
              amountTo,
              event.asset,
              null, // GBP value not needed for transfer events
              null,
              null,
              null,
              temporaryWalletLabel,
              transferDateString,
              combineLabelAndComments(event.label, event.comments)
            ])
            transfers.push([
              'Deposit',
              amountTo,
              event.asset,
              null, // GBP value not needed for transfer events
              null,
              null,
              null,
              null,
              null,
              null,
              getLocationLabelFromLinks(toEntry.linked),
              transferDateString,
              combineLabelAndComments(event.label, event.comments)
            ])
            handledFee = true
            transferDate.add(10, 'seconds')
            transferDateString = dateFormatForExport(transferDate.toDate())
          }
        }
      }
      console.groupEnd()

      // Trades: bittytax wants a Trade row containing sold, bought and fee assets+amounts
      // * if the fee asset == sold asset, sell amount must be the net amount (without fee)
      // * if the fee asset == bought asset, buy amount must be the gross amount (including fee)
      // * if there are multiple sold or bought assets, need to split up (evenly) into multiple trades
      // * if the trade moves assets from one group to a different group, need to split this
      //   into a trade at the first location and then a transfer to the actual location
      console.group('Exporting Trades')
      const trades = []
      for (const event of this.$store.getters.tradeEvents) {
        if (event.fees.length > 1) {
          console.error('Trade has multiple fees - not supported', event)
        } else if (event.disposed.length === 1 && event.acquired.length === 1) {
          const fee = event.fees.length ? event.fees[0] : null
          let feeAssetLedgerEntry = null
          if (fee) {
            feeAssetLedgerEntry = getAssetLedgerEntryFromLinks(fee.linked)
          }

          const disposed = event.disposed[0]
          let disposedAmount = disposed.amount
          // We do NOT want to remove the fee from the disposedAmount!
          // if (fee && fee.asset === disposed.asset) {
          //   disposedAmount = disposedAmount.minus(fee.amount)
          // }
          const disposedAssetLedgerEntry = getAssetLedgerEntryFromLinks(disposed.linked)

          const acquired = event.acquired[0]
          let acquiredAmount = acquired.amount
          // We do NOT want to add the fee to the acquiredAmount!
          // if (fee && fee.asset === acquired.asset) {
          //   acquiredAmount = acquiredAmount.plus(fee.amount)
          // }
          const acquiredAssetLedgerEntry = getAssetLedgerEntryFromLinks(acquired.linked)

          const disposedWallet = getLocationLabelFromLinks(disposed.linked)
          const acquiredWallet = getLocationLabelFromLinks(acquired.linked)

          const tradeDate = dateFormatForExport(event.date)
          const tradeDesc = combineLabelAndComments(event.label, event.comments)

          trades.push([
            'Trade',
            acquiredAmount,
            acquired.asset,
            // mismatches in decimals for GBP price causes bittytax errors
            acquired.asset !== 'GBP' ? acquiredAssetLedgerEntry.assetValueGBP : null,
            disposedAmount,
            disposed.asset,
            // mismatches in decimals for GBP price causes bittytax errors
            disposed.asset !== 'GBP' ? disposedAssetLedgerEntry.assetValueGBP : null,
            fee ? fee.amount : null,
            fee ? fee.asset : null,
            feeAssetLedgerEntry ? feeAssetLedgerEntry.assetValueGBP : null,
            disposedWallet,
            tradeDate,
            tradeDesc
          ])

          if (disposedWallet !== acquiredWallet) {
            console.log(`Adding extra transfer [${disposedWallet} -> ${acquiredWallet}] after trade ${event.id} (${event.label} ${event.date})`)
            let transferDate = moment(event.date).add(10, 'seconds')
            transferDate = dateFormatForExport(transferDate.toDate())
            transfers.push([
              'Withdrawal',
              null,
              null,
              null,
              acquiredAmount,
              acquired.asset,
              null, // GBP value not needed for transfer events
              null,
              null,
              null,
              disposedWallet,
              transferDate,
              tradeDesc
            ])
            transfers.push([
              'Deposit',
              acquiredAmount,
              acquired.asset,
              null, // GBP value not needed for transfer events
              null,
              null,
              null,
              null,
              null,
              null,
              acquiredWallet,
              transferDate,
              tradeDesc
            ])
          }
        } else if (event.disposed.length > 1 || event.acquired.length === 1) {
          console.group(`Splitting trade event ${event.id} with multiple inputs (N -> 1)`, event.label, event)

          const fee = event.fees.length ? event.fees[0] : null
          let handledFee = true
          let feeAssetLedgerEntry = null
          if (fee) {
            feeAssetLedgerEntry = getAssetLedgerEntryFromLinks(fee.linked)
            handledFee = false
          }

          let disposedValueGBP = null
          for (const disposed of event.disposed) {
            const disposedAssetLedgerEntry = getAssetLedgerEntryFromLinks(disposed.linked)
            if (!disposedValueGBP) {
              disposedValueGBP = disposedAssetLedgerEntry.assetValueGBP
            } else {
              disposedValueGBP = disposedValueGBP.plus(disposedAssetLedgerEntry.assetValueGBP)
            }
          }
          const acquired = event.acquired[0]

          console.log(`Total disposed value ${disposedValueGBP} GBP`)
          console.log(`Total acquired amount ${acquired.amount} ${acquired.asset} (split this up)`)

          const disposedWallet = getLocationLabelFromLinks(event.disposed[0].linked)
          const acquiredWallet = getLocationLabelFromLinks(acquired.linked)

          const tradeDate = dateFormatForExport(event.date)
          const tradeDesc = combineLabelAndComments(event.label, event.comments)

          let remainingAcquiredAmount = acquired.amount
          for (let i = 0; i < event.disposed.length; i++) {
            const disposed = event.disposed[i]
            const disposedAssetLedgerEntry = getAssetLedgerEntryFromLinks(disposed.linked)

            // for each input, assign a proportion of the output asset
            let partAcquiredAmount = null
            if (i === event.disposed.length - 1) {
              // last input: assign whatever remains
              partAcquiredAmount = remainingAcquiredAmount
            } else {
              // calculate proportion of total acquired amount
              const proportion = disposedAssetLedgerEntry.assetValueGBP.dividedBy(disposedValueGBP)
              partAcquiredAmount = proportion.times(acquired.amount)
              remainingAcquiredAmount = remainingAcquiredAmount.minus(partAcquiredAmount)
            }
            const partAcquiredValueGBP = disposedAssetLedgerEntry.assetValueGBP
            console.log(`Assign ${disposed.amount} ${disposed.asset} (${disposedAssetLedgerEntry.assetValueGBP} GBP) -> ${partAcquiredAmount} ${acquired.asset}`)
            const myDisposedWallet = getLocationLabelFromLinks(disposed.linked)
            if (myDisposedWallet !== disposedWallet) {
              console.error(`Unsupported: Different disposals come from different wallets`, event)
            }

            trades.push([
              'Trade',
              partAcquiredAmount,
              acquired.asset,
              // mismatches in decimals for GBP price causes bittytax errors
              acquired.asset !== 'GBP' ? partAcquiredValueGBP : null,
              disposed.amount,
              disposed.asset,
              // mismatches in decimals for GBP price causes bittytax errors
              disposed.asset !== 'GBP' ? disposedAssetLedgerEntry.assetValueGBP : null,
              !handledFee && fee ? fee.amount : null,
              !handledFee && fee ? fee.asset : null,
              !handledFee && feeAssetLedgerEntry ? feeAssetLedgerEntry.assetValueGBP : null,
              disposedWallet,
              tradeDate,
              tradeDesc
            ])
            handledFee = true
          }

          if (disposedWallet !== acquiredWallet) {
            console.error('Unsupported: Disposed wallet is not the same as acquired wallet, would need to add a transfer row')
          }

          console.groupEnd()
        } else if (event.disposed.length === 1 || event.acquired.length > 1) {
          console.group(`Splitting trade event ${event.id} with multiple outputs (1 -> N)`, event.label, event)

          const fee = event.fees.length ? event.fees[0] : null
          let handledFee = true
          let feeAssetLedgerEntry = null
          if (fee) {
            feeAssetLedgerEntry = getAssetLedgerEntryFromLinks(fee.linked)
            handledFee = false
          }

          let acquiredValueGBP = null
          for (const acquired of event.acquired) {
            const acquiredAssetLedgerEntry = getAssetLedgerEntryFromLinks(acquired.linked)
            if (!acquiredValueGBP) {
              acquiredValueGBP = acquiredAssetLedgerEntry.assetValueGBP
            } else {
              acquiredValueGBP = acquiredValueGBP.plus(acquiredAssetLedgerEntry.assetValueGBP)
            }
          }

          const disposed = event.disposed[0]
          console.log(`Total acquired value ${acquiredValueGBP} GBP`)
          console.log(`Total disposed amount ${disposed.amount} ${disposed.asset} (split this up)`)

          const acquiredWallet = getLocationLabelFromLinks(event.acquired[0].linked)
          const disposedWallet = getLocationLabelFromLinks(disposed.linked)

          const tradeDate = dateFormatForExport(event.date)
          const tradeDesc = combineLabelAndComments(event.label, event.comments)

          let remainingDisposedAmount = disposed.amount
          for (let i = 0; i < event.acquired.length; i++) {
            const acquired = event.acquired[i]
            const acquiredAssetLedgerEntry = getAssetLedgerEntryFromLinks(acquired.linked)

            // for each output, assign a proportion of the input asset
            let partDisposedAmount = null
            if (i === event.acquired.length - 1) {
              // last output: assign whatever remains
              partDisposedAmount = remainingDisposedAmount
            } else {
              // calculate proportion of total acquired amount
              const proportion = acquiredAssetLedgerEntry.assetValueGBP.dividedBy(acquiredValueGBP)
              partDisposedAmount = proportion.times(disposed.amount)
              remainingDisposedAmount = remainingDisposedAmount.minus(partDisposedAmount)
            }
            const partDisposedValueGBP = acquiredAssetLedgerEntry.assetValueGBP
            console.log(`Assign ${partDisposedAmount} ${disposed.asset} -> ${acquired.amount} ${acquired.asset} (${acquiredAssetLedgerEntry.assetValueGBP} GBP)`)
            const myAcquiredWallet = getLocationLabelFromLinks(acquired.linked)
            if (myAcquiredWallet !== acquiredWallet) {
              console.error(`Unsupported: Different acquired assets are going to different wallets`, event)
            }

            trades.push([
              'Trade',
              acquired.amount,
              acquired.asset,
              // mismatches in decimals for GBP price causes bittytax errors
              acquired.asset !== 'GBP' ? acquiredAssetLedgerEntry.assetValueGBP : null,
              partDisposedAmount,
              disposed.asset,
              // mismatches in decimals for GBP price causes bittytax errors
              disposed.asset !== 'GBP' ? partDisposedValueGBP : null,
              !handledFee && fee ? fee.amount : null,
              !handledFee && fee ? fee.asset : null,
              !handledFee && feeAssetLedgerEntry ? feeAssetLedgerEntry.assetValueGBP : null,
              disposedWallet,
              tradeDate,
              tradeDesc
            ])
            handledFee = true
          }

          if (disposedWallet !== acquiredWallet) {
            console.error('Unsupported: Disposed wallet is not the same as acquired wallet, would need to add a transfer row')
          }

          console.groupEnd()
        } else if (event.disposed.length > 1 && event.acquired.length > 1) {
          console.error('Unsupported: trade event with multiple inputs AND outputs', event.label, event)
        } else {
          console.error('Unexpected trade event', event.label, event)
        }
      }
      console.groupEnd()

      const rows = [
        ...deposits,
        ...mining,
        ...income,
        ...transfers,
        ...spends,
        ...trades
      ]

      // sort by date, try to avoid negative balances
      console.group('Sorting rows by date')
      rows.sort((a, b) => {
        const aDate = a[11]
        const bDate = b[11]
        if (aDate === bDate) {
          // If there are different row types, try to order Withdrawal/Deposit sensibly
          if (a[0] === 'Withdrawal' && b[0] === 'Deposit') {
            // if this is a transfer to the same location, put Deposit before Withdrawal
            if (a[10] === b[10]) {
              return 1
            }
            // otherwise put Withdrawal before deposit
            return -1
          } else if (a[0] === 'Deposit' && b[0] === 'Withdrawal') {
            // if this is a transfer to the same location, put Deposit before Withdrawal
            if (a[10] === b[10]) {
              return -1
            }
            // otherwise put Withdrawal before deposit
            return 1
          } else if (a[0] === 'Trade' && b[0] === 'Trade') {
            // Two trades at the same time: try to order them correctly
            const aOut = a[2]
            const aIn = a[5]
            const bOut = b[2]
            const bIn = b[5]
            // console.log(`sorting trades: (${aIn} -> ${aOut}) and (${bIn} -> ${bOut})`)
            if (aOut === bIn) {
              // a before b
              console.log(`Putting (${aIn} -> ${aOut}) before (${bIn} -> ${bOut}) (${a[11]} ${a[12]})`)
              return -1
            }
            if (bOut === aIn) {
              // b before a
              console.log(`Putting (${bIn} -> ${bOut}) before (${aIn} -> ${aOut}) (${a[11]} ${a[12]})`)
              return 1
            }
          }
          return 0
        }
        return aDate < bDate ? -1 : 1
      })
      console.groupEnd()

      this.bittyTaxExport = stringify(
        [
          headers,
          ...rows
        ],
        {
          cast: {
            object: function (value) {
              if (value._isBigNumber) {
                return { value: value.toString(), quote: false }
              }
              return value.toString()
            }
          }
        }
      )
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
