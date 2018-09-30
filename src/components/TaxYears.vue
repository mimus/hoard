<template>
  <v-card class="pb-2x">
    <v-list one-line subheader>
      <v-list-tile
        v-for="year in taxYears"
        :key="year.label"
        :to="{name: 'TaxYear', params: {id: year.id}}"
      >
        <v-list-tile-content>
          <v-list-tile-title>
            {{ year.label }}
          </v-list-tile-title>
          <v-list-tile-sub-title>
            ({{ year.startDate | formatDate }} - {{ year.endDate | formatDate }})
          </v-list-tile-sub-title>
        </v-list-tile-content>
      </v-list-tile>
    </v-list>
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
