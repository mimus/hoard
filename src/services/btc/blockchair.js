import u from '../../utils'

var addressLink = {
  link: item => (item && `https://www.blockchair.com/bitcoin/address/${item}`) || false,
  linkTitle: item => 'View address on Blockchair',
  label: item => item,
  shortLabel: item => u.truncateToFirst(item, 6)
}

var transactionLink = {
  link: item => (item && `https://www.blockchair.com/bitcoin/transaction/${item}`) || false,
  linkTitle: item => 'View transaction on Blockchair',
  label: item => item,
  shortLabel: item => u.truncateToFirst(item, 6)
}

export default {
  id: 'blockchair',
  label: 'Blockchair.com',
  addressLink,
  transactionLink
}
