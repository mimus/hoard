<template>
  <v-card>
    <v-card-title>
      Edit Mining Pool
    </v-card-title>
    <v-card-text>
      <div v-if="!foundModel">
        Unknown ID
      </div>
      <MiningPoolEditForm
        v-else
        :initialModel="model"
        @save="submit"
      />
    </v-card-text>
  </v-card>
</template>

<script>

import MiningPoolEditForm from './MiningPoolEditForm'
import fetchModelByIdMixin from './fetchModelByIdMixin'

export default {
  components: { MiningPoolEditForm },
  mixins: [
    fetchModelByIdMixin(function (id) {
      return id && this.$store.getters.miningPool(id)
    })
  ],
  data: () => ({
    model: {
      id: '',
      label: '',
      asset: '',
      comments: ''
    }
  }),
  methods: {
    submit (newModel) {
      this.$store.dispatch('updateMiningPool', newModel)
      this.$router.push({ name: 'MiningPool', params: { id: newModel.id } })
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
