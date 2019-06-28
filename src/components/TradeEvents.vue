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
        :items="tradeEvents"
        :pagination.sync="pagination"
        hide-actions
      >
        <template v-slot:items="props">
          <td>
            <div class="no-wrap">
              {{ props.item.date | formatDate }}
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
          <td>
            {{ props.item.label }}
          </td>
          <td>
            {{ props.item.comments }}
          </td>
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
      { text: 'Date', sortable: true, value: 'date' },
      { text: 'Sold Asset', sortable: false },
      { text: 'Bought Asset', sortable: false },
      { text: 'Fees', sortable: false },
      { text: 'Label', sortable: false },
      { text: 'Comments', sortable: false }
    ],
    pagination: {
      sortBy: 'date',
      descending: true,
      rowsPerPage: -1
    }
  }),
  computed: mapGetters([
    'tradeEvents'
  ])
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.comments {
  font-style: italic;
}
</style>
