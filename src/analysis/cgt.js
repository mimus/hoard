import u from '../utils'
import moment from 'moment'

var isDateSameDay = (date1, date2) => {
  return moment(date1).isSame(date2, 'day')
}

var isDateBetweenDaysInclusive = (date1, fromDate, toDate) => {
  var d = moment(date1)
  return d.isSameOrBefore(toDate, 'day') && d.isSameOrAfter(fromDate, 'day')
}

var findNearbyAcquisitions = function (entry, index, entries) {
  var sameDay = []
  var thirtyDays = []
  var i, e
  // Look backward to find all same-day acquisitions
  for (i = index - 1; i > -1; i--) {
    e = entries[i]
    if (isDateSameDay(e.date, entry.date)) {
      if (e.type === 'acquisition') {
        sameDay.push(e)
      }
    } else {
      break
    }
  }
  // Look forward to find all same-day acquisitions
  for (i = index + 1; i < entries.length; i++) {
    e = entries[i]
    if (isDateSameDay(e.date, entry.date)) {
      if (e.type === 'acquisition') {
        sameDay.push(e)
      }
    } else {
      break
    }
  }
  // Look forward to find all 1-30 day acquisitions
  var fromDay = moment(entry.date).add(1, 'day')
  var toDay = moment(entry.date).add(30, 'day')
  for (i = index + 1; i < entries.length; i++) {
    e = entries[i]
    if (isDateSameDay(e.date, entry.date)) {
      // ignore, next
    } else if (isDateBetweenDaysInclusive(e.date, fromDay, toDay)) {
      if (e.type === 'acquisition') {
        thirtyDays.push(e)
      }
    } else {
      break
    }
  }

  return { sameDay, thirtyDays }
}

var matchWithAcquisitions = function (entry, asset, type) {
  var amountToDispose = entry.amount.negated()
  var disposalPlan = entry.disposalPlan = (entry.disposalPlan || [])
  // remove already-planned disposals from amountToDispose
  for (const plan of disposalPlan) {
    amountToDispose = amountToDispose.minus(plan.amount)
  }

  var matchWithEntry = function (e) {
    // console.log("Match with e", type, e.poolAmount, amountToDispose)
    if (e.poolAmount.gt(0) && amountToDispose.gt(0)) {
      var toDispose = u.BigNumber.min(e.poolAmount, amountToDispose)
      // add this entry to the disposal plan
      disposalPlan.push({
        type,
        entry: e,
        amount: toDispose
      })
      // remove used amount of the acquisition entry from the pool
      e.poolAmount = e.poolAmount.minus(toDispose)
      amountToDispose = amountToDispose.minus(toDispose)
    }
  }
  // Divide the amountToDispose among assets gathered from:
  if (amountToDispose.gt(0)) {
    if (type === 'SAME_DAY') {
      // 1) same day asset purchases (track 'used' amount on that entry)
      entry.nearby.sameDay.forEach(matchWithEntry)
    } else if (type === '30_DAYS' && amountToDispose.gt(0)) {
      // 2) assets purchased in 30 days following the disposal (track 'used' amount on that entry)
      entry.nearby.thirtyDays.forEach(matchWithEntry)
    } else if (type === 'POOL') {
      // 3) the average price for the current pool (TAE)
      disposalPlan.push({
        type: 'POOL',
        amount: amountToDispose
      })
    }
  }
}

var calculateAndApplyGain = function (entry, currentPoolPrice) {
  var cost = u.newBigNumberForFiat(0)
  var disposedPool = {
    amount: u.newBigNumberForAsset(0, entry.asset),
    cost: u.newBigNumberForFiat(0)
  }

  entry.disposalPlan.forEach(part => {
    switch (part.type) {
      case 'SAME_DAY':
      case '30_DAYS':
        part.cost = u.roundFiat(u.newBigNumberWithDecimals(part.entry.assetValueGBP).times(part.amount).div(part.entry.amount))
        cost = cost.plus(part.cost)
        break
      case 'POOL':
        part.cost = u.roundFiat(part.amount.times(currentPoolPrice))
        disposedPool.amount = disposedPool.amount.plus(part.amount)
        disposedPool.cost = disposedPool.cost.plus(part.cost)
        cost = cost.plus(disposedPool.cost)
        break
      default:
    }
  })

  // Store the total costBasis and gain on the entry
  entry.costBasis = u.roundFiat(cost)
  entry.gain = u.roundFiat(entry.assetValueGBP.minus(entry.costBasis))

  return disposedPool
}

