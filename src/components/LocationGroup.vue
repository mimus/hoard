<template>
  <v-card v-if="group">
    <v-layout row nowrap align-baseline>
      <v-flex>
        <v-card-text>
          <b class="mr-1">
            {{ group.label }}
          </b>
        </v-card-text>
      </v-flex>
      <div>
        <v-btn
          small
          :to="{name: 'LocationAdd', params: {id: this.id}}"
        >
          Add Location
        </v-btn>
        <v-btn
          small
          :to="{name: 'LocationGroupEdit', params: {id: this.id}}"
        >
          Edit Location Group
        </v-btn>
      </div>
    </v-layout>
    <v-expansion-panel
      expand
      focusable
      :value="expandedAssets"
    >
      <v-expansion-panel-content
        v-for="(asset, assetId) in assets"
        :key="assetId"
        :value="true"
      >
        <div slot="header">
          {{ assetId }}
          <div class="right mr-2">
            Total: {{ (asset.total || 0) | formatAssetValue(assetId) }}
          </div>
        </div>

        <v-data-table
          :items="asset.locations"
          hide-headers
          hide-actions
          disable-initial-sort
        >
          <template slot="items" slot-scope="props">
            <td>
              <router-link
                :to="{name: 'Location', params: {id: id, locid: props.item.id}}"
              >
                {{ props.item.label }}
                ({{ props.item.asset }})
              </router-link>
            </td>
            <td>
              <b v-if="props.item.address">
                {{ props.item.address }}
              </b>
              <external-location-link :id="props.item.id" />
            </td>
            <td>
              {{ props.item.total | formatAssetValue(assetId) }}
            </td>
          </template>
        </v-data-table>
      </v-expansion-panel-content>
    </v-expansion-panel>
  </v-card>
</template>

<script>

import u from '../utils'

export default {
  props: {
    id: [String, Number]
  },
  computed: {
    group () {
      return this.$store.getters.locationGroup(this.id)
    },
    assets () {
      var assets = {}
      var locsByAsset = this.$store.getters.locationsInGroupByAsset(this.id)
      Object.entries(locsByAsset).forEach(([asset, locs]) => {
        var locations = locs.map(loc => {
          return Object.assign({}, loc, { total: this.$store.getters.ledgerBalanceForLocation(loc.id) })
        })
        var total = locations.reduce((sum, loc) => sum.plus(loc.total), u.newBigNumberForAsset(0, asset))
        assets[asset] = {
          locations,
          total
        }
      })
      return assets
    },
    expandedAssets () {
      return Object.keys(this.assets).map(k => true)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
