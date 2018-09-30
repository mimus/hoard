<template>
  <div v-if="id">
    <v-subheader>
      Mining Income
    </v-subheader>
    <div v-if="miningPoolsIncome.length">
      <v-card-text v-if="totalMiningIncomeValueGBP.gt(0)">
        Total Income:
        <span class="gain">
          {{ totalMiningIncomeValueGBP | formatFiat }} GBP
        </span>
      </v-card-text>
      <v-card-text>
        <v-expansion-panel expand>
          <v-expansion-panel-content
            v-for="pool in miningPoolsIncome"
            :key="pool.id"
          >
            <div slot="header">
              {{ pool.label }} ({{ pool.asset.label }}):
              {{ pool.totalAmount | formatAssetValue(pool.asset.id) }} {{ pool.asset.symbol }}
              =
              <span class="gain">
                {{ pool.totalValueGBP | formatFiat }} GBP
              </span>
            </div>
            <v-card-text class="grey lighten-4">
              <v-layout
                v-for="event in pool.events"
                :key="event.id"
                class="my-3"
              >
                <v-flex xs3>
                  {{ event.date | formatDateTime }}
                </v-flex>
                <v-flex xs3>
                  {{ event.amount | formatAssetValue(pool.asset.id) }} {{ pool.asset.symbol }}
                </v-flex>
                <v-flex xs3 class="gain">
                  {{ event.valueGBP | formatFiat }} GBP
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
      No mining income in this year.
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
    miningPoolsIncome () {
      var pools = this.$store.getters.miningPoolsIncomeForTaxYear(this.id)
      pools = pools.filter(pool => !pool.totalValueGBP.isZero())
      return pools
    },
    totalMiningIncomeValueGBP () {
      return this.miningPoolsIncome.reduce((total, pool) => total.plus(pool.totalValueGBP), u.newBigNumberForFiat(0))
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
