import u from '../../utils'

var addressLink = {
  link: item => (item && `https://neoscan.io/address/${item}`) || false,
  linkTitle: item => 'View address on NEOSCAN',
  label: item => item,
  shortLabel: item => u.truncateToFirst(item, 6)
}

var transactionLink = {
  link: item => (item && `https://neoscan.io/transaction/${item}`) || false,
  linkTitle: item => 'View transaction on NEOSCAN',
  label: item => item,
  shortLabel: item => u.truncateToFirst(item, 6)
}

export default {
  id: 'neoscan',
  label: 'NEOSCAN',
  addressLink,
  transactionLink
}
