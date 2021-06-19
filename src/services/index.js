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
import MATIC from './matic'
import USDT_M from './usdt-matic'
import USDC_M from './usdc-matic'
import DAI_M from './dai-matic'
import CRV_M from './crv-matic'
import amUSDT from './amUSDT'
import WMATIC from './wmatic'
import amWMATIC from './amWMATIC'
import amWBTC from './amWBTC'
import amAAVE from './amAAVE'
import UNI from './uni'
import CRV from './crv'
import _1INCH from './1inch'
import YFI from './yfi'
import FTM from './ftm'
import USDC_FTM from './usdc-ftm'
import am3CRV from './am3crv'
import btcCRV from './btccrv'

import binance from './binance'
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
  MATIC,
  UNI,
  CRV,
  YFI,
  '1INCH': _1INCH,
  'USDT-M': USDT_M,
  'USDC-M': USDC_M,
  'DAI-M': DAI_M,
  'CRV-M': CRV_M,
  amUSDT,
  WMATIC,
  amWMATIC,
  amWBTC,
  amAAVE,
  FTM,
  'USDC-FTM': USDC_FTM,
  am3CRV,
  btcCRV
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
const genericServices = [binance].map(({ services }) => services).flat()
export { genericServices }

export default index
