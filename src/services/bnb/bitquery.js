import u from '../../utils'

var addressLink = {
  link: item => (item && `https://explorer.bitquery.io/bsc/address/${item}`) || false,
  linkTitle: item => 'View address on Bitquery',
  label: item => item,
  shortLabel: item => u.truncateToFirst(item, 6)
}

var transactionLink = {
  link: item => (item && `https://explorer.bitquery.io/bsc/tx/${item}`) || false,
  linkTitle: item => 'View transaction on Bitquery',
  label: item => item,
  shortLabel: item => u.truncateToFirst(item, 6)
}

export default {
  id: 'bitquery_bsc',
  label: 'Bitquery',
  addressLink,
  transactionLink
}
