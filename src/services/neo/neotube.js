import u from '../../utils'

var addressLink = {
  link: item => (item && `https://neo2.neotube.io/address/${item}`) || false,
  linkTitle: item => 'View address on NeoTube',
  label: item => item,
  shortLabel: item => u.truncateToFirst(item, 6)
}

var transactionLink = {
  link: item => (item && `https://neo2.neotube.io/transaction/${item}`) || false,
  linkTitle: item => 'View transaction on NeoTube',
  label: item => item,
  shortLabel: item => u.truncateToFirst(item, 6)
}

export default {
  id: 'neotube',
  label: 'NeoTube',
  addressLink,
  transactionLink
}
