<template>
  <v-card>
    <v-card-text>
      <div
        v-if="source"
        key="found"
      >
        <v-layout align-baseline justify-space-between>
          <v-flex>
            <v-card-text>
              <b class="mr-1">
                {{ source.label }}
              </b>
              ({{ source.originalAsset }} &rarr; {{ source.incomeAsset }})

              <template v-if="source.comments">
                <br />
                {{ source.comments }}
              </template>
            </v-card-text>
          </v-flex>
          <div>
            <v-btn
              small
              :to="{name: 'IncomeSourceEdit', params: {id: this.id}}"
            >
              Edit Income Source
            </v-btn>
          </div>
        </v-layout>
        <v-btn
          v-if="hasImporters"
          absolute right
          fab color="blue" dark small
          class="mt-2 mr-12"
          title="Import Events"
          :to="{name: 'IncomeEventImport'}"
        >
          <v-icon>playlist_add</v-icon>
        </v-btn>
        <v-btn
          absolute right
          fab color="blue" dark small
          class="mt-2"
          title="Add Event Manually"
          :to="{name: 'IncomeEventAdd'}"
        >
          <v-icon>add</v-icon>
        </v-btn>
        <div v-if="incomeEvents && incomeEvents.length">
          <v-card-text>
            {{ incomeEvents.length }}
            income events, total
            {{ sourceTotal | formatAssetValue(source.asset) }} {{ asset.symbol }}
          </v-card-text>
          <v-data-table
            :headers="headers"
            :items="incomeEventsForTable"
            disable-pagination
            hide-default-footer
            must-sort
            sort-by="sortableDate"
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
                  {{ item.amount | formatAssetValue(source.asset) }}
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
              No income events.
            </template>
          </v-data-table>
        </div>
        <v-card-text v-else>
          No income events.
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
      { text: 'Date', sortable: true, value: 'sortableDate' },
      { text: 'Amount', sortable: false },
      { text: 'Label', sortable: false },
      { text: 'Comments', sortable: false },
      { text: 'Related', sortable: false }
    ]
  }),
  computed: {
    asset () {
      return this.$store.getters.asset(this.source.asset)
    },
    source () {
      return this.$store.getters.incomeSource(this.id)
    },
    sourceTotal () {
      return this.$store.getters.incomeSourceTotal(this.id)
    },
    incomeEvents () {
      return this.$store.getters.incomeEventsForSource(this.id)
    },
    incomeEventsForTable () {
      return this.incomeEvents.map(event => ({
        ...event,
        sortableDate: event.date - 0 // timestamp
      }))
    },
    hasImporters () {
      var asset = this.source && this.source.asset
      var servicesForAsset = asset && this.$services[asset] && this.$services[asset].services
      return servicesForAsset && servicesForAsset.find(s => s.fetchIncome)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
