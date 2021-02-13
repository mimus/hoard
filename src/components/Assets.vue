<template>
  <v-card class="pb-2x">
    <div
      v-if="assets && assets.length"
      style="padding: 10px;"
    >
      <v-btn
        :loading="loadingAssetPrices"
        text
        color="blue"
        class="ma-0 mr-2"
        @click="fetchAssetPrices"
      >
        Get current valuation
      </v-btn>
      <div
        v-if="assetGBPValues"
        style="margin: 10px 0 0 15px; font-weight: bold;"
      >
        Total: £{{ totalAssetGBPValue | formatFiat }}
      </div>
    </div>
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
          <v-list-item-subtitle
            v-if="assetGBPValues"
          >
            £{{ assetGBPValues[asset.id] }}
            <i>(1 {{ asset.symbol }} = {{ assetPriceById[asset.id] | formatFiat }} GBP)</i>
          </v-list-item-subtitle>
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

import { mapGetters, mapActions } from 'vuex'

export default {
  computed: {
    ...mapGetters([
      'assets',
      'assetAmounts',
      'assetPriceById',
      'loadingAssetPrices',
      'assetGBPValues',
      'totalAssetGBPValue'
    ])
  },
  methods: {
    ...mapActions([
      'fetchAssetPrices'
    ])
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
