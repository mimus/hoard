<template>
  <base-form @submit="submit">
    <asset-select
      v-model="defaultModel.originalAsset"
      label="Original Asset (if any)"
      clearable
      :singleLine="false"
    />

    <location-select
      v-model="defaultModel.originalLocation"
      label="Original Location (if any)"
      :asset="defaultModel.originalAsset"
      requireAsset
      :singleLine="false"
    />

    <asset-select
      v-model="defaultModel.asset"
      label="Income Asset"
      :singleLine="false"
    />

    <location-select
      v-model="defaultModel.location"
      label="Income Location"
      :asset="defaultModel.asset"
      requireAsset
      :singleLine="false"
    />
    <v-text-field
      v-model="defaultModel.label"
      label="Label for income events"
    ></v-text-field>

    <v-alert
      :value="fetched.incomeEvents && fetched.incomeEvents.length === 0"
      type="info"
    >
      No events found. Please check that the correct income asset is selected above.
    </v-alert>
    <div
      v-if="incomeEvents.length"
      class="mb-4"
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
      class="mb-4"
    >
      {{ pricesFetchStatus.error }}
    </v-alert>

    <v-expansion-panels
      multiple
      accordion
      :value="expandedIncomeEvents"
    >
      <v-expansion-panel
        v-for="incomeEvent in incomeEvents"
        :key="incomeEvent.id"
      >
        <v-expansion-panel-header>
          <v-layout align-center>
            <div>
              {{ incomeEvent.date | formatDateTime }}
            </div>
            <div
              v-if="incomeEvent.amount"
              class="mx-4"
            >
              {{ incomeEvent.amount | formatAssetValue(asset.id) }}
              {{ asset.symbol}}
            </div>
            <v-flex v-if="incomeEvent.isImportable">
              <v-checkbox
                v-model="incomeEvent.selected"
                label="Import this"
                hide-details
                class="mt-0"
              ></v-checkbox>
            </v-flex>
            <div
              v-else
              class="ml-2"
            >
              <v-icon
                v-if="incomeEvent.existingEvent"
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
            </div>
          </v-layout>
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          <div
            v-if="incomeEvent.isImportable"
            :key="`${incomeEvent.id}-isImportable`"
          >
            <v-layout>
              <v-flex class="mx-4">
                  <v-text-field
                    v-model="incomeEvent.amount"
                    label="Amount"
                    readonly
                  ></v-text-field>
              </v-flex>
              <v-flex class="mx-4">
                <v-layout align-center>
                  <price-lookup
                    v-model="incomeEvent.assetPriceGBP"
                    :asset="asset"
                    :date="incomeEvent.date"
                    :requestFetch="incomeEvent.requestPriceFetch"
                    :textToAnnotate="incomeEvent.comments"
                    @input="onPriceLookedUp(incomeEvent)"
                    @error="onPriceLookupError(incomeEvent, $event)"
                    @annotatedText="incomeEvent.comments = $event"
                  />
                  <v-text-field
                    v-model="incomeEvent.assetPriceGBP"
                    :label="`Price of 1 ${asset.label} in GBP`"
                  ></v-text-field>
                </v-layout>
              </v-flex>
              <v-flex class="mx-4">
                <v-text-field
                  v-model="incomeEvent.valueGBP"
                  label="Received value in GBP"
                ></v-text-field>
              </v-flex>
            </v-layout>
            <v-layout >
              <v-flex class="mx-4">
                <v-text-field
                  v-model="incomeEvent.label"
                  label="Label"
                ></v-text-field>
              </v-flex>
              <v-flex class="mx-4">
                <v-text-field
                  v-model="incomeEvent.comments"
                  label="Comments"
                ></v-text-field>
              </v-flex>
            </v-layout>
            <v-layout>
              <div
                v-if="incomeEvent.externalAssetLinks"
                class="mx-4"
              >
                <div
                  v-for="link in incomeEvent.externalAssetLinks"
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
            :key="`${incomeEvent.id}-isNotImportable`"
          >
            <div v-if="incomeEvent.existingEvent">
              Existing event:
              <associated-link
                :link="{id: incomeEvent.existingEvent.id, type: 'incomeEvent'}"
              />
            </div>
          </div>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>

    <div
      v-if="asset"
      class="mt-4"
    >
      <external-income-events-fetcher
        v-if="importer && importer.fetchIncomeEvents"
        v-model="fetched.incomeEvents"
        :asset="assetId"
        :importerId="importerId"
        @input="onIncomeEventsFetched"
        @error="fetched.error = $event"
      />
      <income-events-loader
        v-else-if="importer && importer.loadIncomeEvents"
        v-model="fetched.incomeEvents"
        :asset="assetId"
        :importerId="importerId"
        @input="onIncomeEventsFetched"
        @error="fetched.error = $event"
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

    <div class="mb-4"></div>

  </base-form>
