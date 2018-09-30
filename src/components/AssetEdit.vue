<template>
  <v-card>
    <v-card-title class="subheading">
      Edit Asset {{ id }}
    </v-card-title>
    <v-card-text>
      <div v-if="!foundModel">
        Unknown ID
      </div>
      <AssetEditForm
        v-else
        :initialModel="model"
        @save="submit"
      />
    </v-card-text>
  </v-card>
</template>

<script>

import AssetEditForm from './AssetEditForm'
import fetchModelByIdMixin from './fetchModelByIdMixin'

export default {
  components: { AssetEditForm },
  mixins: [
    fetchModelByIdMixin(function (id) {
      return id && this.$store.getters.asset(id)
    })
  ],
  data: () => ({
    model: {
      id: '',
      label: '',
      symbol: '',
      fiat: false
    }
  }),
  methods: {
    submit (newModel) {
      this.$store.dispatch('updateAsset', newModel)
      this.$router.push({ name: 'Asset', params: { id: newModel.id } })
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
