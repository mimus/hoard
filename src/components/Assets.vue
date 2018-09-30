<template>
  <v-card class="pb-2x">
    <v-list>
      <v-list-tile
        v-for="asset in assets"
        :key="asset.id"
        :to="{name: 'Asset', params: {id: asset.id}}"
        >
        <v-list-tile-content>
          <v-list-tile-title>
            {{ asset.label }}
            ({{ asset.symbol }})
            {{ assetAmounts[asset.id] | formatAssetValue(asset.id) }}
          </v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>
    </v-list>
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
