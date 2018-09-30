<template>
  <v-card>
    <v-card-title>
      Edit Tax Year
    </v-card-title>
    <v-card-text>
      <div v-if="!foundModel">
        Unknown ID
      </div>
      <TaxYearEditForm
        v-else
        :initialModel="model"
        @save="submit"
      />
    </v-card-text>
  </v-card>
</template>

<script>

import u from '../utils'
import TaxYearEditForm from './TaxYearEditForm'
import fetchModelByIdMixin from './fetchModelByIdMixin'

export default {
  components: { TaxYearEditForm },
  mixins: [
    fetchModelByIdMixin(function (id) {
      var existing = this.$store.getters.taxYear(id)
      if (existing) {
        return {
          id: existing.id,
          label: existing.label,
          startDate: u.formatDate(existing.startDate),
          endDate: u.formatDate(existing.endDate)
        }
      }
    })
  ],
  data: () => ({
    model: {
      id: '',
      label: '',
      startDate: '',
      endDate: ''
    }
  }),
  methods: {
    submit (newTaxYear) {
      this.$store.dispatch('updateTaxYear', newTaxYear)
      this.$router.push({ name: 'TaxYear', params: { id: newTaxYear.id } })
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
