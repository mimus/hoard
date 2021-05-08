<template>
  <base-form @submit="submit">
    <income-source-select
      class="mr-12"
      v-model="model.source"
      label="Income Source"
      :required="true"
    />

    <asset-select
      class="mr-12"
      v-model="model.asset"
      label="New Asset Gained"
      :required="true"
    />

    <v-layout align-center>
      <v-text-field
        class="mr-12"
        v-model="form.transactionId"
        label="Transaction ID (optional)"
        persistent-hint
      ></v-text-field>
      <external-asset-link
        v-if="form.transactionId"
        :asset="model.asset"
        type="transaction"
        :item="form.transactionId"
        with-short-label
      />
      <external-transaction-fetcher
        v-if="form.transactionId"
        :asset="model.asset"
        :transaction-id="form.transactionId"
        v-model="form.fetchedTransaction"
        @input="onTransactionFetched"
        @error="form.fetchedTransactionError = $event"
      ></external-transaction-fetcher>
    </v-layout>

    <v-alert
      :value="!!form.fetchedTransactionError"
      type="error"
    >
      {{ form.fetchedTransactionError }}
    </v-alert>

    <date-time-picker v-model="model.date" />

    <v-layout align-center>
      <v-flex xs4 class="pr-12">
        <asset-select
          v-model="model.originalAsset"
          label="Original Asset (if any)"
          :clearable="true"
        />
      </v-flex>
      <v-flex xs4 class="pr-12">
        <v-layout align-center>
          <location-select
            v-model="model.originalLocation"
            label="Original Location (if any)"
            :asset="model.originalAsset"
            :requireAsset="true"
          />
          <external-location-link
            v-if="model.originalLocation"
            :id="model.originalLocation"
          />
        </v-layout>
      </v-flex>
      <div v-if="originalAssetAmount">
        Amount at date: {{ originalAssetAmount | formatAssetValue(model.originalAsset) }} {{ originalAssetSymbol }}
        <v-btn
          small
          class="ml-2"
          @click="model.amount = originalAssetAmount.toString()"
        >
          Copy <v-icon class="ml-1">arrow_downward</v-icon>
        </v-btn>
      </div>
    </v-layout>

    <v-layout>
      <v-flex xs4 class="pr-12">
        <v-layout align-center>
          <location-select
            v-model="model.location"
            label="Add to Location"
            :asset="model.asset"
            :requireAsset="true"
            :required="true"
          />
          <external-location-link
            v-if="model.location"
            :id="model.location"
          />
        </v-layout>
      </v-flex>
      <v-flex xs4 class="pr-12">
        <v-text-field
          class="mr-12"
          v-model="model.amount"
          label="Amount"
          :rules="[required]"
        ></v-text-field>
      </v-flex>
    </v-layout>

    <v-layout align-center>
      <div class="pr-0">
        <price-lookup
          v-model="form.assetPriceGBP"
          :asset="asset"
          :date="model.date"
          :textToAnnotate="model.comments"
          @annotatedText="model.comments = $event"
        ></price-lookup>
      </div>
      <v-flex xs4 class="pr-0">
        <v-text-field
          v-model="form.assetPriceGBP"
          :label="`Asset Price (GBP for 1 ${assetSymbol})`"
          class="mr-12"
        ></v-text-field>
      </v-flex>
      <div xs3 class="pr-0">
        <v-btn
          text
          class="mr-2"
          @click="model.assetValueGBP = calculatedValue"
        >
          {{ calculatedValue | formatFiat }}
          <v-icon>chevron_right</v-icon>
        </v-btn>
      </div>
      <v-flex xs4>
        <v-text-field
          v-model="model.assetValueGBP"
          label="Total GBP Cost/Value (0 if given for free)"
          :rules="[required]"
        ></v-text-field>
      </v-flex>
    </v-layout>

    <v-card class="mb-6">
      <v-layout class="pa-4 grey lighten-4">
        <v-flex class="body-2">
          Fee(s)
        </v-flex>
      </v-layout>

      <location-items-list
        :items="model.fees"
        include-asset-selection
        @add="addLocation('fees', $event)"
        @remove="removeLocation('fees', $event)"
      >
        <template v-slot="{ item, index }">
          <v-card-text class="pb-0">
            <v-layout align-center class="mb-2">
              <div class="subheading mr-12">
                {{ item.label }}
              </div>
              <div class="grey--text">
                {{ item.subtitle }}
              </div>
              <external-location-link
                :id="item.id"
                color="grey"
              />
            </v-layout>
            <v-layout align-center class="mr-6">
              <v-flex class="pr-12">
                <v-text-field
                  v-model="item.amount"
                  :label="`Fee Amount (${item.assetObj.symbol})`"
                  :rules="[required]"
                  class="mr-12"
                ></v-text-field>
              </v-flex>
              <div xs3 class="pr-0">
                <price-lookup
                  v-model="item.assetPriceGBP"
                  :asset="item.assetObj"
                  :date="model.date"
                  :textToAnnotate="item.comments"
                  @annotatedText="item.comments = $event"
                ></price-lookup>
              </div>
              <v-flex class="pr-12">
                <v-text-field
                  v-model="item.assetPriceGBP"
                  :label="`Asset Price (GBP for 1 ${item.assetObj.symbol})`"
                  class="mr-12"
                ></v-text-field>
              </v-flex>
              <div xs3 class="pr-0">
                <v-btn
                  text
                  @click="item.valueGBP = calculatedFeeCost(item)"
                >
                  {{ calculatedFeeCost(item) | formatFiat }}
                  <v-icon>chevron_right</v-icon>
                </v-btn>
              </div>
              <v-flex class="pr-12">
                <v-text-field
                  v-model="item.valueGBP"
                  label="Fee Cost in GBP"
                  :rules="[required]"
                ></v-text-field>
              </v-flex>
            </v-layout>
            <v-flex>
              <v-text-field
                v-model="item.comments"
                label="Comments"
                color="green lighten-1"
                class="input-comment"
              ></v-text-field>
            </v-flex>
          </v-card-text>
        </template>
      </location-items-list>
    </v-card>

    <v-text-field
      v-model="model.label"
      label="Label"
      :rules="[required]"
    ></v-text-field>

    <v-textarea
      v-model="model.comments"
      label="Comments"
      rows="2"
    ></v-textarea>
  </base-form>
