<template>
  <v-card class="pb-2x">
    <v-list v-if="assets && assets.length">
      <v-list-item
        v-for="asset in assets"
        :key="asset.id"
        :to="{name: 'Asset', params: {id: asset.id}}"
        >
        <v-list-item-content>
          <v-list-item-title>
            {{ asset.label }}
            ({{ asset.symbol }})
            {{ assetAmounts[asset.id] | formatAssetValue(asset.id) }}
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>
    <v-card-text v-else>
      No assets.
    </v-card-text>
    <v-btn
      absolute bottom right
      fab color="blue" dark small
      :to="{name: 'AssetAdd'}"
    >
      <v-icon>add</v-icon>
    </v-btn>
  </v-card>
</template>

<script>

import { mapGetters } from 'vuex'

export default {
  computed: {
    ...mapGetters([
      'assets',
      'assetAmounts'
    ])
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
