import WrapperLayout from '@/components/WrapperLayout'
import AirdropEvents from '@/components/AirdropEvents'
import AirdropEventAdd from '@/components/AirdropEventAdd'

var routes = [
  {
    path: '/airdrop-events',
    component: WrapperLayout,
    meta: {
      bcLabel: 'Airdrop / Income Events'
    },
    children: [
      {
        path: '',
        name: 'AirdropEvents',
        component: AirdropEvents
      },
      {
        path: 'add',
        name: 'AirdropEventAdd',
        component: AirdropEventAdd,
        meta: {
          bcLabel: 'New Airdrop / Income'
        }
      },
      {
        path: 'addFromBase/:baseEventId',
        name: 'AirdropEventAddFromBase',
        component: AirdropEventAdd,
        props: true,
        meta: {
          bcLabel: 'New Airdrop / Income'
        }
      }
    ]
  }
]

export default routes
