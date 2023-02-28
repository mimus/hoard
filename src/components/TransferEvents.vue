<template>
  <v-card>
    <v-btn
      absolute right
      fab color="blue" dark small
      class="mt-2"
      :to="{name: 'TransferEventAdd'}"
    >
      <v-icon>add</v-icon>
    </v-btn>
    <div v-if="transferEvents && transferEvents.length">
      <v-card-text>
        {{ transferEvents.length }} Transfer events
      </v-card-text>
      <v-data-table
        :headers="headers"
        :items="transferEventsForTable"
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
              <router-link :to="{name: 'Asset', params: {id: props.item.asset}}">
                {{ props.item.asset }}
              </router-link>
            </td>
            <td>
              {{ props.item.amount | formatAssetValue(props.item.asset) }}
            </td>
            <td>
              <div style="display: grid; grid-template-columns: auto minmax(200px, 1fr); grid-gap: 15px;">
                <i>From:</i>
                <TransferEventsEventEntries :entries="props.item.from" />
                <i>To:</i>
                <TransferEventsEventEntries :entries="props.item.to" />
                <i>Fee:</i>
                <TransferEventsEventEntries :entries="props.item.fees" />
              </div>
            </td>
            <td style="word-break: break-word">
              <p>
                {{ props.item.label }}
                <br>
                <span class="text--secondary">
                  {{ props.item.comments }}
                </span>
                <external-asset-links
                  :links="props.item.externalAssetLinks"
                  with-short-label
                  with-type-label
                />
              </p>
            </td>
            <td>
              <v-tooltip bottom>
                <template #activator="{ on, attrs }">
                  <v-btn
                    v-bind="attrs"
                    v-on="on"
                    :to="{ name: 'TransferEventAddFromBase', params: { baseEventId: props.item.id } }"
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
          No transfer events.
        </template>
      </v-data-table>
    </div>
    <v-card-text v-else>
      No transfer events.
    </v-card-text>
  </v-card>
</template>

<script>

import { mapGetters } from 'vuex'

import TransferEventsEventEntries from './TransferEventsEventEntries'

export default {
  components: { TransferEventsEventEntries },
  data: () => ({
    headers: [
      { text: 'Date', sortable: true, value: 'sortableDate' },
      { text: 'Asset', sortable: true, value: 'asset' },
      { text: 'Amount', sortable: false },
      { text: 'Transfers', sortable: false },
      { text: 'Label/Comments', sortable: false },
      { text: 'Actions', sortable: false }
    ]
  }),
  computed: {
    ...mapGetters([
      'transferEvents'
    ]),
    transferEventsForTable () {
      return this.transferEvents.map(event => ({
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
