import WrapperLayout from '@/components/WrapperLayout'
import IncomeSources from '@/components/IncomeSources'
import IncomeSource from '@/components/IncomeSource'
import IncomeSourceAdd from '@/components/IncomeSourceAdd'
import IncomeSourceEdit from '@/components/IncomeSourceEdit'
import IncomeEventAdd from '@/components/IncomeEventAdd'
//import IncomeEventImport from '@/components/IncomeEventImport'

var routes = [
  {
    path: '/income-sources',
    component: WrapperLayout,
    meta: {
      bcLabel: 'Income Sources'
    },
    children: [
      {
        path: '',
        name: 'IncomeSources',
        component: IncomeSources
      },
      {
        path: 'add',
        name: 'IncomeSourceAdd',
        component: IncomeSourceAdd,
        meta: {
          bcLabel: 'Add Income Source'
        }
      },
      {
        path: ':sourceId',
        component: WrapperLayout,
        meta: {
          bcGetter: 'incomeSourceBreadcrumbLabel',
          bcIdParam: 'sourceId'
        },
        children: [
          {
            path: '',
            name: 'IncomeSource',
            component: IncomeSource,
            props: (route) => ({ id: route.params.sourceId })
          },
          {
            path: 'edit',
            name: 'IncomeSourceEdit',
            component: IncomeSourceEdit,
            props: (route) => ({ id: route.params.sourceId }),
            meta: {
              bcLabel: 'Edit'
            }
          },
          {
            path: 'event',
            component: WrapperLayout,
            children: [
              {
                path: 'add',
                name: 'IncomeEventAdd',
                component: IncomeEventAdd,
                props: true,
                meta: {
                  bcLabel: 'Add Event'
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
              }/*,
              {
                path: 'import',
                name: 'IncomeEventImport',
                component: IncomeEventImport,
                props: (route) => ({ sourceId: route.params.id }),
                meta: {
                  bcLabel: 'Import Events'
                }
              }*/
            ]
          }
        ]
      }
    ]
  }
]

export default routes
