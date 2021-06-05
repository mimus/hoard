<template>
  <base-form @submit="submit">
    <v-layout align-center>
      <v-text-field
        class="mr-6"
        v-model="form.transactionId"
        label="Transaction ID (optional)"
        persistent-hint
      ></v-text-field>
      <v-select
        class="mr-6"
        style="max-width: 250px;"
        v-model="form.transactionAsset"
        :items="form.transactionSources"
      />
      <external-asset-link
        v-if="form.transactionId"
        :asset="form.transactionAsset"
        type="transaction"
        :item="form.transactionId"
        with-short-label
      />
      <external-transaction-fetcher
        v-if="form.transactionId && form.transactionAsset"
        :asset="form.transactionAsset"
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

    <v-card class="mb-6">
      <v-layout class="pa-4 grey lighten-4">
        <v-flex class="body-2">
          Bought Assets - Location(s)
        </v-flex>
        <div>
          {{ totalBoughtAssets }}
          <span v-if="valueBoughtAssets.gt(0)">
            =
            {{ valueBoughtAssets | formatFiat }}
            <v-icon
              v-if="!valueBoughtAssets.eq(valueSoldAssets)"
              color="red"
              title="Value of bought assets should match sold assets"
            >
              warning
            </v-icon>
            <v-icon
              v-if="valueBoughtAssets.eq(valueSoldAssets)"
              color="green"
            >
              done
            </v-icon>
          </span>
        </div>
      </v-layout>

      <location-items-list
        :items="model.acquired"
        include-asset-selection
        @add="addLocation('acquired', $event)"
        @remove="removeLocation('acquired', $event)"
      >
        <template v-slot="{ item, index }">
          <v-card-text class="pb-0 my-2">
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

            <v-layout align-center>
              <v-flex>
                <v-flex class="mx-12">
                  <v-flex
                    v-if="acquiredBalances[index]"
                    class="blue--text"
                  >
                    Balance before:
                    {{ acquiredBalances[index] | formatAssetValue(item.asset) }}
                  </v-flex>
                  <v-flex class="mt-2 mb-6">
                    <v-layout align-center>
                      <span>Bought:</span>
                      <v-text-field
                        v-model="item.amount"
                        hint="Full amount, before any fees deducted"
                        persistent-hint
                        :rules="[required]"
                        class="input-amount mx-6"
                        >
                      </v-text-field>
                    </v-layout>
                  </v-flex>
                  <v-flex
                    v-if="acquiredBalances[index]"
                    class="blue--text"
                  >
                    Balance after:
                    {{ acquiredBalances[index].plus(item.amount) | formatAssetValue(item.asset) }}
                  </v-flex>
                </v-flex>
              </v-flex>
              <v-flex>
                <v-flex class="mx-12">
                  <v-flex>
                    <v-layout align-center>
                      <price-lookup
                        v-model="item.assetPriceGBP"
                        :asset="item.assetObj"
                        :date="model.date"
                        :textToAnnotate="item.comments"
                        @annotatedText="item.comments = $event"
                      ></price-lookup>
                      <v-flex>
                        <v-text-field
                          v-model="item.assetPriceGBP"
                          :label="`Price (GBP for 1 ${assetSymbol(item.asset)})`"
                          hint="Market rate"
                          persistent-hint
                          :rules="[required]"
                          class="mr-12"
                        ></v-text-field>
                      </v-flex>
                    </v-layout>
                  </v-flex>
                  <v-flex class="text-center mt-2">
                    <v-btn
                      text
                      color="blue"
                      @click="item.valueGBP = calculatedValue(item)"
                    >
                      {{ calculatedValue(item) | formatFiat }}
                      <v-icon>expand_more</v-icon>
                    </v-btn>
                  </v-flex>
                  <v-flex>
                    <v-text-field
                      v-model="item.valueGBP"
                      label="Value in GBP"
                      hint="Market value of the acquired asset"
                      persistent-hint
                      :rules="[required]"
                    ></v-text-field>
                  </v-flex>
                </v-flex>
              </v-flex>
            </v-layout>

            <v-layout>
              <v-flex>
                <v-text-field
                  v-model="item.comments"
                  hint="Comments"
                  persistent-hint
                  color="green lighten-1"
                  class="input-comment mb-2"
                ></v-text-field>
              </v-flex>
            </v-layout>

          </v-card-text>
        </template>
      </location-items-list>
    </v-card>

    <v-card class="mb-6">
      <v-layout class="pa-4 grey lighten-4">
        <v-flex class="body-2">
          Sold Assets - Location(s)
        </v-flex>
        <div>
          {{ totalSoldAssets }}
          <span v-if="valueSoldAssets.gt(0)">
            =
            {{ valueSoldAssets | formatFiat }}
            <v-icon
              v-if="!valueBoughtAssets.eq(valueSoldAssets)"
              color="red"
              title="Value of bought assets should match sold assets"
            >
              warning
            </v-icon>
            <v-icon
              v-if="valueBoughtAssets.eq(valueSoldAssets)"
              color="green"
            >
              done
            </v-icon>
          </span>
        </div>
      </v-layout>

      <location-items-list
        :items="model.disposed"
        include-asset-selection
        @add="addLocation('disposed', $event)"
        @remove="removeLocation('disposed', $event)"
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

            <v-layout align-center>
              <v-flex>
                <v-flex class="mx-12">
                  <v-flex
                    v-if="disposedBalances[index]"
                    class="blue--text"
                  >
                    Balance before:
                    <v-btn
                      text
                      color="blue"
                      @click="item.amount = disposedBalances[index].toString()"
                    >
                      {{ disposedBalances[index] | formatAssetValue(item.asset) }}
                      <v-icon>expand_more</v-icon>
                    </v-btn>
                  </v-flex>

                  <v-flex class="mt-2 mb-6">
                    <v-layout align-center>
                      <span>Sold:</span>
                      <v-text-field
                        v-model="item.amount"
                        hint="Amount traded, not including any fees"
                        persistent-hint
                        :rules="[required]"
                        :append-icon="disposedBalances[index] && disposedBalances[index].lt(item.amount) ? 'warning': ''"
                        class="input-amount mx-6"
                      ></v-text-field>
                    </v-layout>
                  </v-flex>

                  <v-flex
                    v-if="disposedBalances[index]"
                    class="blue--text"
                  >
                    Balance after:
                    {{ disposedBalances[index].minus(item.amount) | formatAssetValue(item.asset) }}
                  </v-flex>
                </v-flex>
              </v-flex>

              <v-flex>
                <v-flex class="mx-12">
                  <v-flex>
                    <v-layout align-center>
                      <price-lookup
                        v-model="item.assetPriceGBP"
                        :asset="item.assetObj"
                        :date="model.date"
                        :textToAnnotate="item.comments"
                        @annotatedText="item.comments = $event"
                      ></price-lookup>
                      <v-flex>
                        <v-text-field
                          v-model="item.assetPriceGBP"
                          :label="`Price (GBP for 1 ${assetSymbol(item.asset)})`"
                          hint="Market rate"
                          persistent-hint
                          class="mr-12"
                        ></v-text-field>
                      </v-flex>
                    </v-layout>
                  </v-flex>
                  <v-flex class="text-center mt-2">
                    <v-btn
                      text
                      color="blue"
                      @click="item.valueGBP = calculatedValue(item)"
                    >
                      {{ calculatedValue(item) | formatFiat }}
                      <v-icon>expand_more</v-icon>
                    </v-btn>
                  </v-flex>
                  <v-flex>
                    <v-text-field
                      v-model="item.valueGBP"
                      label="Value in GBP"
                      hint="Use value of the asset(s) acquired in the trade, before fees"
                      persistent-hint
                      :rules="[required]"
                    ></v-text-field>
                  </v-flex>
                </v-flex>
              </v-flex>
            </v-layout>

            <v-layout>
              <v-flex>
                <v-text-field
                  v-model="item.comments"
                  hint="Comments"
                  persistent-hint
                  color="green lighten-1"
                  class="input-comment mb-2"
                ></v-text-field>
              </v-flex>
            </v-layout>

          </v-card-text>
        </template>
      </location-items-list>
    </v-card>

    <v-card class="mb-6">
      <v-layout class="pa-4 grey lighten-4">
        <v-flex class="body-2">
          Fee(s)
        </v-flex>
        <div>
          {{ totalFees }}
        </div>
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

            <v-layout>
              <v-flex class="mr-6">
                <v-text-field
                  v-model="item.amount"
                  label="Fee Amount"
                  :rules="[required]"
                ></v-text-field>
              </v-flex>
              <v-flex>
                <v-text-field
                  v-model="item.comments"
                  label="Comments"
                  color="green lighten-1"
                  class="input-comment"
                ></v-text-field>
              </v-flex>
            </v-layout>
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
      color="green lighten-1"
      class="input-comment"
    ></v-textarea>

    <div
      v-if="!valueBoughtAssets.eq(valueSoldAssets)"
      class="red--text text--darken-2 mt-2 mb-4"
    >
      <v-icon color="red">
        warning
      </v-icon>
      Value of bought assets should match sold assets
    </div>

  </base-form>
