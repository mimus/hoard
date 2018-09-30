import WrapperLayout from '@/components/WrapperLayout'
import MiningPools from '@/components/MiningPools'
import MiningPool from '@/components/MiningPool'
import MiningPoolAdd from '@/components/MiningPoolAdd'
import MiningPoolEdit from '@/components/MiningPoolEdit'
import MiningEventAdd from '@/components/MiningEventAdd'
import MiningEventImport from '@/components/MiningEventImport'

var routes = [
  {
    path: '/mining-pools',
    component: WrapperLayout,
    meta: {
      bcLabel: 'Mining Pools'
    },
    children: [
      {
        path: '',
        name: 'MiningPools',
        component: MiningPools
      },
      {
        path: 'add',
        name: 'MiningPoolAdd',
        component: MiningPoolAdd,
        meta: {
          bcLabel: 'Add Mining Pool'
        }
      },
      {
        path: ':id',
        component: WrapperLayout,
        meta: {
          bcGetter: 'miningPoolBreadcrumbLabel',
          bcIdParam: 'id'
        },
        children: [
          {
            path: '',
            name: 'MiningPool',
            component: MiningPool,
            props: true
          },
          {
            path: 'edit',
            name: 'MiningPoolEdit',
            component: MiningPoolEdit,
            props: true,
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
                name: 'MiningEventAdd',
                component: MiningEventAdd,
                props: (route) => ({ poolId: route.params.id }),
                meta: {
                  bcLabel: 'Add Event'
                }
              },
              {
                path: 'import',
                name: 'MiningEventImport',
                component: MiningEventImport,
                props: (route) => ({ poolId: route.params.id }),
                meta: {
                  bcLabel: 'Import Events'
                }
              }
            ]
          }
        ]
      }
    ]
  }
]

export default routes
