import polygonscanTokenService from '../matic/polygonscan_token'
import maticvigil from '../matic/maticvigil'
import covalenthq from '../matic/covalenthq'

// Pool: USDC/LINK/WETH/BAL/AAVE
const maticTokenAddress = '0x36128d5436d2d70cab39c9af9cce146c38554ff0'

export default {
  services: [ polygonscanTokenService(maticTokenAddress), maticvigil, covalenthq ],
  maticTokenAddress
}
