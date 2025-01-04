import polygonscanTokenService from '../matic/polygonscan_token'
import maticvigil from '../matic/maticvigil'
import polygonscan from '../matic/polygonscan'

const maticTokenAddress = '0x8c059898ca6274750b6bF1cf38F2848347C490cc'

export default {
  services: [ polygonscanTokenService(maticTokenAddress), maticvigil, polygonscan ],
  maticTokenAddress
}
