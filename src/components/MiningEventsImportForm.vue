<template>
  <base-form @submit="submit">
    <location-select
      v-model="locationId"
      label="Payout Location"
      :asset="asset && asset.id"
      :requireAsset="true"
      :required="true"
    />

    <div
      v-if="transactions.length"
      class="mb-3"
    >
      <v-btn
        :loading="pricesFetchStatus.loading"
        @click="lookUpAllPrices()"
      >
        Look Up All Prices
        <v-icon right>cloud_download</v-icon>
      </v-btn>
    </div>

    <v-alert
      :value="!!pricesFetchStatus.error"
      type="error"
      class="mb-3"
    >
      {{ pricesFetchStatus.error }}
    </v-alert>

    <v-expansion-panel
      :expand="true"
      :value="expandedTransactions"
    >
      <v-expansion-panel-content
        v-for="transaction in transactions"
        :key="transaction.id"
      >
        <template v-slot:header>
          <v-layout align-center>
            {{ transaction.date | formatDateTime }}
            <span
              v-if="transaction.amount"
              class="mx-3"
            >
              {{ transaction.amount | formatAssetValue(asset.id) }}
              {{ asset.symbol}}
            </span>
            <v-flex v-if="transaction.isImportable">
              <v-checkbox
                v-model="transaction.selected"
                label="Import this"
                hide-details
              ></v-checkbox>
            </v-flex>
            <span
              v-else
              class="ml-2"
            >
              <v-icon
                v-if="transaction.existingEvent"
                title="Already imported event"
              >
                check_circle_outline
              </v-icon>
              <v-icon
                v-else
                title="Cannot import"
              >
                block
              </v-icon>
            </span>
          </v-layout>
        </template>
        <v-card>
          <v-card-text>
            <div
              v-if="transaction.isImportable"
              :key="`${transaction.id}-isImportable`"
            >
              <v-layout>
                <v-flex class="mx-3">
                    <v-text-field
                      v-model="transaction.amount"
                      label="Amount"
                      readonly
                    ></v-text-field>
                </v-flex>
                <v-flex class="mx-3">
                  <v-layout row align-center>
                    <price-lookup
                      v-model="transaction.assetPriceGBP"
                      :asset="asset"
                      :date="transaction.date"
                      :requestFetch="transaction.requestPriceFetch"
                      :textToAnnotate="transaction.comments"
                      @input="onPriceLookedUp(transaction)"
                      @error="onPriceLookupError(transaction, $event)"
                      @annotatedText="transaction.comments = $event"
                    />
                    <v-text-field
                      v-model="transaction.assetPriceGBP"
                      :label="`Price of 1 ${asset.label} in GBP`"
                    ></v-text-field>
                  </v-layout>
                </v-flex>
                <v-flex class="mx-3">
                  <v-text-field
                    v-model="transaction.valueGBP"
                    label="Received value in GBP"
                  ></v-text-field>
                </v-flex>
              </v-layout>
              <v-layout row>
                <v-flex class="mx-3">
                  <v-text-field
                    v-model="transaction.label"
                    label="Label"
                  ></v-text-field>
                </v-flex>
                <v-flex class="mx-3">
                  <v-text-field
                    v-model="transaction.comments"
                    label="Comments"
                  ></v-text-field>
                </v-flex>
              </v-layout>
              <v-layout>
                <div
                  v-if="transaction.externalAssetLinks"
                  class="mx-3"
                >
                  <div
                    v-for="link in transaction.externalAssetLinks"
                    :key="`${link.asset}_${link.type}_${link.item}`"
                  >
                    <external-asset-link
                      v-bind="link"
                      with-short-label
                      with-type-label
                      color="black"
                    />
                  </div>
                </div>
              </v-layout>
            </div>
            <div
              v-else
              :key="`${transaction.id}-isNotImportable`"
            >
              <div v-if="transaction.existingEvent">
                Existing event:
                <associated-link
                  :link="{id: transaction.existingEvent.id, type: 'miningEvent'}"
                />
              </div>
              <div v-if="transaction.notImportableMessage">
                {{ transaction.notImportableMessage }}
              </div>
              <div v-if="transaction.isFromSelf">
                Transfer from me:
                <span
                  v-for="inputAddress in transaction.inputAddresses"
                  :key="inputAddress.address"
                >
                  <i v-if="inputAddress.location">
                    <associated-link
                      :link="{id: inputAddress.location.id, type: 'location'}"
                    />
                  </i>
                  <i v-else>
                    {{ inputAddress.address }}
                  </i>
                </span>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-expansion-panel-content>
    </v-expansion-panel>

    <v-alert
      :value="locationId && !address"
      type="warning"
    >
      This location doesn't have an address - can't look it up
    </v-alert>

    <div
      v-if="address"
      class="mt-3"
    >
      <external-transactions-fetcher
        v-model="fetched.transactions"
        :asset="assetId"
        :importerId="importerId"
        :address="address"
        @input="onTransactionsFetched"
        @error="fetched.error = $event"
      />
      <external-location-link
        :id="locationId"
        with-label
      />
      <v-alert
        :value="!!fetched.error"
        type="error"
      >
       {{ fetched.error }}
      </v-alert>
    </div>

    <v-alert
      :value="!!submitError"
      type="error"
    >
     {{ submitError }}
    </v-alert>

    <div class="mb-3"></div>

  </base-form>
