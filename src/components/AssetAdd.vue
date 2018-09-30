<template>
  <v-card>
    <v-card-title>
      Add Asset
    </v-card-title>
    <v-card-text>
      <AssetEditForm @save="submit" />
    </v-card-text>
  </v-card>
</template>

<script>

import AssetEditForm from './AssetEditForm'

export default {
  components: { AssetEditForm },
  methods: {
    submit (newModel) {
      this.$store.dispatch('addAsset', newModel)
      this.$router.push({ name: 'Assets' })
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
