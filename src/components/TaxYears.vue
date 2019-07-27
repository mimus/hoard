<template>
  <v-card class="pb-2x">
    <v-list
      v-if="taxYears && taxYears.length"
      one-line
    >
      <v-list-item
        v-for="year in taxYears"
        :key="year.label"
        :to="{name: 'TaxYear', params: {id: year.id}}"
      >
        <v-list-item-content>
          <v-list-item-title>
            {{ year.label }}
          </v-list-item-title>
          <v-list-item-subtitle>
            ({{ year.startDate | formatDate }} - {{ year.endDate | formatDate }})
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-list>
    <v-card-text v-else>
      No tax years.
    </v-card-text>
    <v-btn
      absolute bottom right
      fab color="blue" dark small
      :to="{name: 'TaxYearAdd'}"
    >
      <v-icon>add</v-icon>
    </v-btn>
  </v-card>
</template>

<script>

import { mapGetters } from 'vuex'

export default {
  computed: mapGetters([ 'taxYears' ])
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
