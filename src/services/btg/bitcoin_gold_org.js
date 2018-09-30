import u from '../../utils'

var addressLink = {
  link: item => (item && `https://explorer.bitcoingold.org/insight/address/${item}`) || false,
  linkTitle: item => 'View address on Bitcoin Gold Explorer',
  label: item => item,
  shortLabel: item => u.truncateToFirst(item, 6)
}

var transactionLink = {
  link: item => (item && `https://explorer.bitcoingold.org/insight/tx/${item}`) || false,
  linkTitle: item => 'View transaction on Bitcoin Gold Explorer',
  label: item => item,
  shortLabel: item => u.truncateToFirst(item, 6)
}

export default {
  id: 'bitcoin_gold_org',
  label: 'Bitcoin Gold Explorer',
  addressLink,
  transactionLink
}
