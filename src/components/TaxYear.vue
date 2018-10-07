<template>
  <v-card>
    <div v-if="taxYear">
      <v-layout row nowrap align-baseline>
        <v-flex>
          <v-card-text>
            Tax Year: <b>{{ taxYear.label }}</b>
            <br>Start Date: {{ taxYear.startDate | formatDateTime }}
            <br>End Date: {{ taxYear.endDate | formatDateTime }}
          </v-card-text>
        </v-flex>
        <div>
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

    </div>
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
