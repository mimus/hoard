// Mixin to automatically fetch the model corresponding to an 'id' prop
// and make it available in data.model (as a copy)
// The component should provide the 'fetcher(id)' function to implement the fetch,
// and also define the default data.model object properties
export default function (fetcher) {
  return {
    props: {
      id: [String, Number]
    },
    data () {
      return {
        foundModel: false,
        model: {} // override in component with expected properties
      }
    },
    watch: {
      id: {
        immediate: true,
        handler () {
          var found = fetcher.call(this, this.$props.id)
          if (found) {
            Object.assign(this.model, found)
          }
          this.foundModel = !!found
        }
      }
    }
  }
}
