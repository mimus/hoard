<template>
  <v-card>
    <div
      v-if="pool"
      key="found"
    >
      <v-card-title>
        Import Mining Events for pool {{ pool.label }}
      </v-card-title>
      <v-card-text
        v-if="importers"
        class="pt-0"
      >
        <v-radio-group v-model="selectedImporterId">
          <v-radio
            v-for="importer in importers"
            :key="importer.id"
            :label="importer.label"
            :value="importer.id"
          ></v-radio>
        </v-radio-group>
        <div v-if="selectedImporterId">
          Import from {{ selectedImporterLabel }}
          <MiningEventsImportForm
            v-if="selectedImporterId"
            :poolId="poolId"
            :importerId="selectedImporterId"
            @save="submit"
          />
        </div>
        <v-alert
          :value="!!error"
          type="error"
        >
          {{ error }}
        </v-alert>
      </v-card-text>
      <v-card-text v-else>
        No Importers are available.
      </v-card-text>
    </div>
    <div
      v-else
      key="notFound"
    >
      Unknown Mining Pool
    </div>
  </v-card>
</template>

<script>
import MiningEventsImportForm from './MiningEventsImportForm'

export default {
  components: { MiningEventsImportForm },
  props: {
    poolId: [Number, String]
  },
  data: () => ({
    error: null,
    selectedImporterId: null
  }),
  computed: {
    pool () {
      return this.poolId ? this.$store.getters.miningPool(this.poolId) : null
    },
    importers () {
      var asset = this.pool && this.pool.asset
      var servicesForAsset = asset && this.$services[asset] && this.$services[asset].services
      return servicesForAsset && servicesForAsset.filter(s => s.fetchTransactions)
    },
    selectedImporterLabel () {
      var importer = this.importers && this.selectedImporterId && this.importers.find(x => x.id === this.selectedImporterId)
      return (importer && importer.label) || this.selectedImporterId
    }
  },
  watch: {
    poolId (newVal, oldVal) {
      this.error = null
      this.selectedImporterId = null
    }
  },
  methods: {
    submit (miningEvents) {
      this.error = false
      this.$store.dispatch('addNewMiningEvents', miningEvents).then(
        () => {
          // console.log('Added events')
          this.$router.push({ name: 'MiningPool', params: { id: this.poolId } })
        },
        (err) => {
          console.error('Error adding events', err)
          this.error = (err && err.message) || 'Error adding mining events'
        }
      )
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
