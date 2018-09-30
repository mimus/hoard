import store from './index'

// Saved exports
// import savedData from './saved/hoard'
import savedData from './testdata/cointracker_scenario2'

store.dispatch('importData', savedData)

export default ''
