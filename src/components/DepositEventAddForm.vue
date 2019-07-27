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
  data: () => ({
    required: (value) => !!value || 'Required',
    model: {
      date: null,
      asset: '',
      amount: '',
      location: '',
      label: '',
      comments: ''
    }
  }),
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
