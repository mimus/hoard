import u from '../../utils'

var addressLink = {
  link: item => (item && `http://explorer.litecoin.net/address/${item}`) || false,
  linkTitle: item => 'View address on Litecoin.net',
  label: item => item,
  shortLabel: item => u.truncateToFirst(item, 6)
}

var transactionLink = {
  link: item => (item && `http://explorer.litecoin.net/tx/${item}`) || false,
  linkTitle: item => 'View transaction on Litecoin.net',
  label: item => item,
  shortLabel: item => u.truncateToFirst(item, 6)
}

export default {
  id: 'litecoin_net',
  label: 'Litecoin.net',
  addressLink,
  transactionLink
}
