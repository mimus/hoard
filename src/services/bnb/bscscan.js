import u from '../../utils'

var addressLink = {
  link: item => (item && `https://bscscan.com/address/${item}`) || false,
  linkTitle: item => 'View address on BscScan',
  label: item => item,
  shortLabel: item => u.truncateToFirst(item, 6)
}

var transactionLink = {
  link: item => (item && `https://bscscan.com/tx/${item}`) || false,
  linkTitle: item => 'View transaction on BscScan',
  label: item => item,
  shortLabel: item => u.truncateToFirst(item, 6)
}

export default {
  id: 'bscscan',
  label: 'BscScan',
  addressLink,
  transactionLink
}