</template>

<script>

import u from '../utils'

export default {
  props: {
    sourceId: {
      type: [String, Number],
      default: null
    },
    baseEventId: {
      type: [String, Number],
      default: null
    }
  },
  data: function () {
    let sourceId = null
    let originalAsset = null
    let originalLocation = null
    let asset = null
    let location = null
    let feeLocations = null
    let label = null
    if (this.baseEventId) {
      const findLocationIdFromLinked = (linked) => {
        const locationLedgerEntryId = linked?.find(({ type }) => type === 'locationLedgerEntry')?.id
        if (locationLedgerEntryId) {
          const locationLedgerEntry = this.$store.getters.locationLedgerEntry(locationLedgerEntryId)
          if (locationLedgerEntry) {
            return locationLedgerEntry.location
          }
        }
        return null
      }

      const baseEvent = this.$store.getters.incomeEvent(this.baseEventId)
      if (baseEvent) {
        sourceId = baseEvent.source
        label = baseEvent.label
        asset = baseEvent.asset
        location = findLocationIdFromLinked(baseEvent.linked)
        originalLocation = baseEvent.originalLinked?.find(({ type }) => type === 'location')?.id
        originalAsset = baseEvent.originalLinked?.find(({ type }) => type === 'asset')?.id

        feeLocations = baseEvent.fees?.map(
          ({ asset, linked }) => ({
            locationId: findLocationIdFromLinked(linked),
            assetId: asset
          })
        ).filter(
          ({ locationId }) => !!locationId
        ).map(
          ({ locationId, assetId }) => this.newLocationModel({
            location: this.$store.getters.location(locationId),
            asset: this.$store.getters.asset(assetId)
          })
        )
      }
    } else if (this.sourceId) {
      const source = this.$store.getters.incomeSource(this.sourceId)
      if (source) {
        sourceId = source.id // Use this to make sure we use the numerical source ID, not the string from route
        originalAsset = source.originalAsset
        originalLocation = source.originalLocation
        asset = source.incomeAsset
        location = source.incomeLocation
        label = source.defaultLabel
      }
    }
    return {
      required: (value) => !!value || 'Required',
      form: {
        transactionId: '',
        fetchedTransactionError: '',
        assetPriceGBP: ''
      },
      model: {
        date: null,
        source: sourceId,
        originalAsset: originalAsset || '',
        originalLocation: originalLocation || '',
        asset: asset || '',
        amount: '',
        location: location || '',
        assetValueGBP: '',
        fees: feeLocations || [],
        label: label || '',
        comments: ''
      }
    }
  },
  computed: {
    originalAssetAmount () {
      var model = this.model
      if (model.date && model.originalLocation) {
        return this.$store.getters.ledgerBalanceForLocation(model.originalLocation, model.date)
      }
      return false
    },
    originalAssetSymbol () {
      var asset = this.$store.getters.asset(this.model.originalAsset)
      return (asset && asset.symbol) || ''
    },
    asset () {
      return this.$store.getters.asset(this.model.asset)
    },
    assetSymbol () {
      return (this.asset && this.asset.symbol) || ''
    },
    calculatedValue () {
      var value = 0
      if (this.form.assetPriceGBP && this.model.amount && this.model.asset) {
        value = u.newBigNumberForAsset(this.model.amount, this.model.asset).times(this.form.assetPriceGBP)
      }
      return u.roundFiat(value, true)
    },
    modelToSave () {
      var copy = {
        externalAssetLinks: [],
        ...this.model
      }
      if (this.form.transactionId) {
        copy.externalAssetLinks.push({
          asset: this.model.asset,
          type: 'transaction',
          item: this.form.transactionId
        })
      }
      return copy
    }
  },
  methods: {
    addLocation (type, { asset, location }) {
      var valueGBP = '0'
      this.model[type].push(this.newLocationModel({ location, asset, valueGBP }))
    },
    newLocationModel ({ location, asset, valueGBP }) {
      return {
        id: location.id,
        label: location.label,
        asset: location.asset,
        assetObj: asset,
        assetPriceGBP: '',
        valueGBP: valueGBP || '',
        subtitle: location.address,
        amount: '0',
        comments: ''
      }
    },
    removeLocation (type, locationId) {
      var index = this.model[type].findIndex(x => x.id === locationId)
      if (index === -1) { return }
      this.model[type].splice(index, 1)
    },
    calculatedFeeCost (feeObj) {
      var cost = 0
      if (feeObj.assetPriceGBP && feeObj.amount && feeObj.assetObj) {
        cost = u.newBigNumberForAsset(feeObj.amount, feeObj.assetObj.id).times(feeObj.assetPriceGBP)
      }
      return u.roundFiat(cost, true)
    },
    onTransactionFetched () {
      var transaction = this.form.fetchedTransaction
      if (!transaction) {
        return
      }
      if (transaction.date) {
        this.model.date = transaction.date
      }
      if (transaction.incomeOriginal) {
        var original = transaction.incomeOriginal
        this.model.originalAsset = original.asset
        var location = this.$store.getters.locationForAddress(original.asset, original.address)
        if (location) {
          this.model.originalLocation = location.id
        }
      }
      if (transaction.incomeLabel && !this.model.label) {
        this.model.label = transaction.incomeLabel
      }
      if (transaction.outputs) {
        transaction.outputs.forEach(output => {
          if (output.isToSingleAddress && output.value) {
            var location = this.$store.getters.locationForAddress(this.model.asset, output.addresses[0])
            if (location) {
              this.model.location = location.id
              this.model.amount = output.value
            }
          }
        })
      }
    },
    submit () {
      if (this.model.asset && this.model.location && this.model.date) {
        this.$emit('save', this.modelToSave)
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
