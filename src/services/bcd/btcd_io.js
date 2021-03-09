import u from '../../utils'

var addressLink = {
  link: item => (item && `http://explorer.btcd.io/#/address?address=${item}`) || false,
  linkTitle: item => 'View address on Bitcoin Diamond Explorer',
  label: item => item,
  shortLabel: item => u.truncateToFirst(item, 6)
}

var transactionLink = {
  link: item => (item && `http://explorer.btcd.io/#/tx?tx=${item}`) || false,
  linkTitle: item => 'View transaction on Bitcoin Diamond Explorer',
  label: item => item,
  shortLabel: item => u.truncateToFirst(item, 6)
}

export default {
  id: 'btcd_io',
  label: 'Bitcoin Diamond Explorer',
  addressLink,
  transactionLink
}
