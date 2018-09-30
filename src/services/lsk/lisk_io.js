import u from '../../utils'

var addressLink = {
  link: item => (item && `https://explorer.lisk.io/address/${item}`) || false,
  linkTitle: item => 'View address on Lisk Explorer',
  label: item => item,
  shortLabel: item => u.truncateToFirst(item, 6)
}

var transactionLink = {
  link: item => (item && `https://explorer.lisk.io/tx/${item}`) || false,
  linkTitle: item => 'View transaction on Lisk Explorer',
  label: item => item,
  shortLabel: item => u.truncateToFirst(item, 6)
}

export default {
  id: 'lisk_io',
  label: 'Lisk Explorer',
  addressLink,
  transactionLink
}