</template>

<script>

import u from '../utils'

export default {
  props: {
    baseEventId: {
      type: [String, Number],
      default: null
    }
  },
  data: function () {
    let baseEvent = null
    let disposedLocations = null
    let acquiredLocations = null
    let feeLocations = null
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

      baseEvent = this.$store.getters.tradeEvent(this.baseEventId)
      if (baseEvent) {
        [disposedLocations, acquiredLocations, feeLocations] = [baseEvent.disposed, baseEvent.acquired, baseEvent.fees].map(
          locations => {
            return locations?.map(
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
        )
      }
    }

    return {
      required: (value) => !!value || 'Required',
      form: {
        transactionSources: [
          { value: '', text: 'Choose a source...' },
          { value: 'MATIC', text: 'Polygon Network' }
        ],
        transactionAsset: 'MATIC',
        transactionId: '',
        fetchedTransaction: null,
        fetchedTransactionError: ''
      },
      model: {
        date: null,
        label: baseEvent?.label || '',
        comments: '',
        disposed: disposedLocations || [],
        acquired: acquiredLocations || [],
        fees: feeLocations || []
      }
    }
  },
  computed: {
    totalSoldAssets () {
      return this._total('disposed')
    },
    totalFees () {
      return this._total('fees')
    },
    totalBoughtAssets () {
      return this._total('acquired')
    },
    valueBoughtAssets () {
      return this._valueTotal('acquired')
    },
    valueSoldAssets () {
      return this._valueTotal('disposed')
    },
    disposedBalances () {
      return this._balances('disposed')
    },
    acquiredBalances () {
      return this._balances('acquired')
    },
    modelToSave () {
      var copy = {
        externalAssetLinks: [],
        ...this.model
      }
      if (this.form.transactionId) {
        copy.externalAssetLinks.push({
          asset: this.form.transactionAsset,
          type: 'transaction',
          item: this.form.transactionId
        })
      }
      return copy
    }
  },
  methods: {
    assetSymbol (assetId) {
      var asset = this.$store.getters.asset(assetId) || null
      return (asset && asset.symbol) || ''
    },
    _total (type) {
      var totals = this.model[type].reduce((memo, x) => {
        if (!memo.hasOwnProperty(x.asset)) { memo[x.asset] = u.newBigNumberForAsset(0, x.asset) }
        memo[x.asset] = memo[x.asset].plus(x.amount)
        return memo
      }, {})
      return Object.entries(totals).map(([asset, total]) => `${u.formatAssetValue(total, asset)} ${this.assetSymbol(asset)}`).join(', ')
    },
    _valueTotal (type) {
      return this.model[type].reduce((memo, x) => memo.plus(x.valueGBP), u.newBigNumberForFiat(0))
    },
    _balances (type) {
      var balances = []
      var model = this.model
      if (model.date) {
        balances = model[type].map(location => this.$store.getters.ledgerBalanceForLocation(location.id, model.date))
      }
      return balances
    },
    addLocation (type, { asset, location }) {
      var valueGBP = '0'
      // if this is the first sold asset, auto-fill the valueGBP with the total acquired value
      if (type === 'disposed' && !this.model.disposed.length && this.model.acquired.length) {
        valueGBP = this.valueBoughtAssets.toString()
      }
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
    calculatedValue (item) {
      var cost = 0
      if (item.assetPriceGBP && item.amount) {
        cost = u.newBigNumberForFiat(item.assetPriceGBP).times(item.amount)
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
      this.model.disposed = []
      if (transaction.inputs) {
        transaction.inputs.forEach(input => {
          if (input.value && input.address && input.addressAsset) {
            // Inputs must specify both asset and location
            const assetId = input.addressAsset
            const asset = this.$store.getters.asset(assetId)
            const location = this.$store.getters.locationForAddress(assetId, input.address)
            if (asset && location) {
              const locationModel = this.newLocationModel({ location, asset })
              locationModel.amount = input.value
              this.model.disposed.push(locationModel)
            }
          }
        })
      }
      this.model.acquired = []
      if (transaction.outputs) {
        transaction.outputs.forEach(output => {
          if (output.isToSingleAddress && output.value) {
            // Outputs must specify both asset and location
            if (output.addresses[0] && output.addressAssets?.[0]) {
              const assetId = output.addressAssets[0]
              const asset = this.$store.getters.asset(assetId)
              const location = this.$store.getters.locationForAddress(assetId, output.addresses[0])
              if (asset && location) {
                const locationModel = this.newLocationModel({ location, asset })
                locationModel.amount = output.value
                this.model.acquired.push(locationModel)
              }
            }
          }
        })
      }

      if (transaction.fee && transaction.feeAsset && transaction.feeLocation) {
        const feeLocation = this.$store.getters.locationForAddress(transaction.feeAsset, transaction.feeLocation)
        if (feeLocation) {
          const feeAssetObj = this.$store.getters.asset(transaction.feeAsset)
          if (feeAssetObj) {
            const feeLocationModel = this.newLocationModel({ asset: feeAssetObj, location: feeLocation })
            feeLocationModel.amount = transaction.fee
            this.model.fees = [feeLocationModel]
          }
        }
      }
    },
    submit () {
      if (this.model.disposed.length && this.model.acquired.length && this.model.date) {
        this.$emit('save', this.modelToSave)
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.input-amount {
  width: 170px;
}
.input-comment >>> input,
.input-comment >>> textarea {
  color: #66BB6A;
}
</style>
