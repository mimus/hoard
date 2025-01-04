import polygonscanTokenService from '../matic/polygonscan_token'
import maticvigil from '../matic/maticvigil'
import polygonscan from '../matic/polygonscan'

const maticTokenAddress = '0x8dF3aad3a84da6b69A4DA8aeC3eA40d9091B2Ac4'

export default {
  services: [ polygonscanTokenService(maticTokenAddress), maticvigil, polygonscan ],
  maticTokenAddress
}
