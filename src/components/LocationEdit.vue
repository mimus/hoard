<template>
  <v-card>
    <v-card-title>
      Edit Location
    </v-card-title>
    <v-card-text>
      <div v-if="!foundModel">
        Unknown ID
      </div>
      <LocationEditForm
        v-else
        :initialModel="model"
        @save="submit"
      />
    </v-card-text>
  </v-card>
</template>

<script>

import LocationEditForm from './LocationEditForm'
import fetchModelByIdMixin from './fetchModelByIdMixin'

export default {
  components: { LocationEditForm },
  mixins: [
    fetchModelByIdMixin(function (id) {
      return id && this.$store.getters.location(id)
    })
  ],
  data: () => ({
    model: {
      id: '',
      group: '',
      label: '',
      asset: '',
      address: ''
    }
  }),
  methods: {
    submit (newModel) {
      this.$store.dispatch('updateLocation', newModel)
      this.$router.push({ name: 'Location', params: { id: newModel.group, locid: newModel.id } })
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
