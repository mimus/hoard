<template>
  <v-btn
    :loading="loadingPrices"
    :disabled="disabled"
    text
    color="blue"
    class="ma-0 mr-2"
    @click="lookUpPrices"
  >
    <slot>
      Look Up
      <v-icon>arrow_forward_ios</v-icon>
    </slot>
  </v-btn>
</template>

<script>

import Vue from 'vue'
import cryptocompare from '../services/cryptocompare'

export default Vue.component('price-lookup-multiple', {
  props: {
    assetSymbols: { type: Array }
  },
  data () {
    return {
      prices: null,
      loadingPrices: false
    }
  },
  computed: {
    disabled () {
      return !this.assetSymbols || !this.assetSymbols.length
    }
  },
  methods: {
    lookUpPrices () {
      var assetSymbols = this.assetSymbols
      this.loadingPrices = true
      var fetchingPromise = cryptocompare.fetchMultipleCurrentPrices({ from: this.assetSymbols, to: 'GBP' })
      fetchingPromise.then(
        // success
        (prices) => {
          if (assetSymbols !== this.assetSymbols) { return }
          this.prices = prices
          this.$emit('input', prices)
          this.loadingPrices = false
        },
        // error
        (error) => {
          if (assetSymbols !== this.assetSymbols) { return }
          this.$emit('error', (error && error.message) || 'Unknown Error')
          this.loadingPrices = false
          console.error(error)
        }
      )
    }
  }
})
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
