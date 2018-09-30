<template>
  <v-btn
    v-if="canShow"
    :loading="loading"
    flat
    :color="color"
    @click="fetchTransaction"
  >
    <slot>
      Import
      <v-icon>expand_more</v-icon>
    </slot>
  </v-btn>
</template>

<script>
import Vue from 'vue'

export default Vue.component('external-transaction-fetcher', {
  props: {
    asset: { type: String, required: true },
    transactionId: { type: String, required: true },
    value: { type: Object, default: null },
    color: { type: String, default: 'blue' }
  },
  data: function () {
    return {
      loading: false
    }
  },
  computed: {
    canShow () {
      return this.transactionId && this.fetcher
    },
    fetcher () {
      return this.$services[this.asset] && this.$services[this.asset].fetchTransaction
    }
  },
  watch: {
    transactionId (val, oldVal) {
      if (val !== oldVal) {
        this.$emit('input', null)
        this.$emit('error', false)
      }
    }
  },
  methods: {
    fetchTransaction () {
      var transactionId = this.transactionId
      this.loading = true
      this.$emit('error', false)

      this.fetcher(transactionId).then((transaction) => {
        if (this.transactionId !== transactionId) { return }
        this.loading = false
        this.input = transaction
        this.$emit('input', this.input)
      }, (error) => {
        if (this.transactionId !== transactionId) { return }
        this.loading = false
        console.error(`Error fetching transaction ${transactionId}`, error)
        this.$emit('error', error || 'Unknown Error')
      })
    }
  }
})
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
