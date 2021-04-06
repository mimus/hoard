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

import binance from './binance'

var index = { BTC, BCH, BTG, ETH, OMG, ZEC, LTC, VTC, XVG, LSK, NEO, GAS, BCD, DAI, WBTC, GUSD, LPT, XMR }

Object.entries(index).forEach(([key, item]) => {
  if (item.services) {
    // store ref to the first available implementations
    item.services.forEach(service => {
      item.addressLink = item.addressLink || service.addressLink
      item.transactionLink = item.transactionLink || service.transactionLink
      item.fetchTransaction = item.fetchTransaction || service.fetchTransaction
    })
  }
})

// some services can potentially apply to all assets
const genericServices = [binance].map(({ services }) => services).flat()
export { genericServices }

export default index
