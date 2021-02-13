<template>
  <v-card class="pb-2x">
    <div
      v-if="assets && assets.length"
      style="padding: 10px;"
    >
      <price-lookup-multiple
        v-model="assetPricesGBP"
        :assetSymbols="assetSymbols"
      >
        Get current valuation
      </price-lookup-multiple>
      <div
        v-if="assetGBPValues"
        style="margin: 10px 0 0 15px; font-weight: bold;"
      >
        Total: £{{ totalGBPValue }}
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
            v-if="assetPricesGBP && assetPricesGBP[asset.symbol] && assetGBPValues"
          >
            £{{ assetGBPValues[asset.id] }}
            <i>(1 {{ asset.symbol }} = {{ assetPricesGBP[asset.symbol] }} GBP)</i>
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

import { mapGetters } from 'vuex'
import u from '../utils'

export default {
  data () {
    return {
      assetPricesGBP: null // GBP price for assets by symbol
    }
  },
  computed: {
    ...mapGetters([
      'assets',
      'assetAmounts'
    ]),
    assetSymbols () {
      return this.assets.map(asset => asset.symbol)
    },
    assetGBPValues () {
      if (!this.assetPricesGBP) { return null }
      return Object.fromEntries(this.assets.map(asset => [
        asset.id,
        u.formatFiat(this.assetAmounts[asset.id].times(this.assetPricesGBP[asset.symbol]))
      ]))
    },
    totalGBPValue () {
      if (!this.assetGBPValues) { return null }
      const total = Object.values(this.assetGBPValues).reduce((sum, value) => sum + (value - 0), 0)
      return u.formatFiat(total)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
