var storeModule = {

  state: {
    breadcrumbs: []
  },

  mutations: {
    setBreadcrumbs (state, breadcrumbs) {
      state.breadcrumbs = breadcrumbs
    }
  },

  getters: {
    breadcrumbs: (state) => state.breadcrumbs
  }
}

export default storeModule
