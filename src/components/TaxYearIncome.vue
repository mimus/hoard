<template>
  <div v-if="id">
    <v-subheader>
      Other Income
    </v-subheader>
    <div v-if="assetsIncome.length">
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
            v-for="details in assetsIncome"
            :key="details.id"
          >
            <v-expansion-panel-header>
              <div>
                {{ details.asset.label }}:
                {{ details.totalAmount | formatAssetValue(details.asset.id) }} {{ details.asset.symbol }}
                =
                <span class="gain">
                  {{ details.totalValueGBP | formatFiat }}
                </span>
              </div>
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              <v-card-text class="grey lighten-4">
                <v-row
                  v-for="event in details.events"
                  :key="event.id"
                  class="my-4"
                >
                  <v-col cols="3">
                    {{ event.date | formatDateTime }}
                  </v-col>
                  <v-col cols="3">
                    {{ event.amount | formatAssetValue(details.asset.id) }} {{ details.asset.symbol }}
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
    assetsIncome () {
      var assetsDetails = this.$store.getters.assetsIncomeForTaxYear(this.id)
      assetsDetails = assetsDetails.filter(details => !details.totalValueGBP.isZero())
      return assetsDetails
    },
    totalIncomeValueGBP () {
      return this.assetsIncome.reduce((total, details) => total.plus(details.totalValueGBP), u.newBigNumberForFiat(0))
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
