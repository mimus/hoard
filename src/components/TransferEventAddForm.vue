<template>
  <base-form @submit="submit">
    <v-layout align-center>
      <v-flex xs4 class="pr-5">
        <asset-select
          v-model="model.asset"
          label="Asset"
          :required="true"
        />
      </v-flex>
    </v-layout>

    <v-layout row align-center>
      <v-text-field
        v-model="transactionId"
        label="Transaction ID (optional)"
        persistent-hint
        class="mr-5"
      ></v-text-field>
      <external-asset-link
        v-if="transactionId"
        :asset="model.asset"
        type="transaction"
        :item="transactionId"
        with-short-label
      />
      <external-transaction-fetcher
        v-model="form.fetchedTransaction"
        :asset="model.asset"
        :transaction-id="transactionId"
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

    <v-text-field
      v-model="model.amount"
      :label="`Amount Transferred ${assetSymbol}`"
      :rules="[required]"
    ></v-text-field>

    <v-card class="mb-4">
      <v-toolbar card dense>
        <v-toolbar-title class="body-2">
          From Location(s)
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <div v-if="model.asset">
          {{ fromTotal | formatAssetValue(model.asset) }} {{ assetSymbol}}
        </div>
      </v-toolbar>

      <location-items-list
        :items="model.from"
        :asset-id="model.asset"
        @add="addLocation('from', $event.location)"
        @remove="removeLocation('from', $event)"
      >
        <v-card-text
          slot-scope="{ item, index }"
          class="mb-2"
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
            <div v-if="fromBalances[index]">
              Balance:
              <v-btn
                flat
                @click="item.amount = fromBalances[index].toString()"
              >
                {{ fromBalances[index] | formatAssetValue(model.asset) }}
                <v-icon>chevron_right</v-icon>
              </v-btn>
            </div>

            Withdraw:
            <v-text-field
              v-model="item.amount"
              label="Amount"
              :rules="[required]"
              solo
              hide-details
              class="input-amount mx-4"
              :append-icon="fromBalances[index] && fromBalances[index].lt(item.amount) ? 'warning': ''"
            ></v-text-field>

            <div
              v-if="fromBalances[index]"
              class="mr-5"
            >
              Balance After:
              {{ fromBalances[index].minus(item.amount) | formatAssetValue(model.asset) }}
            </div>
          </v-layout>
        </v-card-text>
      </location-items-list>
    </v-card>

    <v-card class="mb-4">
      <v-toolbar card dense>
        <v-toolbar-title class="body-2">
          Fee
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <div v-if="feeAsset">
          {{ model.fee.amount | formatAssetValue(feeAsset) }} {{ feeAssetSymbol}}
        </div>
      </v-toolbar>
      <v-card-text>
        <v-layout align-center>
          <v-flex>
            <v-checkbox
              v-model="form.enableFeeLocation"
              label="Take fee from different location"
              hide-details
            ></v-checkbox>
          </v-flex>
        </v-layout>
        <v-layout>
          <v-flex
            v-if="form.enableFeeLocation"
            class="pr-5"
          >
            <asset-select
              v-model="form.customFeeAsset"
              label="Fee Asset"
              :required="false"
            />
          </v-flex>
          <v-flex
            v-if="form.enableFeeLocation"
            class="pr-5"
          >
            <location-select
              v-model="model.fee.locationId"
              label="Fee Location"
              :asset="form.customFeeAsset"
              :requireAsset="true"
            />
          </v-flex>
        </v-layout>
        <v-layout align-center class="mt-3">
          <v-flex xs3 class="pr-5">
            <v-text-field
              v-model="model.fee.amount"
              label="Fee Amount"
              :rules="[required]"
              class="mr-5"
            ></v-text-field>
          </v-flex>
          <div xs3 class="pr-0">
            <price-lookup
              v-model="assetPriceGBP"
              :asset="feeAsset"
              :date="model.date"
              :textToAnnotate="model.comments"
              @annotatedText="model.comments = $event"
            ></price-lookup>
          </div>
          <v-flex class="pr-5">
            <v-text-field
              v-model="assetPriceGBP"
              :label="`Asset Price (GBP for 1 ${feeAssetSymbol})`"
              class="mr-5"
            ></v-text-field>
          </v-flex>
          <div xs3 class="pr-0">
            <v-btn
              flat
              @click="model.fee.valueGBP = calculatedFeeCost"
            >
              £{{ calculatedFeeCost | formatFiat }}
              <v-icon>chevron_right</v-icon>
            </v-btn>
          </div>
          <v-flex xs3 class="pr-5">
            <v-text-field
              v-model="model.fee.valueGBP"
              label="Fee Cost in GBP"
              :rules="[required]"
            ></v-text-field>
          </v-flex>
        </v-layout>
      </v-card-text>
    </v-card>

    <v-card class="mb-4">
      <v-toolbar card dense>
        <v-toolbar-title class="body-2">
          To Location(s)
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <div
          v-if="model.asset"
          class="mr-5"
        >
          <v-icon
            v-if="remainingToAssign.gt(0)"
            color="orange"
          >
            add_alert
          </v-icon>
          <template v-else>
            <v-icon
              v-if="remainingToAssign.eq(0)"
              color="green"
            >
              done
            </v-icon>
            <v-icon
              v-else
              color="red"
            >
              warning
            </v-icon>
          </template>
          Remaining to assign:
          {{ remainingToAssign | formatAssetValue(model.asset) }}
        </div>
        <div v-if="model.asset">
          {{ toTotal | formatAssetValue(model.asset) }} {{ assetSymbol}}
        </div>
      </v-toolbar>
      <location-items-list
        :items="model.to"
        :asset-id="model.asset"
        @add="addLocation('to', $event.location)"
        @remove="removeLocation('to', $event)"
      >
        <v-card-text
          slot-scope="{ item, index }"
          class="mb-2"
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
            <span
              v-if="toBalances[index]"
              class="mr-5"
            >
              Balance:
              {{ toBalances[index] | formatAssetValue(model.asset) }}
            </span>

            Add:
            <v-text-field
              v-model="item.amount"
              label="Amount"
              :rules="[required]"
              solo
              hide-details
              class="input-amount mx-4"
            ></v-text-field>

            <div
              v-if="toBalances[index]"
              class="mr-5"
            >
              Balance After:
              {{ toBalances[index].plus(item.amount) | formatAssetValue(model.asset) }}
            </div>
          </v-layout>
        </v-card-text>
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
  data: () => ({
    required: (value) => !!value || 'Required',
    transactionId: '',
    form: {
      fetchedTransaction: null,
      fetchedTransactionError: '',
      enableFeeLocation: false,
      customFeeAsset: null
    },
    assetPriceGBP: '',
    model: {
      date: null,
      label: '',
      comments: '',
      asset: '',
      amount: '0',
      from: [],
      to: [],
      fee: {
        amount: '0',
        valueGBP: '0',
        locationId: null
      }
    }
  }),
  computed: {
    asset () {
      return this.model.asset ? this.$store.getters.asset(this.model.asset) : null
    },
    assetSymbol () {
      return (this.asset && this.asset.symbol) || ''
    },
    fromTotal () {
      return this._total('from', this.model.asset)
    },
    fromBalances () {
      return this._balances('from')
    },
    toTotal () {
      return this._total('to', this.model.asset)
    },
    toBalances () {
      return this._balances('to')
    },
    feeAsset () {
      if (!this.form.enableFeeLocation) { return this.asset }
      return this.form.customFeeAsset ? this.$store.getters.asset(this.form.customFeeAsset) : null
    },
    feeAssetSymbol () {
      return (this.feeAsset && this.feeAsset.symbol) || ''
    },
    calculatedFeeCost () {
      var cost = 0
      if (this.assetPriceGBP && this.model.fee.amount && this.feeAsset) {
        cost = u.newBigNumberForAsset(this.model.fee.amount, this.feeAsset.id).times(this.assetPriceGBP)
      }
      return u.formatFiat(cost)
    },
    remainingToAssign () {
      var asset = this.model.asset
      var remaining = u.newBigNumberForAsset(this.fromTotal, asset).minus(this.toTotal)
      if (!this.form.enableFeeLocation) {
        remaining = remaining.minus(this.model.fee.amount)
      }
      return remaining
    },
    modelToSave () {
      var copy = {
        externalAssetLinks: [],
        ...this.model
      }
      if (this.transactionId) {
        copy.externalAssetLinks.push({
          asset: this.asset.id,
          type: 'transaction',
          item: this.transactionId
        })
      }
      return copy
    }
  },
  methods: {
    _total (type, asset) {
      var total = this.model[type].reduce((memo, x) => memo.plus(x.amount), u.newBigNumberForAsset(0, asset))
      return u.formatAssetValue(total, asset)
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
      if (transaction.inputs) {
        this.removeAllLocations('from')
        var totalInputs = u.newBigNumberForAsset(0, this.model.asset)
        transaction.inputs.forEach(input => {
          var location = this.$store.getters.locationForAddress(this.model.asset, input.address)
          if (location) {
            this.addLocation('from', location, input.value)
            totalInputs = totalInputs.plus(input.value)
          }
        })
        this.model.amount = u.formatAssetValue(totalInputs, this.model.asset)
      }
      if (transaction.outputs) {
        this.removeAllLocations('to')
        transaction.outputs.forEach(output => {
          if (output.isToSingleAddress && output.value) {
            var location = this.$store.getters.locationForAddress(this.model.asset, output.addresses[0])
            if (location) {
              this.addLocation('to', location, output.value)
            }
          }
        })
      }
      if (transaction.fee) {
        this.model.fee.amount = transaction.fee
        this.model.fee.valueGBP = '0'
      }
    },
    addLocation (type, location, amount) {
      if (this.model[type].find(x => x.id === location.id)) { return }
      this.model[type].push({
        id: location.id,
        label: location.label,
        subtitle: location.address,
        amount: amount || '0'
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
    submit () {
      if (this.model.asset && this.model.from.length && this.model.to.length && this.model.date) {
        this.$emit('save', this.modelToSave)
      }
    }
  },
  watch: {
    'model.asset': function (val, oldVal) {
      if (val !== oldVal) {
        this.model.from = []
        this.model.to = []
      }
    },
    'form.enableFeeLocation': function (val, oldVal) {
      if (!val) {
        this.form.customFeeAsset = null
        this.model.fee.locationId = null
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
</style>
