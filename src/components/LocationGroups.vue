<template>
  <v-card class="pb-2x">
    <v-list v-if="locationGroups && locationGroups.length">
      <v-list-tile
        v-for="group in locationGroups"
        :key="group.id"
        :to="{name: 'LocationGroup', params: {id: group.id}}"
      >
        <v-list-tile-content>
          <v-list-tile-title>
            {{ group.label }}
          </v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>
    </v-list>
    <v-card-text v-else>
      No location groups.
    </v-card-text>
    <v-btn
      absolute bottom right
      fab color="blue" dark small
      :to="{name: 'LocationGroupAdd'}"
    >
      <v-icon>add</v-icon>
    </v-btn>
  </v-card>
</template>

<script>

import { mapGetters } from 'vuex'

export default {
  computed: mapGetters([
    'locationGroups'
  ])
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
