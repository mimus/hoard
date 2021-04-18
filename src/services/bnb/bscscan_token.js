import bscscan from './bscscan'

var generateBSCTokenService = function (tokenContract) {
  var addressLink = Object.assign({}, bscscan.addressLink)
  addressLink.link = item => (item && `https://bscscan.com/token/${tokenContract}?a=${item}`) || false
  return {
    addressLink,
    transactionLink: bscscan.transactionLink
  }
}

export default generateBSCTokenService
