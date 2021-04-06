<template>
  <base-form @submit="submit">
    <v-text-field
      v-model="model.label"
      label="Source Label"
      :rules="[required]"
    ></v-text-field>

    <asset-select
      v-model="model.originalAsset"
      label="Original Asset (if any)"
      clearable
      :singleLine="false"
    />

    <location-select
      v-model="model.originalLocation"
      label="Original Location (if any)"
      :asset="model.originalAsset"
      requireAsset
      :singleLine="false"
    />

    <asset-select
      v-model="model.incomeAsset"
      label="Income Asset"
      clearable
      :singleLine="false"
    />

    <location-select
      v-model="model.incomeLocation"
      label="Income Location"
      :asset="model.incomeAsset"
      requireAsset
      :singleLine="false"
    />
    <v-text-field
      v-model="model.defaultLabel"
      label="Default Label for income events"
    ></v-text-field>

    <v-textarea
      v-model="model.comments"
      label="Comments (about source)"
    ></v-textarea>
  </base-form>
</template>

<script>

import copyModelMixin from './copyModelMixin'

export default {
  mixins: [
    copyModelMixin({
      id: '',
      label: '',
      originalAsset: '',
      originalLocation: '',
      incomeAsset: '',
      incomeLocation: '',
      defaultLabel: '',
      comments: ''
    })
  ],
  data: () => ({
    required: (value) => !!value || 'Required'
  }),
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
