<template>
  <v-card class="pb-2x">
    <v-list>
      <v-list-tile
        v-for="pool in miningPoolsSummary"
        :key="pool.id"
        :to="{name: 'MiningPool', params: { id: pool.id }}"
      >
        <v-list-tile-content>
          <v-list-tile-title>
            {{ pool.label }} ({{ pool.asset }})
          </v-list-tile-title>
          <v-list-tile-sub-title>
            {{ pool.total | formatAssetValue(pool.asset) }}
          </v-list-tile-sub-title>
        </v-list-tile-content>
      </v-list-tile>
    </v-list>
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
