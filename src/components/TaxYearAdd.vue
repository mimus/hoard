<template>
  <v-card>
    <v-card-title>
      Add Tax Year
    </v-card-title>
    <v-card-text>
      <TaxYearEditForm @save="submit" />
    </v-card-text>
  </v-card>
</template>

<script>

import TaxYearEditForm from './TaxYearEditForm'

export default {
  components: { TaxYearEditForm },
  methods: {
    submit (newModel) {
      this.$store.dispatch('addTaxYear', newModel)
      this.$router.push({ name: 'TaxYears' })
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
