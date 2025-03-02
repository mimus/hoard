import polygonscanTokenService from '../matic/polygonscan_token'
import maticvigil from '../matic/maticvigil'
import polygonscan from '../matic/polygonscan'

const maticTokenAddress = '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270'

export default {
  services: [ polygonscanTokenService(maticTokenAddress), maticvigil, polygonscan ],
  maticTokenAddress
}
