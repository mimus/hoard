<template>
  <v-card>
    <v-card-title>
      Add Location Group
    </v-card-title>
    <v-card-text>
      <LocationGroupEditForm @save="submit" />
    </v-card-text>
  </v-card>
</template>

<script>

import LocationGroupEditForm from './LocationGroupEditForm'

export default {
  components: { LocationGroupEditForm },
  methods: {
    submit (newModel) {
      this.$store.dispatch('addLocationGroup', newModel)
      this.$router.push({ name: 'LocationGroups' })
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
