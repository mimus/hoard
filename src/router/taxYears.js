import WrapperLayout from '@/components/WrapperLayout'
import TaxYears from '@/components/TaxYears'
import TaxYear from '@/components/TaxYear'
import TaxYearAdd from '@/components/TaxYearAdd'
import TaxYearEdit from '@/components/TaxYearEdit'

var routes = [
  {
    path: '/tax-years',
    component: WrapperLayout,
    meta: {
      bcLabel: 'Tax Years'
    },
    children: [
      {
        path: '',
        name: 'TaxYears',
        component: TaxYears
      },
      {
        path: 'add',
        name: 'TaxYearAdd',
        component: TaxYearAdd,
        meta: {
          bcLabel: 'Add Tax Year'
        }
      },
      {
        path: ':id',
        component: WrapperLayout,
        meta: {
          bcGetter: 'taxYearBreadcrumbLabel',
          bcIdParam: 'id'
        },
        children: [
          {
            path: '',
            name: 'TaxYear',
            component: TaxYear,
            props: true
          },
          {
            path: 'edit',
            name: 'TaxYearEdit',
            component: TaxYearEdit,
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
