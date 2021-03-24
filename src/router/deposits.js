import WrapperLayout from '@/components/WrapperLayout'
import DepositEvents from '@/components/DepositEvents'
import DepositEventAdd from '@/components/DepositEventAdd'

var routes = [
  {
    path: '/deposit-events',
    component: WrapperLayout,
    meta: {
      bcLabel: 'Deposit Events'
    },
    children: [
      {
        path: '',
        name: 'DepositEvents',
        component: DepositEvents
      },
      {
        path: 'add',
        name: 'DepositEventAdd',
        component: DepositEventAdd,
        meta: {
          bcLabel: 'New Deposit'
        }
      },
      {
        path: 'add-from-base/:baseEventId',
        name: 'DepositEventAddFromBase',
        component: DepositEventAdd,
        props: true,
        meta: {
          bcLabel: 'New Deposit'
        }
      }
    ]
  }
]

export default routes
