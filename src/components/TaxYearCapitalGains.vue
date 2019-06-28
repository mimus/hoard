<template>
  <div v-if="id">
    <v-subheader>
      Capital Gains
    </v-subheader>
    <div v-if="assetGains && assetGains.length">
      <v-card-text v-if="totalGain.gt(0)">
        Total Gain:
        <span class="gain">
          {{ totalGain | formatFiat }} GBP
        </span>
      </v-card-text>
      <v-card-text v-else-if="totalGain.isZero()">
        No net gain or loss this year.
      </v-card-text>
      <v-card-text v-else>
        Total Loss:
        <span class="loss">
          {{ totalGain.negated() | formatFiat }} GBP
        </span>
      </v-card-text>
      <v-card-text>
        <v-expansion-panel expand>
          <v-expansion-panel-content
            v-for="item in assetGains"
            :key="item.asset"
          >
            <template v-slot:header>
              <div>
                {{ item.asset }}:
                <span :class="item.gain && item.gain.gte && item.gain.gte(0) ? 'gain' : 'loss'">
                  {{ item.gain | formatFiat }} GBP
                </span>
              </div>
            </template>
            <v-card-text class="grey lighten-4">
              <v-layout
                v-for="entry in item.disposals"
                :key="entry.id"
                class="my-3"
              >
                <v-flex xs3>
                  {{ entry.date | formatDateTime }}
                </v-flex>
                <v-flex xs3 :class="entry.workings.gain && entry.workings.gain.gte && entry.workings.gain.gte(0) ? 'gain' : 'loss'">
                  {{ entry.workings.gain | formatFiat }} GBP
                </v-flex>
                <v-flex xs3>
                  {{ entry.label }}
                  <div
                    v-if="entry.comments"
                    class="caption"
                  >
                    {{ entry.comments }}
                  </div>
                </v-flex>
                <v-flex xs3>
                  <div v-if="entry.workings.disposalPlan">
                    <div
                      v-for="(part, partIndex) in entry.workings.disposalPlan"
                      :key="`${entry.id}_${partIndex}`"
                    >
                      {{ part.type }}:
                      {{ part.amount | formatAssetValue(entry.asset) }}
                      (cost &pound;{{ part.cost | formatFiat }})
                      <span v-if="part.entry">
                        {{ part.entry.date | formatDate }}
                      </span>
                    </div>
                  </div>
                </v-flex>
              </v-layout>
            </v-card-text>
          </v-expansion-panel-content>
        </v-expansion-panel>
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
    assetGains () {
      var assets = this.$store.getters.assetGainsForTaxYear(this.id)
      assets = assets.filter(x => !x.gain.isZero())
      return assets
    },
    totalGain () {
      return this.assetGains.reduce((sum, x) => sum.plus(x.gain), u.newBigNumberForFiat(0))
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
