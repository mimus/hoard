<template>
  <v-btn
    v-if="canShow"
    :disabled="fetchedAll"
    :loading="loading"
    class="mr-2"
    @click="fetchIncomeEvents"
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

export default Vue.component('external-income-events-fetcher', {
  props: {
    asset: { type: String, required: true },
    importerId: { type: String, required: true }
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
      return this.asset && this.importer
    },
    importer () {
      return this.$genericServices.find(x => x.id === this.importerId)
    }
  },
  watch: {
    asset (val, oldVal) {
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
    fetchIncomeEvents () {
      var asset = this.asset
      this.loading = true
      this.$emit('error', false)

      this.importer.fetchIncomeEvents(asset, this.fetchState).then(
        ({ incomeEvents, fetchedAll, hasMore, fetchState }) => {
          if (this.asset !== asset) { return }
          this.fetchedAll = fetchedAll
          this.hasMore = hasMore
          this.fetchState = fetchState
          this.loading = false
          this.$emit('input', incomeEvents)
        }, (error) => {
          if (this.asset !== asset) { return }
          this.loading = false
          console.error(`Error fetching income events for ${asset}`, error)
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
