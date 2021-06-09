import polygonscan from './polygonscan'

var generatePolygonTokenService = function (tokenContract) {
  var addressLink = Object.assign({}, polygonscan.addressLink)
  addressLink.link = item => (item && `https://polygonscan.com/token/${tokenContract}?a=${item}`) || false
  return {
    addressLink,
    transactionLink: polygonscan.transactionLink
  }
}

export default generatePolygonTokenService
