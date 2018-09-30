<template>
  <base-form @submit="submit">
    <date-time-picker v-model="model.date" />

    <v-card class="mb-4">
      <v-toolbar card dense>
        <v-toolbar-title class="body-2">
          Bought Assets - Location(s)
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <div>
          {{ totalBoughtAssets }}
          <span v-if="valueBoughtAssets.gt(0)">
            =
            {{ valueBoughtAssets | formatFiat }}
            GBP
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
      </v-toolbar>

      <location-items-list
        :items="model.acquired"
        include-asset-selection
        @add="addLocation('acquired', $event)"
        @remove="removeLocation('acquired', $event)"
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
                <v-flex
                  v-if="acquiredBalances[index]"
                  class="blue--text"
                >
                  Balance before:
                  {{ acquiredBalances[index] | formatAssetValue(item.asset) }}
                </v-flex>
                <v-flex class="mt-2 mb-4">
                  <v-layout align-center>
                    <span>Bought:</span>
                    <v-text-field
                      v-model="item.amount"
                      hint="Full amount, before any fees deducted"
                      persistent-hint
                      :rules="[required]"
                      required
                      class="input-amount mx-4"
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
              </v-layout>
            </v-flex>
            <v-flex xs6>
              <v-layout column class="mx-5">
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
                        required
                        class="mr-5"
                      ></v-text-field>
                    </v-flex>
                  </v-layout>
                </v-flex>
                <v-flex class="text-xs-center">
                  <v-btn
                    flat
                    color="blue"
                    @click="item.valueGBP = calculatedValue(item)"
                  >
                    £{{ calculatedValue(item) }}
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

          <v-layout>
            <v-flex>
              <v-text-field
                v-model="item.comments"
                hint="Comments"
                persistent-hint
                color="green lighten-1"
                class="input-comment"
              ></v-text-field>
            </v-flex>
          </v-layout>

        </v-card-text>
      </location-items-list>
    </v-card>

    <v-card class="mb-4">
      <v-toolbar card dense>
        <v-toolbar-title class="body-2">
          Sold Assets - Location(s)
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <div>
          {{ totalSoldAssets }}
          <span v-if="valueSoldAssets.gt(0)">
            =
            {{ valueSoldAssets | formatFiat }}
            GBP
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
      </v-toolbar>

      <location-items-list
        :items="model.disposed"
        include-asset-selection
        @add="addLocation('disposed', $event)"
        @remove="removeLocation('disposed', $event)"
      >
        <v-card-text
          slot-scope="{ item, index }"
          class="pb-0"
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
                <v-flex
                  v-if="disposedBalances[index]"
                  class="blue--text"
                >
                  Balance before:
                  <v-btn
                    flat
                    color="blue"
                    @click="item.amount = disposedBalances[index].toString()"
                  >
                    {{ disposedBalances[index] | formatAssetValue(item.asset) }}
                    <v-icon>expand_more</v-icon>
                  </v-btn>
                </v-flex>

                <v-flex class="mt-2 mb-4">
                  <v-layout align-center>
                    <span>Sold:</span>
                    <v-text-field
                      v-model="item.amount"
                      hint="Amount traded, not including any fees"
                      persistent-hint
                      :rules="[required]"
                      required
                      :append-icon="disposedBalances[index] && disposedBalances[index].lt(item.amount) ? 'warning': ''"
                      class="input-amount mx-4"
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
              </v-layout>
            </v-flex>

            <v-flex xs6>
              <v-layout column class="mx-5">
                <v-flex>
                  <v-text-field
                    v-model="item.valueGBP"
                    label="Value in GBP"
                    hint="Use value of the asset(s) acquired in the trade, before fees"
                    persistent-hint
                    :rules="[required]"
                    required
                  ></v-text-field>
                </v-flex>
              </v-layout>
            </v-flex>
          </v-layout>

          <v-layout>
            <v-flex>
              <v-text-field
                v-model="item.comments"
                hint="Comments"
                persistent-hint
                color="green lighten-1"
                class="input-comment"
              ></v-text-field>
            </v-flex>
          </v-layout>

        </v-card-text>
      </location-items-list>
    </v-card>

    <v-card class="mb-4">
      <v-toolbar card dense>
        <v-toolbar-title class="body-2">
          Fee(s)
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <div>
          {{ totalFees }}
        </div>
      </v-toolbar>

      <location-items-list
        :items="model.fees"
        include-asset-selection
        @add="addLocation('fees', $event)"
        @remove="removeLocation('fees', $event)"
      >
        <v-card-text
          slot-scope="{ item }"
          class="pb-0"
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

          <v-layout>
            <v-flex xs3 class="mr-4">
              <v-text-field
                v-model="item.amount"
                label="Fee Amount"
                :rules="[required]"
                required
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
      label="Comments"
      multi-line
      color="green lighten-1"
      class="input-comment"
    ></v-text-field>

  </base-form>
</template>

<script>

import u from '../utils'

export default {
  data: () => ({
    required: (value) => !!value || 'Required',
    model: {
      date: null,
      label: '',
      comments: '',
      disposed: [],
      acquired: [],
      fees: []
    }
  }),
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
    addLocation (type, {asset, location}) {
      var valueGBP = '0'
      // if this is the first sold asset, auto-fill the valueGBP with the total acquired value
      if (type === 'disposed' && !this.model.disposed.length && this.model.acquired.length) {
        valueGBP = this.valueBoughtAssets.toString()
      }
      this.model[type].push({
        id: location.id,
        label: location.label,
        asset: location.asset,
        assetObj: asset,
        assetPriceGBP: '',
        valueGBP: valueGBP,
        subtitle: location.address,
        amount: '0',
        comments: ''
      })
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
      return u.formatFiat(cost)
    },
    submit () {
      if (this.model.disposed.length && this.model.acquired.length && this.model.date) {
        this.$emit('save', this.model)
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
