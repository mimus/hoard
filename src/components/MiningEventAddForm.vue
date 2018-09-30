<template>
  <base-form @submit="submit">
    <div>
      Mined {{ asset.label }} ({{ asset.symbol }})
    </div>

    <v-layout row align-center>
      <v-text-field
        v-model="form.transactionId"
        label="Transaction ID (optional)"
        persistent-hint
        class="mr-5"
      ></v-text-field>
      <external-asset-link
        v-if="form.transactionId"
        :asset="assetId"
        type="transaction"
        :item="form.transactionId"
        with-short-label
      />
      <external-transaction-fetcher
        v-model="form.fetchedTransaction"
        :asset="assetId"
        :transaction-id="form.transactionId"
        @input="onTransactionFetched"
        @error="form.fetchedTransactionError = $event"
      ></external-transaction-fetcher>
    </v-layout>

    <v-alert
      :value="form.fetchedTransactionError"
      type="error"
      class="mb-3"
    >
      {{ form.fetchedTransactionError }}
    </v-alert>

    <date-time-picker
      v-model="model.date"
    ></date-time-picker>

    <v-layout row align-center>
      <price-lookup
        v-model="form.assetPriceGBP"
        :asset="asset"
        :date="model.date"
        :textToAnnotate="model.comments"
        @annotatedText="model.comments = $event"
      ></price-lookup>
      <v-text-field
        v-model="form.assetPriceGBP"
        :label="`Price (GBP for 1 ${asset.symbol})`"
        hint="Market rate at time of payout"
        persistent-hint
        :rules="[required]"
        required
        class="mr-5"
      ></v-text-field>
    </v-layout>

    <v-card class="my-4">
      <v-toolbar card dense>
        <v-toolbar-title class="body-2">
          Payment(s)
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <div>
          {{ totalLocations | formatAssetValue(assetId) }}
          <span v-if="valueLocationAssets && valueLocationAssets.gt(0)">
            =
            {{ valueLocationAssets | formatFiat }}
            GBP
          </span>
        </div>
      </v-toolbar>

      <location-items-list
        :items="model.locations"
        :asset-id="assetId"
        @add="addLocation('locations', $event.location)"
        @remove="removeLocation('locations', $event)"
      >
        <v-card-text
          slot-scope="{ item, index }"
          class="pb-0 my-2"
        >
          <v-layout align-center class="mb-2">
            <div class="subheading mr-5">
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
            <v-flex xs6>
              <v-layout column class="mx-5">
                <v-flex class="blue--text">
                  Balance before:
                  {{ locationBalances[index] | formatAssetValue(item.asset) }}
                </v-flex>
                <v-flex class="mt-2 mb-4">
                  <v-layout align-center>
                    <span>
                      Received:
                    </span>
                    <v-text-field
                      v-model="item.amount"
                      hint="Actual amount received, after any fees"
                      persistent-hint
                      :rules="[required]"
                      required
                      class="input-amount mx-4"
                    ></v-text-field>
                  </v-layout>
                </v-flex>
                <v-flex class="blue--text">
                  Balance after:
                  {{ locationBalances[index] && locationBalances[index].plus(item.amount) | formatAssetValue(item.asset) }}
                </v-flex>
              </v-layout>
            </v-flex>
            <v-flex xs6>
              <v-layout column class="mx-5">
                <v-flex>

                </v-flex>
                <v-flex class="text-xs-center">
                  <v-btn
                    flat color="blue"
                    @click="item.valueGBP = calculatedValue(item)"
                  >
                    &pound;{{ calculatedValue(item) | formatFiat }}
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
                    required
                  ></v-text-field>
                </v-flex>
              </v-layout>
            </v-flex>
          </v-layout>
        </v-card-text>
      </location-items-list>
    </v-card>

    <v-text-field
      v-model="model.label"
      label="Label"
      :rules="[required]"
      required
    ></v-text-field>

    <v-text-field
      v-model="model.comments"
      color="green lighten-1"
      class="input-comment"
      label="Comments"
      multi-line rows="2"
    ></v-text-field>

  </base-form>
</template>

<script>

import u from '../utils'

export default {
  props: {
    poolId: [Number, String]
  },
  data () {
    return {
      required: (value) => !!value || 'Required',
      form: this.getDefaultForm(),
      model: this.getDefaultModel()
    }
  },
  computed: {
    pool () {
      return this.poolId ? this.$store.getters.miningPool(this.poolId) : null
    },
    asset () {
      var assetId = this.pool && this.pool.asset
      return assetId ? this.$store.getters.asset(assetId) : null
    },
    assetId () {
      return this.asset && this.asset.id
    },
    totalLocations () {
      return this._total('locations', this.assetId)
    },
    valueLocationAssets () {
      return this._valueTotal('locations')
    },
    locationBalances () {
      return this._balances('locations')
    },
    modelToSave () {
      var copy = {
        externalAssetLinks: [],
        pool: this.poolId,
        ...this.model
      }
      var transaction = this.form.fetchedTransaction
      if (transaction && transaction.transactionId) {
        copy.externalAssetLinks.push({
          asset: this.assetId,
          type: 'transaction',
          item: transaction.transactionId
        })
      }
      return copy
    }
  },
  watch: {
    poolId: {
      deep: true,
      immediate: true,
      handler: function (newVal) {
        this.resetForm()
        if (this.asset && this.pool) {
          this.model.label = `Mined ${this.asset.symbol} on ${this.pool.label}`
        }
      }
    }
  },
  methods: {
    getDefaultModel () {
      return {
        date: null,
        label: '',
        comments: '',
        locations: []
      }
    },
    getDefaultForm () {
      return {
        assetPriceGBP: '',
        transactionId: '',
        fetchedTransaction: null,
        fetchedTransactionError: ''
      }
    },
    resetForm () {
      this.model = this.getDefaultModel()
      this.form = this.getDefaultForm()
    },
    _total (type, asset) {
      return this.model[type].reduce((memo, x) => memo.plus(x.amount), u.newBigNumberForAsset(0, asset))
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
    onTransactionFetched () {
      var transaction = this.form.fetchedTransaction
      if (!transaction) {
        return
      }
      if (transaction.date) {
        this.model.date = transaction.date
      }
      if (transaction.outputs) {
        this.removeAllLocations('locations')
        transaction.outputs.forEach(output => {
          if (output.isToSingleAddress && output.value) {
            var location = this.$store.getters.locationForAddress(this.assetId, output.addresses[0])
            if (location) {
              this.addLocation('locations', location, output.value)
            }
          }
        })
      }
    },
    addLocation (type, location, amount) {
      if (this.model[type].find(x => x.id === location.id)) { return }
      this.model[type].push({
        id: location.id,
        label: location.label,
        asset: location.asset,
        valueGBP: '',
        subtitle: location.address,
        amount: amount || '0',
        comments: ''
      })
    },
    removeLocation (type, locationId) {
      var index = this.model[type].findIndex(x => x.id === locationId)
      if (index === -1) { return }
      this.model[type].splice(index, 1)
    },
    removeAllLocations (type) {
      this.model[type].splice(0)
    },
    calculatedValue (item) {
      var cost = 0
      if (this.form.assetPriceGBP && item.amount) {
        cost = u.newBigNumberForFiat(this.form.assetPriceGBP).times(item.amount)
      }
      return u.formatFiat(cost)
    },
    submit () {
      if (this.model.locations.length && this.model.date) {
        this.$emit('save', this.modelToSave)
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.input-comment >>> input,
.input-comment >>> textarea {
  color: #66BB6A;
}
</style>