</template>

<script>
import moment from 'moment'
import u from '../utils'

export default {
  props: {
    sourceId: [Number, String],
    importerId: String
  },
  data: function () {
    const defaultModel = {
      originalAsset: null,
      originalLocation: null,
      asset: null,
      location: null,
      label: null
    }
    if (this.sourceId) {
      const source = this.$store.getters.incomeSource(this.sourceId)
      defaultModel.originalAsset = source.originalAsset
      defaultModel.originalLocation = source.originalLocation
      defaultModel.asset = source.incomeAsset
      defaultModel.location = source.incomeLocation
      defaultModel.label = source.defaultLabel
    }
    return {
      submitError: null,
      required: (value) => !!value || 'Required',
      defaultModel,
      fetched: {
        incomeEvents: null,
        error: null
      },
      incomeEvents: []
    }
  },
  computed: {
    source () {
      return this.sourceId ? this.$store.getters.incomeSource(this.sourceId) : null
    },
    importer () {
      return this.$genericServices.find(x => x.id === this.importerId)
    },
    assetId () {
      return this.defaultModel?.asset
    },
    asset () {
      return this.assetId ? this.$store.getters.asset(this.assetId) : null
    },
    assetLocations () {
      return this.$store.getters.locationsForAsset(this.asset.id)
    },
    location () {
      return this.defaultModel.location && this.$store.getters.location(this.defaultModel.location)
    },
    address () {
      return this.location && this.location.address
    },
    expandedIncomeEvents () {
      // we want to expand the selected incomeEvents: return an array containing their row indices
      var indices = []
      for (var i = 0; i < this.incomeEvents.length; i++) {
        if (this.incomeEvents[i].selected) {
          indices.push(i)
        }
      }
      return indices
    },
    pricesFetchStatus () {
      var incomeEventWithError = this.incomeEvents.find(t => t.fetchingPriceError)
      var error = incomeEventWithError && (incomeEventWithError.fetchingPriceError || 'Error fetching price')
      return {
        loading: this.incomeEvents.some(t => t.fetchingPrice),
        error: error
      }
    }
  },
  watch: {
    sourceId () {
      this.resetIncomeEvents()
    },
    'defaultModel.asset' () {
      this.resetIncomeEvents()
    },
    'defaultModel.location' () {
      this.resetIncomeEvents()
      this.submitError = null
    },
    importerId () {
      this.resetIncomeEvents()
    }
  },
  methods: {
    resetIncomeEvents () {
      this.incomeEvents = []
    },
    onIncomeEventsFetched () {
      const fetchedIncomeEvents = this.fetched.incomeEvents
      if (!fetchedIncomeEvents || !fetchedIncomeEvents.length) {
        return
      }

      const defaultModel = this.defaultModel
      const incomeEvents = fetchedIncomeEvents.map(x => {
        const date = x.date
        const amount = x.amount

        let isImportable = true

        // Check for existing events
        let existingEvent = null
        if (isImportable) {
          existingEvent = this.$store.getters.firstMatchingIncomeEvent({
            sourceId: this.sourceId,
            dateStart: moment(date).subtract(1.5, 'hours'),
            dateEnd: moment(date).add(1.5, 'hours'),
            amount,
            assetId: defaultModel.asset,
            locationId: defaultModel.location
          })
          if (existingEvent) {
            isImportable = false
          }
        }

        // if there is an associated transaction, include a link to it
        const externalAssetLinks = []
        if (x.transactionId) {
          externalAssetLinks.push({
            asset: this.defaultModel.asset,
            type: 'transaction',
            item: x.transactionId
          })
        }

        // Prepare for display
        const selected = isImportable
        const incomeEventId = x.incomeEventId
        const fees = x.fees || []
        const label = isImportable ? this.defaultModel.label : ''
        const comments = ''

        return {
          id: incomeEventId,
          date,
          amount, // string
          isImportable,
          existingEvent,
          selected,
          label,
          comments,
          requestPriceFetch: 0,
          fetchingPrice: false,
          fetchingPriceError: '',
          assetPriceGBP: '', // string
          valueGBP: '', // string,
          fees,
          externalAssetLinks
        }
      })
      // show incomeEvents
      this.addIncomeEventsToForm(incomeEvents)
    },
    addIncomeEventsToForm (newIncomeEvents) {
      const existingIncomeEvents = this.incomeEvents
      newIncomeEvents = newIncomeEvents.filter(newEvent => existingIncomeEvents.findIndex(existingEvent => existingEvent.id === newEvent.id) === -1)
      existingIncomeEvents.push(...newIncomeEvents)
    },
    lookUpAllPrices () {
      this.incomeEvents.filter(t => !t.fetchingPrice && t.isImportable && t.selected && t.assetPriceGBP === '')
        .forEach(incomeEvent => {
          incomeEvent.fetchingPrice = true
          incomeEvent.requestPriceFetch++
        })
    },
    onPriceLookupError (incomeEvent, error) {
      incomeEvent.fetchingPrice = false
      incomeEvent.fetchingPriceError = error
    },
    onPriceLookedUp (incomeEvent) {
      incomeEvent.fetchingPrice = false
      incomeEvent.fetchingPriceError = ''
      if (!incomeEvent.assetPriceGBP) { return }
      var amountNum = u.newBigNumberForAsset(incomeEvent.amount, this.asset.id)
      var priceNum = u.newBigNumberForFiat(incomeEvent.assetPriceGBP)
      incomeEvent.valueGBP = u.roundFiat(amountNum.times(priceNum))
    },
    submit () {
      this.submitError = null
      // Transform form data into income events data model
      const sourceId = this.sourceId
      const assetId = this.defaultModel.asset
      const locationId = this.defaultModel.location
      if (!sourceId || !assetId || !locationId) {
        this.submitError = 'Must specify source, income asset and income location'
        return
      }
      const defaultModel = this.defaultModel
      const events = this.incomeEvents.filter(event => event.isImportable && event.selected)
        .map(event => {
          return {
            date: event.date,
            source: sourceId,
            originalAsset: defaultModel.originalAsset,
            originalLocation: defaultModel.originalLocation,
            asset: assetId,
            location: locationId,
            amount: event.amount,
            assetValueGBP: event.valueGBP,
            fees: event.fees,
            label: event.label,
            comments: event.comments,
            externalAssetLinks: event.externalAssetLinks
          }
        })
        .sort(u.dateComparatorEarliestFirst) // save the events in chronological order just so the IDs make sense

      // console.log('SUBMITTING events', events)

      // Check all events are valid
      const validEvents = events.every(t => t.source && t.date && t.label && t.asset && t.location && t.amount && t.assetValueGBP)
      if (!validEvents) {
        this.submitError = 'Please fill in details for every event'
        return
      }

      this.$emit('save', events)
    }
  }
}
</script>
