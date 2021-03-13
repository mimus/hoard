<template>
  <v-btn
    v-if="assets && assets.length"
    :loading="loadingAssetPrices"
    text
    color="blue"
    @click="fetchAssetPrices"
  >
    Fetch Prices
  </v-btn>
</template>

<script>

import { mapGetters, mapActions } from 'vuex'

export default {
  computed: mapGetters([
    'assets',
    'loadingAssetPrices'
  ]),
  methods: mapActions([
    'fetchAssetPrices'
  ])
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
