import u from '../../utils'

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

export default {
  id: 'polygonscan',
  label: 'PolygonScan',
  addressLink,
  transactionLink
}
