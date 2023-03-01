import polygonscanTokenService from '../matic/polygonscan_token'
import maticvigil from '../matic/maticvigil'
import covalenthq from '../matic/covalenthq'

const maticTokenAddress = '0x3801C3B3B5c98F88a9c9005966AA96aa440B9Afc'

export default {
  services: [ polygonscanTokenService(maticTokenAddress), maticvigil, covalenthq ],
  maticTokenAddress
}
