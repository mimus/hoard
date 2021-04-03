<template>
  <v-card class="pb-2x">
    <v-list v-if="incomeSources && incomeSources.length">
      <v-list-item
        v-for="source in incomeSources"
        :key="source.id"
        :to="{name: 'IncomeSource', params: { id: source.id }}"
      >
        <v-list-item-content>
          <v-list-item-title>
            {{ source.label }}
          </v-list-item-title>
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
    'incomeSources'
  ])
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
