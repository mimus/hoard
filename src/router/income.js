import WrapperLayout from '@/components/WrapperLayout'
import IncomeEvents from '@/components/IncomeEvents'
import IncomeEventAdd from '@/components/IncomeEventAdd'

var routes = [
  {
    path: '/income-events',
    component: WrapperLayout,
    meta: {
      bcLabel: 'Income Events'
    },
    children: [
      {
        path: '',
        name: 'IncomeEvents',
        component: IncomeEvents
      },
      {
        path: 'add',
        name: 'IncomeEventAdd',
        component: IncomeEventAdd,
        meta: {
          bcLabel: 'New Income'
        }
      },
      {
        path: 'add-from-base/:baseEventId',
        name: 'IncomeEventAddFromBase',
        component: IncomeEventAdd,
        props: true,
        meta: {
          bcLabel: 'New Income'
        }
      }
    ]
  }
]

export default routes
