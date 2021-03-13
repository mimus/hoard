<template>
  <v-card class="pb-2x">
    <v-list
      v-if="locationGroups && locationGroups.length"
      three-line
    >
      <v-list-item
        v-for="group in locationGroupsWithTotals"
        :key="group.id"
        :to="{name: 'LocationGroup', params: {id: group.id}}"
      >
        <v-list-item-content>
          <v-list-item-title>
            {{ group.label }}
          </v-list-item-title>
          <v-list-item-subtitle>
            <span
              v-for="({ total, isZero }, assetId) in group.assets"
              :key="assetId"
              class="mr-2"
              :class="{
                'text--disabled': isZero
              }"
              :style="isZero ? 'font-size: 0.7em' : ''"
            >
              {{ total | formatAssetValue(assetId) }} {{ assetId }}
            </span>
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
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
  computed: {
    ...mapGetters([
      'locationGroups'
    ]),
    locationGroupsWithTotals () {
      return this.locationGroups.map(group => ({
        ...group,
        assets: Object.fromEntries(
          Object.entries(
            this.$store.getters.locationsInGroupByAssetWithTotal(group.id)
          ).map(
            ([assetId, { total }]) => [
              assetId,
              {
                total,
                isZero: total.isZero()
              }
            ]
          )
        )
      }))
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
