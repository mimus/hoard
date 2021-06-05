import u from '../../utils'

var addressLink = {
  link: item => (item && `https://explorer-mainnet.maticvigil.com/address/${item}`) || false,
  linkTitle: item => 'View address on maticvigil',
  label: item => item,
  shortLabel: item => u.truncateToFirst(item, 6)
}

var transactionLink = {
  link: item => (item && `https://explorer-mainnet.maticvigil.com/tx/${item}`) || false,
  linkTitle: item => 'View transaction on maticvigil',
  label: item => item,
  shortLabel: item => u.truncateToFirst(item, 6)
}

export default {
  id: 'maticvigil-explorer',
  label: 'Matic Explorer',
  addressLink,
  transactionLink
}
