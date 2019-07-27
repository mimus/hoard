<template>
  <v-card class="pb-2x">
    <v-list v-if="miningPoolsSummary && miningPoolsSummary.length">
      <v-list-item
        v-for="pool in miningPoolsSummary"
        :key="pool.id"
        :to="{name: 'MiningPool', params: { id: pool.id }}"
      >
        <v-list-item-content>
          <v-list-item-title>
            {{ pool.label }} ({{ pool.asset }})
          </v-list-item-title>
          <v-list-item-subtitle>
            {{ pool.total | formatAssetValue(pool.asset) }}
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-list>
    <v-card-text v-else>
      No mining pools.
    </v-card-text>
    <v-btn
      absolute bottom right
      fab color="blue" dark small
      :to="{name: 'MiningPoolAdd'}"
    >
      <v-icon>add</v-icon>
    </v-btn>
  </v-card>
</template>

<script>

import { mapGetters } from 'vuex'

export default {
  computed: mapGetters([
    'miningPoolsSummary'
  ])
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
