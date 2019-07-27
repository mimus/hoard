<template>
  <v-card>
    <template v-if="taxYear">
      <v-layout align-baseline justify-space-between>
        <div>
          <v-card-text>
            Tax Year: <b>{{ taxYear.label }}</b>
            <br>Start Date: {{ taxYear.startDate | formatDateTime }}
            <br>End Date: {{ taxYear.endDate | formatDateTime }}
          </v-card-text>
        </div>
        <div class="mr-6">
          <v-btn
            small
            :to="{name: 'TaxYearEdit', params: {id: this.id}}"
          >
            Edit
          </v-btn>
        </div>
      </v-layout>
      <v-divider></v-divider>

      <TaxYearMiningIncome :id="id" />

      <TaxYearAirdropIncome :id="id" />

      <TaxYearCapitalGains :id="id" />

    </template>
    <v-card-text v-else>
      Unknown ID
    </v-card-text>
  </v-card>
</template>

<script>

import TaxYearMiningIncome from './TaxYearMiningIncome'
import TaxYearAirdropIncome from './TaxYearAirdropIncome'
import TaxYearCapitalGains from './TaxYearCapitalGains'

export default {
  components: { TaxYearMiningIncome, TaxYearAirdropIncome, TaxYearCapitalGains },
  props: {
    id: [Number, String]
  },
  computed: {
    taxYear () {
      return this.$store.getters.taxYear(this.id)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
