<template>
  <v-card>
    <v-btn
      absolute right
      fab color="blue" dark small
      class="mt-2"
      :to="{name: 'AirdropEventAdd'}"
    >
      <v-icon>add</v-icon>
    </v-btn>
    <div v-if="airdropEvents && airdropEvents.length">
      <v-card-text>
        {{ airdropEvents.length }} Airdrop events
      </v-card-text>
      <v-data-table
        :headers="headers"
        :items="airdropEventsForTable"
        disable-pagination
        hide-default-footer
        sort-by="sortableDate"
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
              {{ props.item.asset }}
            </td>
            <td>
              {{ props.item.amount | formatAssetValue(props.item.asset) }}
            </td>
            <td>
              {{ props.item.label }}
            </td>
            <td>
              {{ props.item.comments }}
              <external-asset-links
                :links="props.item.externalAssetLinks"
                with-short-label
                with-type-label
              />
            </td>
            <td class="related-links-col">
              <associated-links :links="props.item.originalLinked" />
            </td>
            <td class="related-links-col">
              <associated-links :links="props.item.linked" />
            </td>
          </tr>
        </template>
        <template v-slot:no-data>
          No airdrop events.
        </template>
      </v-data-table>
    </div>
    <v-card-text v-else>
      No airdrop events.
    </v-card-text>
  </v-card>
</template>

<script>

import { mapGetters } from 'vuex'

export default {
  data: () => ({
    headers: [
      { text: 'Date', sortable: true, value: 'sortableDate' },
      { text: 'Asset', sortable: true, value: 'asset' },
      { text: 'Amount', sortable: false },
      { text: 'Label', sortable: false },
      { text: 'Comments', sortable: false },
      { text: 'Original', sortable: false },
      { text: 'Airdrop', sortable: false }
    ]
  }),
  computed: {
    ...mapGetters([
      'airdropEvents'
    ]),
    airdropEventsForTable () {
      return this.airdropEvents.map(event => ({
        ...event,
        sortableDate: event.date - 0 // timestamp
      }))
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
