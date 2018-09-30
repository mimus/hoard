<template>
  <base-form @submit="submit">
    <v-text-field
      v-model="model.label"
      label="Label"
      :rules="[required]"
    ></v-text-field>

    <asset-select
      v-model="model.asset"
      label="Asset"
      :required="true"
    />

    <v-textarea
      v-model="model.comments"
      label="Comments"
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
      asset: '',
      comments: ''
    })
  ],
  data: () => ({
    required: (value) => !!value || 'Required'
  }),
  methods: {
    submit () {
      if (this.model.asset) {
        this.$emit('save', this.model)
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
