<template>
  <base-form @submit="submit">
    <v-text-field
      v-model="model.label"
      label="Label"
      :rules="[required]"
    ></v-text-field>
  </base-form>
</template>

<script>

import copyModelMixin from './copyModelMixin'

export default {
  mixins: [
    copyModelMixin({
      id: '',
      label: ''
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
