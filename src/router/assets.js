import WrapperLayout from '@/components/WrapperLayout'
import Assets from '@/components/Assets'
import Asset from '@/components/Asset'
import AssetAdd from '@/components/AssetAdd'
import AssetEdit from '@/components/AssetEdit'

var routes = [
  {
    path: '/assets',
    component: WrapperLayout,
    meta: {
      bcLabel: 'Assets'
    },
    children: [
      {
        path: '',
        name: 'Assets',
        component: Assets
      },
      {
        path: 'add',
        name: 'AssetAdd',
        component: AssetAdd,
        meta: {
          bcLabel: 'Add Asset'
        }
      },
      {
        path: ':id',
        component: WrapperLayout,
        meta: {
          bcGetter: 'assetBreadcrumbLabel',
          bcIdParam: 'id'
        },
        children: [
          {
            path: '',
            name: 'Asset',
            component: Asset,
            props: true
          },
          {
            path: 'edit',
            name: 'AssetEdit',
            component: AssetEdit,
            props: true,
            meta: {
              bcLabel: 'Edit'
            }
          }
        ]
      }
    ]
  }
]

export default routes
