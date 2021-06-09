import polygonscanTokenService from '../matic/polygonscan_token'
import maticvigil from '../matic/maticvigil'
import covalenthq from '../matic/covalenthq'

const maticTokenAddress = '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063'

export default {
  services: [ polygonscanTokenService(maticTokenAddress), maticvigil, covalenthq ],
  maticTokenAddress
}
