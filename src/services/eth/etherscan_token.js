import etherscan from './etherscan'

var generateEthTokenService = function (tokenContract) {
  var addressLink = Object.assign({}, etherscan.addressLink)
  addressLink.link = item => (item && `https://etherscan.io/token/${tokenContract}?a=${item}`) || false
  return {
    addressLink,
    transactionLink: etherscan.transactionLink
  }
}

export default generateEthTokenService