var calculateAssetsLedger = function (originalEntriesByAsset) {
  var workingsById = {}
  Object.entries(originalEntriesByAsset).forEach(([asset, originalEntries]) => {
    // Copy the entries
    var entries = [].concat(originalEntries.map(entry => Object.assign({}, entry)))

    // Sort entries by date
    entries.sort(u.dateComparatorEarliestFirst)

    // Each acquisition is initially assigned in full to the pool,
    // and each disposal must be aware of acquisitions on 1) same day 2) next 30 days (inclusive)
    entries.forEach((entry, index) => {
      if (entry.type === 'acquisition') {
        entry.poolAmount = entry.amount
      } else if (entry.type === 'disposal') {
        entry.nearby = findNearbyAcquisitions(entry, index, entries)
        // console.log('Disposal with nearby:', entry.date, entry.nearby)
      }
    })

    // Match disposals with acquisitions 1/2/3:
    // acquisition amounts matched for 1 and 2 cannot be part of the pool
    // Match each category separately, so they can take priority
    for (const entry of entries) {
      if (entry.type === 'disposal') {
        matchWithAcquisitions(entry, asset, 'SAME_DAY')
      }
    }
    for (const entry of entries) {
      if (entry.type === 'disposal') {
        matchWithAcquisitions(entry, asset, '30_DAYS')
      }
    }
    for (const entry of entries) {
      if (entry.type === 'disposal') {
        matchWithAcquisitions(entry, asset, 'POOL')
      }
    }

    // Now we know exactly which assets are part of the pool,
    // calculate running pool amount/cost and the cost basis for all disposals
    var totalPoolAmount = u.newBigNumberForAsset(0, asset) // running total amount of asset in pool
    var totalPoolCost = u.newBigNumberForFiat(0) // running total cost of assets in pool
    entries.forEach((entry, index) => {
      if (entry.type === 'acquisition') {
        if (entry.amount.isZero()) {
          entry.poolValueGBP = u.newBigNumberForFiat(0)
        } else {
          entry.poolValueGBP = u.roundFiat(u.newBigNumberWithDecimals(entry.assetValueGBP).times(entry.poolAmount).div(entry.amount))
        }
        totalPoolCost = totalPoolCost.plus(entry.poolValueGBP)
        totalPoolAmount = totalPoolAmount.plus(entry.poolAmount)
      } else if (entry.type === 'disposal') {
        var disposedPool = calculateAndApplyGain(entry, u.newBigNumberWithDecimals(totalPoolCost).div(totalPoolAmount))
        totalPoolCost = totalPoolCost.minus(disposedPool.cost)
        totalPoolAmount = totalPoolAmount.minus(disposedPool.amount)
      }
      entry.totalPoolAmount = totalPoolAmount
      entry.totalPoolCost = totalPoolCost
    })

    // Extract just the workings to return
    entries.forEach((entry, index) => {
      var workings = workingsById[entry.id] = {
        id: entry.id,
        totalPoolAmount: entry.totalPoolAmount,
        totalPoolCost: entry.totalPoolCost
      }
      if (entry.type === 'acquisition') {
        workings.poolAmount = entry.poolAmount
        workings.poolValueGBP = entry.poolValueGBP
      } else if (entry.type === 'disposal') {
        workings.disposalPlan = entry.disposalPlan.map(part => {
          // only include brief references to entries in disposal plan
          part = Object.assign({}, part)
          if (part.entry) {
            part.entry = { id: part.entry.id, date: part.entry.date }
          }
          return part
        })
        workings.costBasis = entry.costBasis
        workings.gain = entry.gain
      }
    })
  })

  return workingsById
}

export default {
  calculateAssetsLedger
}
