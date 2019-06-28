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
        <v-expansion-panel expand>
          <v-expansion-panel-content
            v-for="details in assetsAirdropIncome"
            :key="details.id"
          >
            <template v-slot:header>
              <div>
                {{ details.asset.label }}:
                {{ details.totalAmount | formatAssetValue(details.asset.id) }} {{ details.asset.symbol }}
                =
                <span class="gain">
                  {{ details.totalValueGBP | formatFiat }} GBP
                </span>
              </div>
            </template>
            <v-card-text class="grey lighten-4">
              <v-layout
                v-for="event in details.events"
                :key="event.id"
                class="my-3"
              >
                <v-flex xs3>
                  {{ event.date | formatDateTime }}
                </v-flex>
                <v-flex xs3>
                  {{ event.amount | formatAssetValue(details.asset.id) }} {{ details.asset.symbol }}
                </v-flex>
                <v-flex xs3 class="gain">
                  {{ event.assetValueGBP | formatFiat }} GBP
                </v-flex>
                <v-flex xs3>
                  {{ event.label }}
                  <div
                    v-if="event.comments"
                    class="caption"
                  >
                    {{ event.comments }}
                  </div>
                </v-flex>
              </v-layout>
            </v-card-text>
          </v-expansion-panel-content>
        </v-expansion-panel>
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
