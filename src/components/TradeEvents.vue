<template>
  <v-card>
    <v-btn
      absolute right
      fab color="blue" dark small
      class="mt-2"
      :to="{name: 'TradeEventAdd'}"
    >
      <v-icon>add</v-icon>
    </v-btn>
    <div v-if="tradeEvents && tradeEvents.length">
      <v-card-text>
        {{ tradeEvents.length }} Trade events
      </v-card-text>
      <v-data-table
        :headers="headers"
        :items="tradeEventsForTable"
        disable-pagination
        hide-default-footer
        sort-by="sortableDate"
        :sort-desc="true"
      >
        <template v-slot:item="props">
          <tr>
            <td>
              <div class="text-no-wrap">
                {{ props.item.date | formatDateTime }}
              </div>
            </td>
            <td>
              <TradeEventsEventEntries :entries="props.item.disposed" />
            </td>
            <td>
              <TradeEventsEventEntries :entries="props.item.acquired" />
            </td>
            <td>
              <TradeEventsEventEntries :entries="props.item.fees" />
            </td>
            <td style="word-break: break-word;">
              <p>
                {{ props.item.label }}
                <br>
                <span class="text--secondary">
                  {{ props.item.comments }}
                </span>
              </p>
              <external-asset-links
                :links="props.item.externalAssetLinks"
                with-short-label
                with-type-label
              />
            </td>
            <td>
              <v-tooltip bottom>
                <template #activator="{ on, attrs }">
                  <v-btn
                    v-bind="attrs"
                    v-on="on"
                    :to="{ name: 'TradeEventAddFromBase', params: { baseEventId: props.item.id } }"
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
          No trade events.
        </template>
      </v-data-table>
    </div>
    <v-card-text v-else>
      No trade events.
    </v-card-text>
  </v-card>
</template>

<script>

import { mapGetters } from 'vuex'
import TradeEventsEventEntries from './TradeEventsEventEntries'

export default {
  components: { TradeEventsEventEntries },
  data: () => ({
    headers: [
      { text: 'Date', sortable: true, value: 'sortableDate' },
      { text: 'Sold Asset', sortable: false },
      { text: 'Bought Asset', sortable: false },
      { text: 'Fees', sortable: false },
      { text: 'Label/Comments', sortable: false },
      { text: 'Actions', sortable: false }
    ]
  }),
  computed: {
    ...mapGetters([
      'tradeEvents'
    ]),
    tradeEventsForTable () {
      return this.tradeEvents.map(event => ({
        ...event,
        sortableDate: event.date - 0 // timestamp
      }))
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.comments {
  font-style: italic;
}
</style>
