import u from '../../utils'

var addressLink = {
  link: item => (item && `https://explorer.bitcoin.com/bch/address/${item}`) || false,
  linkTitle: item => 'View address on Bitcoin Cash Block Explorer',
  label: item => item,
  shortLabel: item => u.truncateToFirst(item, 6)
}

var transactionLink = {
  link: item => (item && `https://explorer.bitcoin.com/bch/tx/${item}`) || false,
  linkTitle: item => 'View transaction on Bitcoin Cash Block Explorer',
  label: item => item,
  shortLabel: item => u.truncateToFirst(item, 6)
}

export default {
  id: 'bitcoin_com',
  label: 'Bitcoin Cash Block Explorer',
  addressLink,
  transactionLink
}
