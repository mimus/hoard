import ftmscan from './ftmscan'

var generateFtmTokenService = function (tokenContract) {
  var addressLink = Object.assign({}, ftmscan.addressLink)
  addressLink.link = item => (item && `https://ftmscan.com/token/${tokenContract}?a=${item}`) || false
  return {
    addressLink,
    transactionLink: ftmscan.transactionLink
  }
}

export default generateFtmTokenService
