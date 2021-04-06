<template>
  <v-card>
    <div
      v-if="source"
      key="found"
    >
      <v-card-title>
        Import Income Events for source {{ source.label }}
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

          <IncomeEventsImportForm
            v-if="selectedImporterId"
            class="mt-4"
            :sourceId="sourceId"
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
      Unknown Income Source
    </div>
  </v-card>
</template>

<script>
import IncomeEventsImportForm from './IncomeEventsImportForm'

export default {
  components: { IncomeEventsImportForm },
  props: {
    sourceId: [Number, String]
  },
  data: () => ({
    error: null,
    selectedImporterId: null
  }),
  computed: {
    source () {
      return this.sourceId ? this.$store.getters.incomeSource(this.sourceId) : null
    },
    importers () {
      var incomeServices = this.$genericServices.filter(s => s.fetchIncomeEvents || s.loadIncomeEvents)
      return incomeServices
    },
    selectedImporterLabel () {
      var importer = this.importers && this.selectedImporterId && this.importers.find(x => x.id === this.selectedImporterId)
      return (importer && importer.label) || this.selectedImporterId
    }
  },
  watch: {
    sourceId (newVal, oldVal) {
      this.error = null
      this.selectedImporterId = null
    }
  },
  methods: {
    submit (incomeEvents) {
      this.error = false
      console.log('Add income events', incomeEvents)
      this.$store.dispatch('addNewIncomeEvents', incomeEvents).then(
        () => {
          // console.log('Added events')
          this.$router.push({ name: 'IncomeSource', params: { sourceId: this.sourceId } })
        },
        (err) => {
          console.error('Error adding events', err)
          this.error = (err && err.message) || 'Error adding income events'
        }
      )
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
