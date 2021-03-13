<template>
  <div v-if="id">
    <v-subheader>
      Capital Gains
    </v-subheader>
    <div v-if="assetGains && assetGains.length">
      <v-card-text v-if="totalGain.gt(0)">
        Total Gain:
        <span class="gain">
          {{ totalGain | formatFiat }}
        </span>
      </v-card-text>
      <v-card-text v-else-if="totalGain.isZero()">
        No net gain or loss this year.
      </v-card-text>
      <v-card-text v-else>
        Total Loss:
        <span class="loss">
          {{ totalGain.negated() | formatFiat }}
        </span>
      </v-card-text>
      <v-card-text v-if="totalNonFiatGain.gt(0)">
        Total Non-Fiat Gain:
        <span class="gain">
          {{ totalNonFiatGain | formatFiat }}
        </span>
      </v-card-text>
      <v-card-text v-else-if="totalNonFiatGain.isZero()">
        No net gain or loss this year.
      </v-card-text>
      <v-card-text v-else>
        Total Non-Fiat Loss:
        <span class="loss">
          {{ totalNonFiatGain.negated() | formatFiat }}
        </span>
      </v-card-text>
      <v-card-text>
        Total Non-Fiat Disposals:
        {{ totalNonFiatDisposals | formatFiat }}
      </v-card-text>
      <v-card-text>
        <v-expansion-panels
          multiple
          accordion
        >
          <v-expansion-panel
            v-for="item in assetGains"
            :key="item.asset"
          >
            <v-expansion-panel-header>
              <div>
                <span class="mr-1">
                  <v-icon
                    v-if="item.fiat"
                    class="blue-grey--text text--lighten-1"
                  >monetization_on</v-icon>
                  <v-icon
                    v-else
                    class="orange--text text--darken-3"
                  >cloud_queue</v-icon>
                </span>

                {{ item.asset }}:
                <span :class="item.gain && item.gain.gte && item.gain.gte(0) ? 'gain' : 'loss'">
                  {{ item.gain | formatFiat }}
                </span>
                <span class="ml-3">
                  Disposals: {{ item.disposalsTotalValueGBP | formatFiat }}
                </span>
              </div>
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              <v-card-text class="grey lighten-4">
                <v-row>
                  <v-col cols="2">Date</v-col>
                  <v-col cols="2">Gain</v-col>
                  <v-col cols="3">Comments</v-col>
                  <v-col cols="3">Workings for Gain</v-col>
                  <v-col cols="2">Day Value of Disposed Assets:</v-col>
                </v-row>
                <v-row
                  v-for="entry in item.disposals"
                  :key="entry.id"
                  class="my-4"
                >
                  <v-col cols="2">
                    {{ entry.date | formatDateTime }}
                  </v-col>
                  <v-col cols="2" :class="entry.workings.gain && entry.workings.gain.gte && entry.workings.gain.gte(0) ? 'gain' : 'loss'">
                    {{ entry.workings.gain | formatFiat }}
                  </v-col>
                  <v-col cols="3">
                    {{ entry.label }}
                    <div
                      v-if="entry.comments"
                      class="caption"
                    >
                      {{ entry.comments }}
                    </div>
                  </v-col>
                  <v-col cols="3">
                    <div v-if="entry.workings.disposalPlan">
                      <div
                        v-for="(part, partIndex) in entry.workings.disposalPlan"
                        :key="`${entry.id}_${partIndex}`"
                      >
                        {{ part.type }}:
                        {{ part.amount | formatAssetValue(entry.asset) }}
                        (cost {{ part.cost | formatFiat }})
                        <span v-if="part.entry">
                          {{ part.entry.date | formatDate }}
                        </span>
                      </div>
                    </div>
                  </v-col>
                  <v-col cols="2">
                    {{ entry.assetValueGBP}} GBP
                  </v-col>
                </v-row>
              </v-card-text>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-card-text>
    </div>
    <v-card-text v-else>
      No assets with relevant transactions in this year.
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
    fiatAssets () {
      return this.$store.getters.fiatAssets
    },
    assetGains () {
      var assets = this.$store.getters.assetGainsForTaxYear(this.id)
      assets = assets.filter(x => !x.gain.isZero())
      assets = assets.map(x => ({
        ...x,
        fiat: !!this.fiatAssets.find(fiatAsset => fiatAsset.id === x.asset)
      }))
      return assets
    },
    nonFiatAssetGains () {
      return this.assetGains.filter(x => !x.fiat)
    },
    totalGain () {
      return this.assetGains.reduce((sum, x) => sum.plus(x.gain), u.newBigNumberForFiat(0))
    },
    totalNonFiatGain () {
      return this.nonFiatAssetGains.reduce((sum, x) => sum.plus(x.gain), u.newBigNumberForFiat(0))
    },
    totalNonFiatDisposals () {
      return this.nonFiatAssetGains.reduce((sum, x) => sum.plus(x.disposalsTotalValueGBP), u.newBigNumberForFiat(0))
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
</style>
