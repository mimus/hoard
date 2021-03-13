<template>
  <base-form @submit="submit">
    <v-text-field
      v-model="model.label"
      label="Label"
      :rules="[required]"
    />
    <v-select
      v-model="model.category"
      :items="categories"
      label="Category"
      clearable
    />
    <v-text-field
      v-model="model.url"
      label="URL"
    />
    <v-textarea
      v-model="model.comments"
      label="Comments"
    />
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
  computed: {
    categories () {
      return this.$store.getters.locationGroupCategories.map((item) => ({
        value: item.id,
        text: item.label
      }))
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
