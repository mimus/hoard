<template>
  <base-form @submit="submit">

    <date-time-picker v-model="model.date" />

    <v-layout>
      <asset-select
        v-model="model.asset"
        label="Asset"
        :fiat="true"
        :required="true"
        class="mr-12"
      />

      <v-text-field
        v-model="model.amount"
        label="Amount"
        :rules="[required]"
      ></v-text-field>
    </v-layout>

    <location-select
      v-model="model.location"
      label="Deposit to Location"
      :asset="model.asset"
      :requireAsset="true"
      :required="true"
    ></location-select>

    <v-text-field
      v-model="model.label"
      label="Label"
      :rules="[required]"
    ></v-text-field>

    <v-textarea
      v-model="model.comments"
      label="Comments"
    ></v-textarea>

  </base-form>
</template>

<script>

export default {
  props: {
    baseEventId: {
      type: [String, Number],
      default: null
    }
  },
  data: function () {
    let baseEvent = null
    let location = null
    if (this.baseEventId) {
      baseEvent = this.$store.getters.depositEvent(this.baseEventId)
      if (baseEvent) {
        const locationLedgerEntryId = baseEvent.linked?.find(({ type }) => type === 'locationLedgerEntry')?.id
        if (locationLedgerEntryId) {
          const locationLedgerEntry = this.$store.getters.locationLedgerEntry(locationLedgerEntryId)
          if (locationLedgerEntry) {
            location = locationLedgerEntry.location
          }
        }
      }
    }
    return {
      required: (value) => !!value || 'Required',
      model: {
        date: null,
        asset: baseEvent?.asset || '',
        amount: '',
        location: location || '',
        label: baseEvent?.label || '',
        comments: ''
      }
    }
  },
  methods: {
    submit () {
      if (this.model.asset && this.model.location && this.model.date) {
        this.$emit('save', this.model)
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
