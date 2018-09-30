<template>
  <v-btn
    :loading="loadingPrice"
    :disabled="disabled"
    flat
    color="blue"
    class="ma-0 mr-2"
    @click="lookUpPrice"
  >
    <slot>
      Look Up
      <v-icon>arrow_forward_ios</v-icon>
    </slot>
  </v-btn>
</template>

<script>

import Vue from 'vue'
import u from '../utils'
import cryptocompare from '../services/cryptocompare'

export default Vue.component('price-lookup', {
  props: {
    asset: { type: Object },
    date: { type: Date },
    // change this value (e.g. increment) to trigger a price lookup with code rather than a click
    requestFetch: { type: Number, default: 0 },
    // when the price is looked up,
    // this component will trigger a 'annotatedText' event
    // based on this value + (Using day rate: 1 SYM = XXX GBP)
    textToAnnotate: { type: String }
  },
  data () {
    return {
      price: null,
      loadingPrice: false
    }
  },
  computed: {
    disabled () {
      return !(this.date && this.asset)
    },
    annotatedText () {
      var text = this.textToAnnotate || ''
      if (this.price && this.asset) {
        text = text.replace(/\s\(Using day rate[^)].*\)/, '')
        text = `${text} (Using day rate: 1 ${this.asset.symbol} = ${this.price} GBP)`
      }
      return text
    }
  },
  watch: {
    requestFetch (val) {
      if (val) {
        this.lookUpPrice()
      }
    },
    date (val, newVal) {
      if (!u.datesAreSame(val, newVal)) {
        this.price = null
        this.loadingPrice = false
        this.$emit('input', '')
      }
    }
  },
  methods: {
    lookUpPrice () {
      var date = this.date
      if (!date) { return }
      this.loadingPrice = true
      var fetchingPromise = cryptocompare.fetchDayPrice({ from: this.asset.symbol, to: 'GBP', date })
      fetchingPromise.then(
        // success
        (price) => {
          if (!u.datesAreSame(date, this.date)) { return }
          this.price = price
          this.$emit('input', price)
          this.$emit('annotatedText', this.annotatedText)
          this.loadingPrice = false
        },
        // error
        (error) => {
          if (!u.datesAreSame(date, this.date)) { return }
          this.$emit('error', (error && error.message) || 'Unknown Error')
          this.loadingPrice = false
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
