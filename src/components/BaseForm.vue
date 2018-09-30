<template>
  <v-form
    ref="form"
    v-model="valid"
  >
    <slot></slot>

    <v-card-actions>
      <v-btn
        small
        flat
        @click="cancel"
      >
        Cancel
      </v-btn>
      <v-btn
        small
        :disabled="!valid"
        @click="submit"
      >
        Save
      </v-btn>
    </v-card-actions>
  </v-form>
</template>

<script>

import Vue from 'vue'

export default Vue.component('BaseForm', {
  data () {
    return {
      valid: true
    }
  },
  methods: {
    cancel () {
      this.$router.back()
    },
    submit () {
      if (this.$refs.form.validate()) {
        this.$emit('submit')
      }
    }
  }
})
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
