<template>
  <div v-if="id">
    <v-subheader>
      Airdrop Income
    </v-subheader>
    <div v-if="assetsAirdropIncome.length">
      <v-card-text v-if="totalAirdropIncomeValueGBP.gt(0)">
        Total Income:
        <span class="gain">
          {{ totalAirdropIncomeValueGBP | formatFiat }} GBP
        </span>
      </v-card-text>
      <v-card-text>
        <v-expansion-panels
          multiple
          accordion
        >
          <v-expansion-panel
            v-for="details in assetsAirdropIncome"
            :key="details.id"
          >
            <v-expansion-panel-header>
              <div>
                {{ details.asset.label }}:
                {{ details.totalAmount | formatAssetValue(details.asset.id) }} {{ details.asset.symbol }}
                =
                <span class="gain">
                  {{ details.totalValueGBP | formatFiat }} GBP
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
                    {{ event.assetValueGBP | formatFiat }} GBP
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
      No airdrop income in this year.
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
    assetsAirdropIncome () {
      var assetsDetails = this.$store.getters.assetsAirdropIncomeForTaxYear(this.id)
      assetsDetails = assetsDetails.filter(details => !details.totalValueGBP.isZero())
      return assetsDetails
    },
    totalAirdropIncomeValueGBP () {
      return this.assetsAirdropIncome.reduce((total, details) => total.plus(details.totalValueGBP), u.newBigNumberForFiat(0))
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
