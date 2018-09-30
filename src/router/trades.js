import WrapperLayout from '@/components/WrapperLayout'
import TradeEvents from '@/components/TradeEvents'
import TradeEventAdd from '@/components/TradeEventAdd'

var routes = [
  {
    path: '/trade-events',
    component: WrapperLayout,
    meta: {
      bcLabel: 'Trade Events'
    },
    children: [
      {
        path: '',
        name: 'TradeEvents',
        component: TradeEvents
      },
      {
        path: 'add',
        name: 'TradeEventAdd',
        component: TradeEventAdd,
        meta: {
          bcLabel: 'New Trade'
        }
      }
    ]
  }
]

export default routes