</template>

<script>
import moment from 'moment'
import u from '../utils'

export default {
  props: {
    poolId: [Number, String],
    importerId: String
  },
  data: () => ({
    submitError: null,
    required: (value) => !!value || 'Required',
    locationId: null,
    fetched: {
      transactions: null,
      error: null
    },
    transactions: []
  }),
  computed: {
    pool () {
      return this.poolId ? this.$store.getters.miningPool(this.poolId) : null
    },
    assetId () {
      return this.pool && this.pool.asset
    },
    asset () {
      var assetId = this.assetId
      return assetId ? this.$store.getters.asset(assetId) : null
    },
    assetLocations () {
      return this.$store.getters.locationsForAsset(this.asset.id)
    },
    location () {
      return this.locationId && this.$store.getters.location(this.locationId)
    },
    address () {
      return this.location && this.location.address
    },
    expandedTransactions () {
      return this.transactions.map(t => t.selected)
    },
    pricesFetchStatus () {
      var transactionWithError = this.transactions.find(t => t.fetchingPriceError)
      var error = transactionWithError && (transactionWithError.fetchingPriceError || 'Error fetching price')
      return {
        loading: this.transactions.some(t => t.fetchingPrice),
        error: error
      }
    }
  },
  watch: {
    poolId () {
      this.resetTransactions()
    },
    assetId () {
      this.resetTransactions()
    },
    locationId () {
      this.resetTransactions()
      this.submitError = null
    },
    importerId () {
      this.resetTransactions()
    }
  },
  methods: {
    resetTransactions () {
      this.transactions = []
    },
    onTransactionsFetched () {
      var fetchedTs = this.fetched.transactions
      if (!fetchedTs || !fetchedTs.length) {
        return
      }

      var assetLocations = this.assetLocations
      var locationId = this.locationId
      var transactions = fetchedTs.map(x => {
        var date = x.date

        // Check inputs and match up known locations
        var inputAddresses = x.inputAddresses
        inputAddresses = inputAddresses.map(inputAddress => {
          var knownLocation = assetLocations.find(loc => loc.address === inputAddress)
          return {
            address: inputAddress,
            location: knownLocation
          }
        })
        var isFromSelf = inputAddresses.findIndex(x => x.location) !== -1

        // Check outputs
        var receivedHere = x.outputs.filter(output => output.isToThisAddress)
        var hasSingleOutput = receivedHere.length === 1 && receivedHere[0].isToSingleAddress
        var amount = hasSingleOutput ? receivedHere[0].value : ''

        // Does this look like an importable mining event?
        var isImportable = !isFromSelf && hasSingleOutput

        // Check for errors fetching the transaction details
        isImportable = !x.errorFetchingDetails && isImportable

        // Check for existing events
        var existingEvent = null
        if (isImportable) {
          existingEvent = this.$store.getters.firstMatchingMiningEvent({
            poolId: this.poolId,
            dateStart: moment(date).subtract(1.5, 'hours'),
            dateEnd: moment(date).add(1.5, 'hours'),
            amount,
            locationId
          })
          if (existingEvent) {
            isImportable = false
          }
        }

        // Prepare for display
        var selected = isImportable
        var transactionId = x.transactionId
        var label = isImportable ? `Mined ${u.formatAssetValue(amount, this.asset.id)} ${this.asset.symbol} on ${this.pool.label}` : ''
        var comments = ''
        var notImportableMessage = ''
        if (!isImportable && !isFromSelf && !existingEvent) {
          if (hasSingleOutput) {
            notImportableMessage = 'Can only import single-output transactions - please enter this event manually.'
          }
          if (x.errorFetchingDetails) {
            notImportableMessage = x.errorFetchingDetails
          }
        }

        // Include link to transaction
        var externalAssetLinks = [{
          asset: this.asset.id,
          type: 'transaction',
          item: transactionId
        }]

        return {
          id: transactionId,
          date,
          amount, // string
          inputAddresses,
          isImportable,
          isFromSelf,
          notImportableMessage,
          existingEvent,
          selected,
          label,
          comments,
          externalAssetLinks,
          requestPriceFetch: 0,
          fetchingPrice: false,
          fetchingPriceError: '',
          assetPriceGBP: '', // string
          valueGBP: '' // string
        }
      })
      // show transactions
      this.addTransactionsToForm(transactions)
    },
    addTransactionsToForm (newTransactions) {
      var existingTransactions = this.transactions
      newTransactions = newTransactions.filter(newT => existingTransactions.findIndex(existingT => existingT.id === newT.id) === -1)
      existingTransactions.push(...newTransactions)
    },
    lookUpAllPrices () {
      this.transactions.filter(t => !t.fetchingPrice && t.isImportable && t.selected && t.assetPriceGBP === '')
        .forEach(transaction => {
          transaction.fetchingPrice = true
          transaction.requestPriceFetch++
        })
    },
    onPriceLookupError (transaction, error) {
      transaction.fetchingPrice = false
      transaction.fetchingPriceError = error
    },
    onPriceLookedUp (transaction) {
      transaction.fetchingPrice = false
      transaction.fetchingPriceError = ''
      if (!transaction.assetPriceGBP) { return }
      var amountNum = u.newBigNumberForAsset(transaction.amount, this.asset.id)
      var priceNum = u.newBigNumberForFiat(transaction.assetPriceGBP)
      transaction.valueGBP = u.roundFiat(amountNum.times(priceNum))
    },
    submit () {
      this.submitError = null
      // Transform form data into mining events data model
      var pool = this.poolId
      var locationId = this.locationId
      if (!pool || !locationId) {
        this.submitError = 'Must specify pool and location'
        return
      }
      var events = this.transactions.filter(t => t.isImportable && t.selected)
        .map(t => {
          return {
            pool,
            date: t.date,
            label: t.label,
            comments: t.comments,
            locations: [{
              id: locationId,
              amount: t.amount,
              valueGBP: t.valueGBP
            }],
            externalAssetLinks: t.externalAssetLinks
          }
        })

      // console.log('SUBMITTING events', events)

      // Check all events are valid
      var validEvents = events.every(t => t.date && t.label && t.locations && t.locations.length && t.locations.every(l => l.id && l.amount && l.valueGBP))
      if (!validEvents) {
        this.submitError = 'Please fill in details for every event'
        return
      }

      this.$emit('save', events)
    }
  }
}
</script>
