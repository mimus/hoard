<template>
  <v-card v-if="location">
    <v-layout row nowrap align-baseline>
      <v-flex>
        <v-card-text>
          <b class="mr-1">
            {{ location && location.label }}
          </b>
          <external-location-link :id="location.id" />
          <router-link :to="{name: 'Asset', params: {id: location.asset}}"
          >({{
            location.asset
          }})</router-link>
        </v-card-text>
      </v-flex>
      <div>
        <v-btn
          small
          :to="{name: 'LocationEdit', params: {id: this.groupId, locId: this.id}}"
        >
          Edit Location
        </v-btn>
      </div>
    </v-layout>

    <div
      v-if="ledgerEntries && ledgerEntries.length"
      key="someEntries"
    >
      <v-card-text>
        {{ ledgerEntries.length }} Ledger entries
      </v-card-text>

      <v-data-table
        :items="ledgerEntries"
        :pagination.sync="pagination"
        :headers="headers"
        hide-actions
        must-sort
      >
        <template slot="items" slot-scope="props">
          <td>
              <span class="no-wrap">
                {{ props.item.date | formatDateTime }}
              </span>
          </td>
          <td>
            {{ props.item.amount | formatAssetValue(location.asset) }}
          </td>
          <td>
            {{ props.item.total | formatAssetValue(location.asset) }}
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
        </template>
      </v-data-table>
    </div>

    <div
      v-else
      key="noEntries"
    >
      <v-card-text>
        No ledger entries.
      </v-card-text>
    </div>

  </v-card>
</template>

<script>

export default {
  props: {
    id: { type: [String, Number], required: true },
    groupId: { type: [String, Number], required: true }
  },
  data: () => ({
    headers: [
      { text: 'Date', sortable: true, value: 'date' },
      { text: 'Amount', sortable: false },
      { text: 'Balance', sortable: false },
      { text: 'Label', sortable: false },
      { text: 'Comments', sortable: false },
      { text: 'Related', sortable: false }
    ],
    pagination: {
      sortBy: 'sortIndex',
      descending: true,
      rowsPerPage: -1
    }
  }),
  computed: {
    location () {
      return this.$store.getters.location(this.id)
    },
    ledgerEntries () {
      return this.$store.getters.ledgerEntriesForLocationCalculated(this.id)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
