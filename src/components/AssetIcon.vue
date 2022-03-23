<template>
  <v-icon
    v-if="asset.fiat"
    class="blue-grey--text text--lighten-1"
  >monetization_on</v-icon>
  <v-icon
    v-else-if="asset.stablecoin"
    class="orange--text text--darken-3"
  >mdi-cloud-lock-outline</v-icon>
  <v-icon
    v-else-if="asset.nft"
    class="purple--text text--lighten-2"
  >mdi-image</v-icon>
  <v-icon
    v-else
    class="orange--text text--darken-3"
  >cloud_queue</v-icon>
</template>

<script>
import Vue from 'vue'

export default Vue.component('asset-icon', {
  props: {
    asset: Object
  }
})

</script>

<style scoped>
</style>
