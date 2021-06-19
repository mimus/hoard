import polygonscanTokenService from '../matic/polygonscan_token'
import maticvigil from '../matic/maticvigil'
import covalenthq from '../matic/covalenthq'

const maticTokenAddress = '0xf8a57c1d3b9629b77b6726a042ca48990a84fb49'

export default {
  services: [ polygonscanTokenService(maticTokenAddress), maticvigil, covalenthq ],
  maticTokenAddress
}
