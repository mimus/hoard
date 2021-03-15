<template>
  <div v-if="id">
    <v-divider class="mt-4" />
    <v-subheader>
      Assets
    </v-subheader>
    <div v-if="assetsForTaxYear.length">
      <v-data-table
        :headers="tableHeaders"
        :items="tableRows"
        disable-pagination
        hide-default-footer
      >
        <template #item.change="{ item: { change, assetId } }">
          <v-card-text v-if="change.gt(0)">
            <span class="gain">
              +
              {{ change | formatAssetValue(assetId) }}
            </span>
          </v-card-text>
          <v-card-text v-else-if="change.isZero()">
            <span class="nochange">
              (no change)
            </span>
          </v-card-text>
          <v-card-text v-else>
            <span class="loss">
              -
              {{ change.negated() | formatAssetValue(assetId) }}
            </span>
          </v-card-text>
        </template>
      </v-data-table>
    </div>
    <v-card-text v-else>
      No assets held this year.
    </v-card-text>
  </div>
</template>

<script>

import u from '../utils'

export default {
  props: {
    id: [Number, String]
  },
  computed: {
    assetsForTaxYear () {
      return this.$store.getters.assetsForTaxYear(this.id).filter(({ asset, startIsZero, endIsZero }) => !asset.fiat && !(startIsZero && endIsZero))
    },
    tableRows () {
      return this.assetsForTaxYear.map(({ asset, start, end }) => {
        const startAmount = start && start.workings.totalPoolAmount
        const endAmount = end && end.workings.totalPoolAmount
        const change = (endAmount || u.newBigNumberForAsset(0, asset.id)).minus(startAmount || u.newBigNumberForAsset(0, asset.id))
        return {
          assetId: asset.id,
          assetLabel: asset.label,
          start: startAmount ? `${u.formatAssetValue(startAmount, asset.id)} ${asset.symbol}` : '-',
          end: endAmount ? `${u.formatAssetValue(endAmount, asset.id)} ${asset.symbol}` : '-',
          change
        }
      })
    },
    tableHeaders () {
      return [
        {
          text: 'Asset',
          value: 'assetLabel'
        },
        {
          text: 'Amount at Start',
          value: 'start'
        },
        {
          text: 'Amount at End',
          value: 'end'
        },
        {
          text: 'Change',
          value: 'change'
        }
      ]
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.gain {
  color: #43A047;
}
.loss {
  color: #cc0000;
}
.nochange {
  color: #888;
  font-size: 0.8em;
}
</style>
