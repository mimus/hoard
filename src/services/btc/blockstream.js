import u from '../../utils'

var addressLink = {
  link: item => (item && `https://blockstream.info/address/${item}`) || false,
  linkTitle: item => 'View address on Blockstream',
  label: item => item,
  shortLabel: item => u.truncateToFirst(item, 6)
}

var transactionLink = {
  link: item => (item && `https://blockstream.info/tx/${item}`) || false,
  linkTitle: item => 'View transaction on Blockstream',
  label: item => item,
  shortLabel: item => u.truncateToFirst(item, 6)
}

export default {
  id: 'blockchair',
  label: 'Blockchair.com',
  addressLink,
  transactionLink
}
