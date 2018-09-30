<template>
  <v-card>
    <v-card-title>
      Add Mining Pool
    </v-card-title>
    <v-card-text>
      <MiningPoolEditForm @save="submit" />
    </v-card-text>
  </v-card>
</template>

<script>

import MiningPoolEditForm from './MiningPoolEditForm'

export default {
  components: { MiningPoolEditForm },
  methods: {
    submit (newModel) {
      this.$store.dispatch('addMiningPool', newModel)
      this.$router.push({ name: 'MiningPools' })
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
