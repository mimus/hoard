// Copies prop 'initialModel' object's attributes to this data.model
// The component using this mixin should define 'getDefaultModel' method
// which returns the default 'model' object
export default function (defaultModel) {
  return {
    props: {
      initialModel: Object
    },
    data () {
      return {
        model: Object.assign({}, defaultModel)
      }
    },
    watch: {
      // Copy provided model from props (immutable) to local 'data' which we can mutate.
      // Use 'deep' so we detect changes on the initialModel object's properties.
      // Also use 'immediate' so it triggers on first loading the component.
      // (the alternative is to also copy them in 'data' () above)
      initialModel: {
        deep: true,
        immediate: true,
        handler: function (initialModel) {
          Object.assign(
            this.model,
            defaultModel,
            initialModel
          )
        }
      }
    }
  }
}
