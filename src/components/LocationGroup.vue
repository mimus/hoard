<template>
  <v-card v-if="group">
    <v-card-text>
      <v-layout align-baseline>
        <v-flex>
          <b class="mr-4">
            {{ group.label }}
          </b>
        </v-flex>
        <div>
          <v-btn
            small
            class="mr-4"
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
    </v-card-text>
    <v-expansion-panels
      multiple
      accordion
      :value="expandedAssets"
    >
      <v-expansion-panel
        v-for="(asset, assetId) in assets"
        :key="assetId"
      >
        <v-expansion-panel-header>
          <div>
            {{ assetId }}
            <div class="float-right mr-2">
              Total: {{ (asset.total || 0) | formatAssetValue(assetId) }}
            </div>
          </div>
        </v-expansion-panel-header>

        <v-expansion-panel-content>
          <v-data-table
            :items="asset.locations"
            hide-default-header
            disable-pagination
            hide-default-footer
          >
            <template v-slot:item="props">
              <tr>
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
              </tr>
            </template>
          </v-data-table>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
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
      // we want to expand all of them: return an array containing all row indices
      var length = Object.keys(this.assets).length
      var indices = []
      for (var i=0; i<length; i++) {
        indices.push(i)
      }
      return indices
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
