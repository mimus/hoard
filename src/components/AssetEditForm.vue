<template>
  <base-form @submit="submit">
    <v-text-field
      v-if="!initialModel"
      v-model="model.id"
      label="ID"
      :rules="[required]"
    ></v-text-field>

    <v-text-field
      v-model="model.label"
      label="Label"
      :rules="[required]"
    ></v-text-field>

    <v-text-field
      v-model="model.symbol"
      label="Symbol"
      :rules="[required]"
    ></v-text-field>

    <v-checkbox
      v-model="model.fiat"
      label="Fiat"
    ></v-checkbox>

    <v-checkbox
      v-model="model.stablecoin"
      label="Stablecoin"
    ></v-checkbox>

    <v-checkbox
      v-model="model.nft"
      label="NFT"
    ></v-checkbox>

    <v-checkbox
      v-model="model.caseSensitiveAddress"
      label="Addresses are case-sensitive"
      hint="Ethereum addresses (and tokens using them) are not case-sensitive. Bitcoin-based addresses are case-sensitive."
      persistent-hint
    ></v-checkbox>
  </base-form>
</template>

<script>

import copyModelMixin from './copyModelMixin'

export default {
  mixins: [
    copyModelMixin({
      id: '',
      label: '',
      symbol: '',
      fiat: false,
      stablecoin: false,
      nft: false,
      caseSensitiveAddress: false
    })
  ],
  data () {
    return {
      required: (value) => !!value || 'Required'
    }
  },
  methods: {
    submit () {
      this.$emit('save', this.model)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
