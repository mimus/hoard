<template>
  <base-form @submit="submit">
    <asset-select
      class="mr-5"
      v-model="model.asset"
      label="New Asset Gained"
      :required="true"
    />

    <v-layout row align-center>
      <v-text-field
        class="mr-5"
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

    <v-layout align-start>
      <v-flex xs4 class="pr-5">
        <asset-select
          v-model="model.originalAsset"
          label="Original Asset (if any)"
          :clearable="true"
        />
      </v-flex>
      <v-flex xs4 class="pr-5">
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
        <div v-if="originalAssetAmount">
          Value at date: {{ originalAssetAmount | formatAssetValue(model.originalAsset) }}
          <v-btn
            small
            @click="model.amount = originalAssetAmount.toString()"
          >
            Copy <v-icon class="ml-1">arrow_downward</v-icon>
          </v-btn>
        </div>
      </v-flex>
    </v-layout>

    <v-layout>
      <v-flex xs4 class="pr-5">
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
      <v-flex xs4 class="pr-5">
        <v-text-field
          class="mr-5"
          v-model="model.amount"
          label="Amount"
          :rules="[required]"
        ></v-text-field>
      </v-flex>
      <v-flex xs4 class="pr-5">
        <v-text-field
          v-model="model.assetValueGBP"
          label="Total GBP Cost/Value (0 if given for free)"
          :rules="[required]"
        ></v-text-field>
      </v-flex>
    </v-layout>

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

export default {
  data: () => ({
    required: (value) => !!value || 'Required',
    form: {
      transactionId: '',
      fetchedTransactionError: ''
    },
    model: {
      date: null,
      originalAsset: '',
      originalLocation: '',
      asset: '',
      amount: '',
      location: '',
      assetValueGBP: '',
      label: '',
      comments: ''
    }
  }),
  computed: {
    originalAssetAmount () {
      var model = this.model
      if (model.date && model.originalLocation) {
        return this.$store.getters.ledgerBalanceForLocation(model.originalLocation, model.date)
      }
      return false
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
    onTransactionFetched () {
      var transaction = this.form.fetchedTransaction
      if (!transaction) {
        return
      }
      if (transaction.date) {
        this.model.date = transaction.date
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
