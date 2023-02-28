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
        :items-per-page="200"
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

              <v-btn
                small
                icon
                @click="confirmDelete(props.item)"
              >
                <v-icon>delete</v-icon>
              </v-btn>
            </td>
          </tr>
        </template>
        <template v-slot:no-data>
          No trade events.
        </template>
      </v-data-table>
      <v-dialog
        v-model="confirmDeleteIsOpen"
        width="500"
      >
        <v-card v-if="eventToDelete">
          <v-card-text>
            Are you sure you want to delete this trade event?
            <br>
            <br>{{ eventToDelete.label }}
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              @click="confirmDeleteIsOpen = false"
            >
              Cancel
            </v-btn>
            <v-btn
              color="error"
              @click="deleteTradeEvent"
            >
              Delete
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
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
    ],
    eventToDelete: null,
    confirmDeleteIsOpen: false
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
  },
  methods: {
    confirmDelete (event) {
      this.eventToDelete = event
      this.confirmDeleteIsOpen = true
    },
    deleteTradeEvent (eventId) {
      this.$store.dispatch('deleteTradeEvent', this.eventToDelete.id).then(
        () => {
          this.confirmDeleteIsOpen = false
        },
        (err) => {
          console.error('error deleting trade event', err)
        }
      )
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
