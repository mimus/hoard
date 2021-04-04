<template>
  <div v-if="id">
    <v-subheader>
      Other Income
    </v-subheader>
    <div v-if="sourcesIncome.length">
      <v-card-text v-if="totalIncomeValueGBP.gt(0)">
        Total Income:
        <span class="gain">
          {{ totalIncomeValueGBP | formatFiat }}
        </span>
      </v-card-text>
      <v-card-text>
        <v-expansion-panels
          multiple
          accordion
        >
          <v-expansion-panel
            v-for="sourceDetails in sourcesIncome"
            :key="sourceDetails.id"
          >
            <v-expansion-panel-header>
              <div>
                {{ sourceDetails.source.label }}:
                <span class="gain">
                  {{ sourceDetails.totalValueGBP | formatFiat }}
                </span>
              </div>
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              <template v-if="sourceDetails.assets.length === 1">
                <v-card-text class="grey lighten-4">
                  <v-row
                    v-for="event in sourceDetails.assets[0].events"
                    :key="event.id"
                    class="my-4"
                  >
                    <v-col cols="3">
                      {{ event.date | formatDateTime }}
                    </v-col>
                    <v-col cols="3">
                      {{ event.amount | formatAssetValue(sourceDetails.assets[0].asset.id) }} {{ sourceDetails.assets[0].asset.symbol }}
                    </v-col>
                    <v-col cols="3" class="gain">
                      {{ event.assetValueGBP | formatFiat }}
                    </v-col>
                    <v-col cols="3">
                      {{ event.label }}
                      <div
                        v-if="event.comments"
                        class="caption"
                      >
                        {{ event.comments }}
                      </div>
                    </v-col>
                  </v-row>
                </v-card-text>
              </template>
              <v-expansion-panels
                v-else
                multiple
                accordion
              >
                <v-expansion-panel
                  v-for="assetDetails in sourceDetails.assets"
                  :key="assetDetails.id"
                >
                  <v-expansion-panel-header>
                    <div>
                      {{ assetDetails.asset.label }}:
                      {{ assetDetails.totalAmount | formatAssetValue(assetDetails.asset.id) }} {{ assetDetails.asset.symbol }}
                      =
                      <span class="gain">
                        {{ assetDetails.totalValueGBP | formatFiat }}
                      </span>
                    </div>
                  </v-expansion-panel-header>
                  <v-expansion-panel-content>
                    <v-card-text class="grey lighten-4">
                      <v-row
                        v-for="event in assetDetails.events"
                        :key="event.id"
                        class="my-4"
                      >
                        <v-col cols="3">
                          {{ event.date | formatDateTime }}
                        </v-col>
                        <v-col cols="3">
                          {{ event.amount | formatAssetValue(assetDetails.asset.id) }} {{ assetDetails.asset.symbol }}
                        </v-col>
                        <v-col cols="3" class="gain">
                          {{ event.assetValueGBP | formatFiat }}
                        </v-col>
                        <v-col cols="3">
                          {{ event.label }}
                          <div
                            v-if="event.comments"
                            class="caption"
                          >
                            {{ event.comments }}
                          </div>
                        </v-col>
                      </v-row>
                    </v-card-text>
                  </v-expansion-panel-content>
                </v-expansion-panel>
              </v-expansion-panels>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-card-text>
    </div>
    <v-card-text v-else>
      No other income in this year.
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
    sourcesIncome () {
      return this.$store.getters.sourcesIncomeForTaxYear(this.id)
    },
    totalIncomeValueGBP () {
      return this.sourcesIncome.reduce((total, details) => total.plus(details.totalValueGBP), u.newBigNumberForFiat(0))
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
