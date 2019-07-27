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
        :items="transferEvents"
        disable-pagination
        hide-default-footer
        sort-by="date"
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
              <router-link :to="{name: 'Asset', params: {id: props.item.asset}}">
                {{ props.item.asset }}
              </router-link>
            </td>
            <td>
              {{ props.item.amount | formatAssetValue(props.item.asset) }}
            </td>
            <td>
              <TransferEventsEventEntries :entries="props.item.fees" />
            </td>
            <td>
              {{ props.item.label }}
            </td>
            <td>
              <TransferEventsEventEntries :entries="props.item.from" />
            </td>
            <td>
              <TransferEventsEventEntries :entries="props.item.to" />
            </td>
            <td>
              {{ props.item.comments }}
              <external-asset-links
                :links="props.item.externalAssetLinks"
                with-short-label
                with-type-label
              />
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
      { text: 'Date', sortable: true, value: 'date' },
      { text: 'Asset', sortable: true, value: 'asset' },
      { text: 'Amount', sortable: false },
      { text: 'Fee', sortable: false },
      { text: 'Label', sortable: false },
      { text: 'Transfer Out', sortable: false },
      { text: 'Transfer In', sortable: false },
      { text: 'Comments', sortable: false }
    ]
  }),
  computed: mapGetters([
    'transferEvents'
  ])
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
