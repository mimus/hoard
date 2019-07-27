<template>
  <v-btn
    v-if="canShow"
    :disabled="fetchedAll"
    :loading="loading"
    class="mr-2"
    @click="fetchTransactions"
  >
    <template v-if="fetchedAll">
      Fetched All
      <v-icon right>cloud_done</v-icon>
    </template>
    <template v-else>
      Fetch
      <template v-if="hasMore">More</template>
      <v-icon right>cloud_download</v-icon>
    </template>
  </v-btn>
</template>

<script>
import Vue from 'vue'

export default Vue.component('external-transactions-fetcher', {
  props: {
    asset: { type: String, required: true },
    importerId: { type: String, required: true },
    address: { type: String, required: true }
  },
  data: function () {
    return {
      loading: false,
      hasMore: false,
      fetchedAll: false,
      fetchState: null
    }
  },
  computed: {
    canShow () {
      return this.address && this.importer
    },
    importer () {
      var servicesForAsset = this.asset && this.$services[this.asset] && this.$services[this.asset].services
      return servicesForAsset && this.importerId && servicesForAsset.find(x => x.id === this.importerId)
    }
  },
  watch: {
    address (val, oldVal) {
      if (val !== oldVal) {
        this.resetFetching()
      }
    },
    importer (val, oldVal) {
      if (val !== oldVal) {
        this.resetFetching()
      }
    }
  },
  methods: {
    resetFetching () {
      this.loading = false
      this.hasMore = false
      this.fetchedAll = false
      this.fetchState = null
      this.$emit('input', null)
      this.$emit('error', false)
    },
    fetchTransactions () {
      var address = this.address
      this.loading = true
      this.$emit('error', false)

      this.importer.fetchTransactions(address, this.fetchState).then(
        ({ transactions, fetchedAll, hasMore, fetchState }) => {
          if (this.address !== address) { return }
          this.fetchedAll = fetchedAll
          this.hasMore = hasMore
          this.fetchState = fetchState
          this.loading = false
          this.$emit('input', transactions)
        }, (error) => {
          if (this.address !== address) { return }
          this.loading = false
          console.error(`Error fetching transactions for ${address}`, error)
          this.$emit('error', error || 'Unknown Error')
        }
      )
    }
  }
})
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
