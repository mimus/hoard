import WrapperLayout from '@/components/WrapperLayout'
import TransferEvents from '@/components/TransferEvents'
import TransferEventAdd from '@/components/TransferEventAdd'

var routes = [
  {
    path: '/transfer-events',
    component: WrapperLayout,
    meta: {
      bcLabel: 'Transfer Events'
    },
    children: [
      {
        path: '',
        name: 'TransferEvents',
        component: TransferEvents
      },
      {
        path: 'add',
        name: 'TransferEventAdd',
        component: TransferEventAdd,
        meta: {
          bcLabel: 'New Transfer'
        }
      },
      {
        path: 'add-from-base/:baseEventId',
        name: 'TransferEventAddFromBase',
        component: TransferEventAdd,
        props: true,
        meta: {
          bcLabel: 'New Transfer'
        }
      }
    ]
  }
]

export default routes
