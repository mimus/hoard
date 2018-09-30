<template>
  <v-select
    :value="selectedValue"
    :items="items"
    :label="label"
    :required="required"
    single-line
    @input="onChange"
  ></v-select>
</template>

<script>

import Vue from 'vue'

// TODO: add form validation support? https://github.com/vuetifyjs/vuetify/blob/dev/src/mixins/validatable.js

export default Vue.component('location-select', {
  props: {
    value: [Number, String],
    label: String,
    required: { type: Boolean, default: false },
    asset: String,
    requireAsset: { type: Boolean, default: false }
  },
  data: () => ({
    selectedValue: ''
  }),
  computed: {
    items () {
      var asset = this.asset
      var locations = []
      if (this.requireAsset && !asset) { return locations }

      locations = asset ? this.$store.getters.locationsForAsset(asset) : this.$store.getters.locations
      return locations.map((item) => ({
        value: item.id,
        text: `${item.label}`
      }))
    }
  },
  watch: {
    asset: function (val, oldVal) {
      if (val !== oldVal) {
        // make sure we recognise changed select options
        this.selectedValue = ''
        this.onChange(this.selectedValue)
      }
    },
    value: {
      immediate: true,
      handler (val, oldVal) {
        // If parent changes the selection, update the display
        this.selectedValue = val
      }
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
