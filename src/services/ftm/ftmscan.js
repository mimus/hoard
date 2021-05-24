import u from '../../utils'

var addressLink = {
  link: item => (item && `https://ftmscan.com/address/${item}`) || false,
  linkTitle: item => 'View address on FTMScan',
  label: item => item,
  shortLabel: item => u.truncateToFirst(item, 6)
}

var transactionLink = {
  link: item => (item && `https://ftmscan.com/tx/${item}`) || false,
  linkTitle: item => 'View transaction on FTMScan',
  label: item => item,
  shortLabel: item => u.truncateToFirst(item, 6)
}

export default {
  id: 'ftmscan',
  label: 'FTMScan',
  addressLink,
  transactionLink
}
