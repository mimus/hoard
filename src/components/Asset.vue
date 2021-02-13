<template>
  <v-card v-if="asset">
    <v-card-text>
      <v-layout align-baseline>
        <v-flex>
          <b class="mr-1">
            {{ asset.label }} ({{ asset.symbol }})
          </b>
          <v-icon
            v-if="asset.fiat"
            class="blue-grey--text text--lighten-1"
          >monetization_on</v-icon>
          <v-icon
            v-if="!asset.fiat"
            class="orange--text text--darken-3"
          >cloud_queue</v-icon>
          <span
            v-if="currentValue"
            style="margin-left: 10px;"
          >
            <b>
              &pound;{{ currentValue | formatFiat }}
            </b>
            <i style="margin-left: 5px">
              (1 {{ asset.symbol }} = {{ assetPrice | formatFiat }} GBP)
            </i>
          </span>
          <div v-if="currentPoolStatus">
            Latest pool status:
            {{ currentPoolStatus.amount | formatAssetValue(asset.id) }} {{ asset.symbol}},
            cost basis &pound;{{ currentPoolStatus.cost | formatFiat }},
            averaging &pound;{{ currentPoolStatus.costPerUnit | formatFiat }} per {{ asset.symbol }}.
            <template v-if="currentPoolStatus.gain !== null">
              <br>If selling now, total
              <template v-if="currentPoolStatus.gain >= 0">
                 GAIN would be &pound;{{ currentPoolStatus.gain | formatFiat }}
              </template>
              <template v-else>
                LOSS would be &pound;{{ -currentPoolStatus.gain | formatFiat }}
              </template>
            </template>
          </div>
        </v-flex>
        <div>
          <v-btn
            small
            :to="{name: 'AssetEdit', params: {id: this.id}}"
          >
            Edit Asset {{ asset.id }}
          </v-btn>
        </div>
      </v-layout>
    </v-card-text>

    <div v-if="ledgerEntries && ledgerEntries.length">
      <v-card-text>
        {{ ledgerEntries.length }} Ledger entries
      </v-card-text>
      <v-data-table
        :headers="headers"
        :items="ledgerEntries"
        disable-pagination
        hide-default-footer
        must-sort
        sort-by="sortIndex"
        :sort-desc="true"
      >
        <template v-slot:item="props">
          <tr>
            <td>
              <div class="text-no-wrap">
                {{ props.item.date | formatDate }}
              </div>
            </td>
            <td>
              <span
                v-if="props.item.type=='acquisition'"
                class="acquisition"
              >
                +{{ props.item.amount | formatAssetValue(asset.id) }}
              </span>
              <span
                v-if="props.item.type=='disposal'"
                class="disposal"
              >
                {{ props.item.amount | formatAssetValue(asset.id) }}
              </span>
            </td>
            <td>
              <b>&pound;{{ props.item.assetValueGBP | formatFiat }}</b>
            </td>
            <td>
              <div v-if="props.item.workings.poolAmount > 0">
                {{ props.item.workings.poolAmount | formatAssetValue(asset.id) }}
                <br>&pound;{{ props.item.workings.poolValueGBP | formatFiat }}
              </div>
            </td>
            <td>
              {{ props.item.workings.totalPoolAmount | formatAssetValue(asset.id) }},
              <br>&pound;{{ props.item.workings.totalPoolCost | formatFiat }}
            </td>
            <td>
              <span v-if="props.item.workings.hasOwnProperty('costBasis')">
                &pound;{{ props.item.workings.costBasis | formatFiat }}
              </span>
            </td>
            <td>
              <span v-if="props.item.workings.hasOwnProperty('gain')">
                &pound;{{ props.item.workings.gain | formatFiat }}
              </span>
            </td>
            <td>
              {{ props.item.label }}
            </td>
            <td>
              {{ props.item.comments }}
              <div v-if="props.item.workings.disposalPlan">
                <div
                  v-for="(part, partIndex) in props.item.workings.disposalPlan"
                  :key="`${props.item.id}_${partIndex}`"
                >
                  {{ part.type }}:
                  {{ part.amount | formatAssetValue(asset.id) }}
                  (cost &pound;{{ part.cost | formatFiat }})

                  <span v-if="part.entry">
                    {{ part.entry.date | formatDate }}
                  </span>
                </div>
              </div>
            </td>
            <td class="related-links-col">
              <associated-links :links="props.item.linked" />
            </td>
          </tr>
        </template>
        <template v-slot:no-data>
          No ledger entries.
        </template>
      </v-data-table>
    </div>
    <v-card-text v-else>
      No ledger entries.
    </v-card-text>
  </v-card>
</template>

<script>

export default {
  props: {
    id: String
  },
  data: () => ({
    headers: [
      { text: 'Date', sortable: true, value: 'sortIndex' },
      { text: 'Amount', sortable: false },
      { text: 'Value', sortable: false },
      { text: 'Pool Amount', sortable: false },
      { text: 'Total Pool', sortable: false },
      { text: 'Cost Basis', sortable: false },
      { text: 'Gain', sortable: false },
      { text: 'Label', sortable: false },
      { text: 'Comments', sortable: false },
      { text: 'Related', sortable: false }
    ]
  }),
  computed: {
    asset () {
      return this.$store.getters.asset(this.id)
    },
    assetPrice () {
      return this.$store.getters.assetPriceById && this.$store.getters.assetPriceById[this.id]
    },
    ledgerEntries () {
      return this.$store.getters.ledgerEntriesForAsset(this.id)
    },
    mostRecentLedgerEntry () {
      if (!this.ledgerEntries || !this.ledgerEntries.length) { return null }
      return this.ledgerEntries[this.ledgerEntries.length - 1]
    },
    currentPoolStatus () {
      if (!this.mostRecentLedgerEntry ||
        !this.mostRecentLedgerEntry.workings ||
        !this.mostRecentLedgerEntry.workings.totalPoolAmount ||
        !this.mostRecentLedgerEntry.workings.totalPoolCost) {
        return null
      }
      const amount = this.mostRecentLedgerEntry.workings.totalPoolAmount
      const cost = this.mostRecentLedgerEntry.workings.totalPoolCost
      const costPerUnit = cost.dividedBy(amount)
      const value = this.assetPrice ? amount.times(this.assetPrice) : null
      const gain = value !== null ? value - cost : null
      return { amount, cost, costPerUnit, gain }
    },
    currentAmount () {
      if (!this.mostRecentLedgerEntry || !this.mostRecentLedgerEntry.workings) { return null }
      return this.mostRecentLedgerEntry.workings.totalPoolAmount
    },
    currentValue () {
      if (!this.mostRecentLedgerEntry || !this.assetPrice) { return null }
      return this.currentAmount.times(this.assetPrice)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.acquisition {
  color: #00cc00;
}
.disposal {
  color: #cc0000;
}
</style>
