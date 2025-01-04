import polygonscanTokenService from '../matic/polygonscan_token'
import maticvigil from '../matic/maticvigil'
import polygonscan from '../matic/polygonscan'

const maticTokenAddress = '0x73958d46B7aA2bc94926d8a215Fa560A5CdCA3eA'

export default {
  services: [ polygonscanTokenService(maticTokenAddress), maticvigil, polygonscan ],
  maticTokenAddress
}
