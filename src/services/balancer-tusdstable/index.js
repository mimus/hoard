import polygonscanTokenService from '../matic/polygonscan_token'
import maticvigil from '../matic/maticvigil'
import polygonscan from '../matic/polygonscan'

const maticTokenAddress = '0x0d34e5dd4d8f043557145598e4e2dc286b35fd4f'

// Pool: USDC/TUSD/DAI/USDT
export default {
  services: [ polygonscanTokenService(maticTokenAddress), maticvigil, polygonscan ],
  maticTokenAddress
}
