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
              <template v-if="source.originalAsset || source.incomeAsset">
                ({{ source.originalAsset || 'any' }} &rarr; {{ source.incomeAsset || 'any' }})
              </template>
              <template v-if="source.comments">
                <br />
                {{ source.comments }}
              </template>
            </v-card-text>
          </v-flex>
          <div>
            <v-btn
              small
              :to="{name: 'IncomeSourceEdit', params: {id}}"
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
          :to="{name: 'IncomeEventImport', params: {sourceId: source.id}}"
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
            income events
            <template v-if="asset">
              <br> total
              {{ sourceTotal | formatAssetValue(source.incomeAsset) }} {{ asset.symbol }}
            </template>
            ({{ sourceTotalGBPValue | formatFiat }})
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
                    {{ item.date | formatDateTime }}
                  </div>
                </td>
                <td>
                  {{ item.asset }}
                </td>
                <td>
                  {{ item.amount | formatAssetValue(item.incomeAsset) }}
                </td>
                <td>
                  {{ item.assetValueGBP | formatFiat }}
                </td>
                <td>
                  <p>{{ item.label }}
                    <br>
                    <span class="text--secondary">{{ item.comments }}</span>
                    <external-asset-links
                      :links="item.externalAssetLinks"
                      with-short-label
                      with-type-label
                    />
                  </p>
                </td>
                <td>
                  <associated-links :links="item.originalLinked" />
                </td>
                <td>
                  <associated-links :links="item.linked" />
                </td>
                <td>
                  <v-tooltip bottom>
                    <template #activator="{ on, attrs }">
                      <v-btn
                        v-bind="attrs"
                        v-on="on"
                        :to="{ name: 'IncomeEventAddFromBase', params: { baseEventId: item.id } }"
                        small
                        icon
                      >
                        <v-icon>content_copy</v-icon>
                      </v-btn>
                    </template>
                    Add another based on this event
                  </v-tooltip>
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
      { text: 'Asset', sortable: true, value: 'asset' },
      { text: 'Amount', sortable: false },
      { text: 'Value', sortable: false },
      { text: 'Label/Comments', sortable: false },
      { text: 'Original', sortable: false },
      { text: 'Income', sortable: false },
      { text: 'Actions', sortable: false }
    ]
  }),
  computed: {
    asset () {
      return this.$store.getters.asset(this.source.incomeAsset)
    },
    source () {
      return this.$store.getters.incomeSource(this.id)
    },
    sourceSummary () {
      return this.$store.getters.incomeSourceSummary(this.id)
    },
    sourceTotal () {
      return this.sourceSummary.total
    },
    sourceTotalGBPValue () {
      return this.sourceSummary.totalGBPValue
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
      var incomeServices = this.$genericServices.filter(s => s.fetchIncomeEvents || s.loadIncomeEvents)
      return incomeServices.length > 0
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
