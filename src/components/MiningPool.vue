<template>
  <v-card>
    <v-card-text>
      <div
        v-if="pool"
        key="found"
      >
        <v-layout align-baseline justify-space-between>
          <v-flex>
            <v-card-text>
              <b class="mr-1">
                {{ pool.label }}
              </b>
              ({{ pool.asset }})
            </v-card-text>
          </v-flex>
          <div>
            <v-btn
              small
              :to="{name: 'MiningPoolEdit', params: {id: this.id}}"
            >
              Edit Mining Pool
            </v-btn>
          </div>
        </v-layout>
        <v-card-text
          v-if="pool.comments"
          class="mb-6"
        >
          <i>Comments:</i>
          <div class="ml-2 pool-comments">
            {{ pool.comments }}
          </div>
        </v-card-text>

        <v-btn
          v-if="hasImporters"
          absolute right
          fab color="blue" dark small
          class="mt-2 mr-12"
          title="Import Events"
          :to="{name: 'MiningEventImport'}"
        >
          <v-icon>playlist_add</v-icon>
        </v-btn>
        <v-btn
          absolute right
          fab color="blue" dark small
          class="mt-2"
          title="Add Event Manually"
          :to="{name: 'MiningEventAdd'}"
        >
          <v-icon>add</v-icon>
        </v-btn>
        <div v-if="miningEvents && miningEvents.length">
          <v-card-text>
            {{ miningEvents.length }}
            mining events, total
            {{ poolTotal | formatAssetValue(pool.asset) }} {{ asset.symbol }}
          </v-card-text>
          <v-data-table
            :headers="headers"
            :items="miningEvents"
            disable-pagination
            hide-default-footer
            must-sort
            sort-by="date"
            :sort-desc="true"
          >
            <template v-slot:item="{ item }">
              <tr>
                <td>
                  <div class="text-no-wrap">
                    {{ item.date | formatDate }}
                  </div>
                </td>
                <td>
                  {{ item.amount | formatAssetValue(pool.asset) }}
                </td>
                <td>
                  {{ item.label }}
                </td>
                <td>
                  {{ item.comments }}
                </td>
                <td class="related-links-col">
                  <associated-links :links="item.linked" />
                  <external-asset-links
                    :links="item.externalAssetLinks"
                    with-short-label
                    with-type-label
                  />
                </td>
              </tr>
            </template>
            <template v-slot:no-data>
              No mining events.
            </template>
          </v-data-table>
        </div>
        <v-card-text v-else>
          No mining events.
        </v-card-text>
      </div>
      <div
        v-else
        key="notFound"
      >
        Unknown ID
      </div>
    </v-card-text>
  </v-card>
</template>

<script>

export default {
  props: {
    id: [Number, String]
  },
  data: () => ({
    headers: [
      { text: 'Date', sortable: true, value: 'date' },
      { text: 'Amount', sortable: false },
      { text: 'Label', sortable: false },
      { text: 'Comments', sortable: false },
      { text: 'Related', sortable: false }
    ]
  }),
  computed: {
    asset () {
      return this.$store.getters.asset(this.pool.asset)
    },
    pool () {
      return this.$store.getters.miningPool(this.id)
    },
    poolTotal () {
      return this.$store.getters.miningPoolTotal(this.id)
    },
    miningEvents () {
      return this.$store.getters.miningEventsForPool(this.id)
    },
    hasImporters () {
      var asset = this.pool && this.pool.asset
      var servicesForAsset = asset && this.$services[asset] && this.$services[asset].services
      return servicesForAsset && servicesForAsset.find(s => s.fetchTransactions)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .pool-comments {
    white-space:pre-wrap;
  }
</style>
