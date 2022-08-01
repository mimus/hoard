import BTC from './btc'
import BCH from './bch'
import BTG from './btg'
import ETH from './eth'
import OMG from './omg'
import ZEC from './zec'
import LTC from './ltc'
import VTC from './vtc'
import XVG from './xvg'
import LSK from './lsk'
import NEO from './neo'
import GAS from './gas'
import BCD from './bcd'
import DAI from './dai'
import WBTC from './wbtc'
import GUSD from './gusd'
import LPT from './lpt'
import XMR from './xmr'
import BNB from './bnb'
import BUSDT from './busdt'
import DAI_B from './dai-binance'
import BTCB from './btcb'
import AUTOv2 from './autov2'
import MDX from './mdx'
import SNX from './snx'
import LINK from './link'
import COMP from './comp'
import MATIC from './matic'
import USDT from './usdt-matic'
import USDC from './usdc'
// import DAI_M from './dai-matic'
import TUSD from './tusd'
// import CRV_M from './crv-matic'
import AAVE_M from './aave-matic'
import WETH_M from './eth-matic'
import LINK_M from './link-matic'
import BAL from './bal'
import WBTC_M from './wbtc-matic'
import B_POLYDEFI from './balancer-polydefi'
import B_POLYDEFI2 from './balancer-polydefi2'
import BPSP_TUSD from './balancer-tusdstable'
import amUSDT from './amUSDT'
import amCRV from './amCRV'
import amBAL from './amBAL'
import WMATIC from './wmatic'
import amWMATIC from './amWMATIC'
import amWBTC from './amWBTC'
import amAAVE from './amAAVE'
import UNI from './uni'
import CRV from './crv'
import _1INCH from './1inch'
import YFI from './yfi'
import CRO from './cro'
import FTM from './ftm'
import USDC_FTM from './usdc-ftm'
import am3CRV from './am3crv'
import btcCRV from './btccrv'
import GHST from './ghst'
import FUD from './fud'
import FOMO from './fomo'
import ALPHA from './alpha'
import KEK from './kek'
import SOS from './sos'

import binance from './binance'
import celsius from './celsius'
import { registerToken as covalentRegisterMaticToken } from './matic/covalenthq'

var index = {
  BTC,
  BCH,
  BTG,
  ETH,
  OMG,
  ZEC,
  LTC,
  VTC,
  XVG,
  LSK,
  NEO,
  GAS,
  BCD,
  DAI,
  WBTC,
  GUSD,
  LPT,
  XMR,
  BNB,
  'BUSD-T': BUSDT,
  'DAI-B': DAI_B,
  BTCB,
  AUTOv2,
  MDX,
  SNX,
  LINK,
  COMP,
  MATIC,
  UNI,
  CRV,
  YFI,
  CRO,
  '1INCH': _1INCH,
  USDT,
  USDC,
  // 'DAI-M': DAI_M,
  'TUSD': TUSD,
  // 'CRV-M': CRV_M,
  'AAVE-M': AAVE_M,
  // 'WETH-M': WETH_M,
  WETH: WETH_M,
  'LINK-M': LINK_M,
  'BAL': BAL,
  'WBTC-M': WBTC_M,
  'B-POLYDEFI': B_POLYDEFI,
  'B-POLYDEFI2': B_POLYDEFI2,
  'BPSP-TUSD': BPSP_TUSD,
  amUSDT,
  amCRV,
  amBAL,
  WMATIC,
  amWMATIC,
  amWBTC,
  amAAVE,
  FTM,
  'USDC-FTM': USDC_FTM,
  am3CRV,
  btcCRV,
  GHST,
  FUD,
  FOMO,
  ALPHA,
  KEK,
  SOS
}

Object.entries(index).forEach(([key, item]) => {
  if (item.services) {
    // store ref to the first available implementations
    item.services.forEach(service => {
      item.addressLink = item.addressLink || service.addressLink
      item.transactionLink = item.transactionLink || service.transactionLink
      item.fetchTransaction = item.fetchTransaction || service.fetchTransaction
    })
  }
  if (item.maticTokenAddress) {
    covalentRegisterMaticToken({ address: item.maticTokenAddress, assetId: key })
  }
})

// some services can potentially apply to all assets
const genericServices = [binance, celsius].map(({ services }) => services).flat()
export { genericServices }

export default index
