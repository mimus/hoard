<template>
  <v-card>
    <v-card-title>
      Edit Location Group
    </v-card-title>
    <v-card-text>
      <div v-if="!foundModel">
        Unknown ID
      </div>
      <LocationGroupEditForm
        v-else
        :initialModel="model"
        @save="submit"
      />
    </v-card-text>
  </v-card>
</template>

<script>

import LocationGroupEditForm from './LocationGroupEditForm'
import fetchModelByIdMixin from './fetchModelByIdMixin'

export default {
  components: { LocationGroupEditForm },
  mixins: [
    fetchModelByIdMixin(function (id) {
      return id && this.$store.getters.locationGroup(id)
    })
  ],
  data: () => ({
    model: {
      id: '',
      label: ''
    }
  }),
  methods: {
    submit (newModel) {
      this.$store.dispatch('updateLocationGroup', newModel)
      this.$router.push({ name: 'LocationGroup', params: { id: newModel.id } })
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
