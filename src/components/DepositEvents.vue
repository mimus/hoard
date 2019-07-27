<template>
  <v-card>
    <v-btn
      absolute right
      fab color="blue" dark small
      class="mt-2"
      :to="{name: 'DepositEventAdd'}"
    >
      <v-icon>add</v-icon>
    </v-btn>

    <div v-if="depositEvents && depositEvents.length">
      <v-card-text>
        {{ depositEvents.length }} Deposit events
      </v-card-text>

      <v-data-table
        :headers="headers"
        :items="depositEvents"
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
            </td>
            <td class="related-links-col">
              <associated-links :links="props.item.linked" />
            </td>
          </tr>
        </template>
        <template v-slot:no-data>
          No deposit events.
        </template>
      </v-data-table>
    </div>

    <v-card-text v-else>
      No deposit events.
    </v-card-text>

  </v-card>
</template>

<script>

import { mapGetters } from 'vuex'

export default {
  data: () => ({
    headers: [
      { text: 'Date', sortable: true, value: 'date' },
      { text: 'Asset', sortable: false },
      { text: 'Amount', sortable: false },
      { text: 'Label', sortable: false },
      { text: 'Comments', sortable: false },
      { text: 'Related', sortable: false }
    ]
  }),
  computed: mapGetters([
    'depositEvents'
  ])
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
