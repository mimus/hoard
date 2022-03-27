<template>
  <v-autocomplete
    ref="select"
    :items="items"
    :value="value"
    :label="label"
    @input="onChange"
    >
  </v-autocomplete>
</template>

<script>

import Vue from 'vue'

// TODO: add form validation support? https://github.com/vuetifyjs/vuetify/blob/dev/src/mixins/validatable.js

export default Vue.component('income-source-select', {
  props: {
    value: [String, Number],
    label: String,
    required: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    items () {
      var sources = this.$store.getters.incomeSources
      return sources.map((item) => ({
        value: item.id,
        text: item.label
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
