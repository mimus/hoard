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
        :items="depositEventsForTable"
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
              {{ props.item.asset }}
            </td>
            <td>
              {{ props.item.amount | formatAssetValue(props.item.asset) }}
            </td>
            <td>
              <p>
                {{ props.item.label }}
                <br>
                <span class="text--secondary">{{ props.item.comments }}</span>
              </p>
            </td>
            <td class="related-links-col">
              <associated-links :links="props.item.linked" />
            </td>
            <td>
              <v-tooltip bottom>
                <template #activator="{ on, attrs }">
                  <v-btn
                    v-bind="attrs"
                    v-on="on"
                    :to="{ name: 'DepositEventAddFromBase', params: { baseEventId: props.item.id } }"
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
      { text: 'Date', sortable: true, value: 'sortableDate' },
      { text: 'Asset', sortable: false },
      { text: 'Amount', sortable: false },
      { text: 'Label/Comments', sortable: false },
      { text: 'Related', sortable: false },
      { text: 'Actions', sortable: false }
    ]
  }),
  computed: {
    ...mapGetters([
      'depositEvents'
    ]),
    depositEventsForTable () {
      return this.depositEvents.map(event => ({
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
