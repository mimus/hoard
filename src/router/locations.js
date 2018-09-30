import WrapperLayout from '@/components/WrapperLayout'
import LocationGroups from '@/components/LocationGroups'
import LocationGroup from '@/components/LocationGroup'
import LocationGroupAdd from '@/components/LocationGroupAdd'
import LocationGroupEdit from '@/components/LocationGroupEdit'
import Location from '@/components/Location'
import LocationAdd from '@/components/LocationAdd'
import LocationEdit from '@/components/LocationEdit'

var routes = [
  {
    path: '/location-groups',
    component: WrapperLayout,
    meta: {
      bcLabel: 'Location Groups'
    },
    children: [
      {
        path: '',
        name: 'LocationGroups',
        component: LocationGroups
      },
      {
        path: 'add',
        name: 'LocationGroupAdd',
        component: LocationGroupAdd,
        meta: {
          bcLabel: 'Add Location Group'
        }
      },
      {
        path: ':id',
        component: WrapperLayout,
        meta: {
          bcGetter: 'locationGroupBreadcrumbLabel',
          bcIdParam: 'id'
        },
        children: [
          {
            path: '',
            name: 'LocationGroup',
            component: LocationGroup,
            props: true
          },
          {
            path: 'edit',
            name: 'LocationGroupEdit',
            component: LocationGroupEdit,
            props: true,
            meta: {
              bcLabel: 'Edit'
            }
          },
          {
            path: 'location/add',
            name: 'LocationAdd',
            component: LocationAdd,
            props: (route) => ({ groupId: route.params.id }),
            meta: {
              bcLabel: 'Add Location'
            }
          },
          {
            path: 'location/:locid',
            component: WrapperLayout,
            meta: {
              bcGetter: 'locationBreadcrumbLabel',
              bcIdParam: 'locid'
            },
            children: [
              {
                path: '',
                name: 'Location',
                component: Location,
                props: (route) => ({ id: route.params.locid, groupId: route.params.id })
              },
              {
                path: 'edit',
                name: 'LocationEdit',
                component: LocationEdit,
                props: (route) => ({ id: route.params.locid }),
                meta: {
                  bcLabel: 'Edit'
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
