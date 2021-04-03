import moment from 'moment'
import { BigNumber } from 'bignumber.js'
// Don't use exponential notation
BigNumber.config({ EXPONENTIAL_AT: [-30, 30] })

var pick = function (o, ...props) {
  return Object.assign({}, ...props.map(prop => ({ [prop]: o[prop] })))
}

var ASSET_DECIMALS = {
  ETH: 18,
  OMG: 18,
  BTC: 8,
  BCH: 8,
  BTG: 8,
  ZEC: 8,
  LTC: 8,
  VTC: 8,
  XVG: 8,
  GAS: 8,
  USDT: 8,
  XRP: 8,
  _FIAT: 2,
  GBP: 2,
  EUR: 2,
  USD: 2,
  DAI: 18,
  GUSD: 8,
  BUSD: 18,
  LPT: 18,
  LSK: 8,
  NEO: 8,
  WBTC: 8,
  XMR: 12
}

var BIG_NUMBER_FOR_ASSET = Object.entries(ASSET_DECIMALS)
  .reduce((memo, [asset, decimals]) => {
    memo[asset] = BigNumber.clone({ DECIMAL_PLACES: decimals, EXPONENTIAL_AT: [-30, 30] })
    return memo
  }, {})

var BIG_NUMBER_WITH_DECIMALS = BigNumber.clone({ DECIMAL_PLACES: 40, EXPONENTIAL_AT: [-30, 30] })

var newBigNumberForAsset = (value, asset) => {
  var BN = BIG_NUMBER_FOR_ASSET[asset] || BigNumber
  return new BN(value)
}
var newBigNumberForFiat = (value) => {
  var BN = BIG_NUMBER_FOR_ASSET._FIAT
  return new BN(value)
}

var newBigNumberWithDecimals = (value) => {
  // For division, we need to explicitly use many decimal places, otherwise precision is lost
  return new BIG_NUMBER_WITH_DECIMALS(value)
}

var safeFormatDate = (value, format) => {
  var date = moment(value)
  if (date.isValid()) { return date.format(format) }
  return null
}
var formatDate = value => safeFormatDate(value, 'YYYY-MM-DD')
var formatDateTime = value => safeFormatDate(value, 'YYYY-MM-DD HH:mm')
var formatDateTimePlain = value => safeFormatDate(value, 'YYYY-MM-DD_HH-mm')

var datesAreSame = (a, b) => moment(a).isSame(b)

var dateComparatorEarliestFirst = (a, b) => {
  var result = (a.date - b.date)
  if (result !== 0) { return result }
  // fallback for identical dates: see if there is an amount, and put + before -
  if (a.hasOwnProperty('amount') && b.hasOwnProperty('amount')) {
    return ((+b.amount) - (+a.amount))
  }
  return result
}

var truncateToFirst = (str, n) => (str && str.substring(0, 6)) || ''

/* from MDN Math.round page: avoid floating point errors */
var round = function (number, precision) {
  var shift = function (number, precision, reverseShift) {
    if (reverseShift) {
      precision = -precision
    }
    var numArray = ('' + number).split('e')
    return +(numArray[0] + 'e' + (numArray[1] ? (+numArray[1] + precision) : precision))
  }
  return shift(Math.round(shift(number, precision, false)), precision, true)
}

var roundAssetValue = function (value, asset, toFixed) {
  var decimals = ASSET_DECIMALS[asset]
  if (decimals === undefined) { return +value }

  if (typeof value === 'string') {
    value = newBigNumberForAsset(value, asset)
  }

  if (BigNumber.isBigNumber(value)) {
    value = value.decimalPlaces(decimals)
    if (toFixed) { value = value.toFixed(decimals) }
  } else {
    value = round(value, decimals)
    if (toFixed) { value = value.toFixed(decimals) }
  }
  return value
}

var formatAssetValue = function (value, asset) {
  return roundAssetValue(value, asset, true)
}

var roundFiat = function (value, toFixed) {
  return roundAssetValue(value, '_FIAT', toFixed)
}
var formatFiat = function (value) {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(roundFiat(value, true))
}

var textFile = null
var makeJsonFileUrl = function (obj) {
  var data = new Blob([JSON.stringify(obj, null, 2)], { type: 'text/json' })

  // If we are replacing a previously generated file we need to
  // manually revoke the object URL to avoid memory leaks.
  if (textFile !== null) {
    window.URL.revokeObjectURL(textFile)
  }

  textFile = window.URL.createObjectURL(data)

  // returns a URL you can use as a href
  return textFile
}

export default {
  BigNumber,
  newBigNumberForAsset,
  newBigNumberForFiat,
  newBigNumberWithDecimals,
  pick,
  makeJsonFileUrl,
  formatDate,
  formatDateTime,
  formatDateTimePlain,
  datesAreSame,
  dateComparatorEarliestFirst,
  truncateToFirst,
  roundAssetValue,
  formatAssetValue,
  roundFiat,
  formatFiat
}
