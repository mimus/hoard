import u from '../../utils'

var addressLink = {
  link: item => false,
  linkTitle: item => '',
  label: item => item,
  shortLabel: item => u.truncateToFirst(item, 6)
}

var transactionLink = {
  link: item => (item && `https://localmonero.co/blocks/search/${item}`) || false,
  linkTitle: item => '',
  label: item => item,
  shortLabel: item => u.truncateToFirst(item, 6)
}

export default {
  id: 'localmonero',
  label: 'localmonero.co',
  addressLink,
  transactionLink
}
