<template>
  <v-card>
    <v-card-title>
      Add Income Source
    </v-card-title>
    <v-card-text>
      <IncomeSourceEditForm @save="submit" />
    </v-card-text>
  </v-card>
</template>

<script>

import IncomeSourceEditForm from './IncomeSourceEditForm'

export default {
  components: { IncomeSourceEditForm },
  methods: {
    submit (newModel) {
      this.$store.dispatch('addIncomeSource', newModel)
      this.$router.push({ name: 'IncomeSources' })
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
