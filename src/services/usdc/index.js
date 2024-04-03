import polygonscanTokenService from '../matic/polygonscan_token'
import maticvigil from '../matic/maticvigil'
import covalenthq from '../matic/covalenthq'

// const maticTokenAddress = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174'  // original
const maticTokenAddress = '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359' // new

export default {
  services: [ polygonscanTokenService(maticTokenAddress), maticvigil, covalenthq ],
  maticTokenAddress
}
