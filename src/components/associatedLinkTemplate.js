export default `
  <div>
    <router-link
      v-if="model.route"
      :to="model.route"
      :title="model.title"
    >
      {{ model.label }}
    </router-link>
    <div
      v-else
      :title="model.title"
    >
      {{ model.label }}
    </div>
  </div>
`
