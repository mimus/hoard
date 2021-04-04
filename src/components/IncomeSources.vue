<template>
  <v-card class="pb-2x">
    <v-list v-if="incomeSourcesSummary && incomeSourcesSummary.length">
      <v-list-item
        v-for="source in incomeSourcesSummary"
        :key="source.id"
        :to="{name: 'IncomeSource', params: { sourceId: source.id }}"
      >
        <v-list-item-content>
          <v-list-item-title>
            {{ source.label }}
          </v-list-item-title>
          <v-list-item-subtitle>
            {{ source.events || 'No' }} events
            <template  v-if="source.asset">
              &middot; {{ source.total | formatAssetValue(source.asset.id) }} {{ source.asset.symbol }}
            </template>
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-list>
    <v-card-text v-else>
      No income sources.
    </v-card-text>
    <v-btn
      absolute bottom right
      fab color="blue" dark small
      :to="{name: 'IncomeSourceAdd'}"
    >
      <v-icon>add</v-icon>
    </v-btn>
  </v-card>
</template>

<script>

import { mapGetters } from 'vuex'

export default {
  computed: mapGetters([
    'incomeSourcesSummary'
  ])
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
