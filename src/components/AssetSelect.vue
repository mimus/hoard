<template>
  <v-select
    ref="select"
    :items="items"
    :value="value"
    :label="label"
    :clearable="clearable"
    single-line
    @input="onChange"
    >
  </v-select>
</template>

<script>

import Vue from 'vue'

// TODO: add form validation support? https://github.com/vuetifyjs/vuetify/blob/dev/src/mixins/validatable.js

export default Vue.component('asset-select', {
  props: {
    value: String,
    label: String,
    required: {
      type: Boolean,
      default: false
    },
    fiat: {
      type: Boolean,
      default: false
    },
    clearable: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    items () {
      var assets = this.fiat ? this.$store.getters.fiatAssets : this.$store.getters.assets
      return assets.map((item) => ({
        value: item.id,
        text: `${item.label} (${item.symbol})`
      }))
    }
  },
  methods: {
    onChange (newSelection) {
      this.$emit('input', newSelection)
    }
  }
})
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
