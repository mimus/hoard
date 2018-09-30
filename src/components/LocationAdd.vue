<template>
  <v-card>
    <div
      v-if="locationGroup"
      key="found"
    >
      <v-card-title>
        Add Location to group {{ locationGroup.label }}
      </v-card-title>
      <v-card-text>
        <LocationEditForm
          :initialModel="model"
          @save="submit"
        />
      </v-card-text>
    </div>
    <div
      v-else
      key="notFound"
    >
      <v-card-text>
        Unknown location group
      </v-card-text>
    </div>
  </v-card>
</template>

<script>

import LocationEditForm from './LocationEditForm'

export default {
  components: { LocationEditForm },
  props: {
    groupId: [String, Number]
  },
  data: () => ({
    model: {
      group: ''
    }
  }),
  computed: {
    locationGroup () {
      return this.model.group ? this.$store.getters.locationGroup(this.model.group) : null
    }
  },
  watch: {
    groupId: {
      immediate: true,
      handler (newVal, oldVal) {
        this.model.group = newVal
      }
    }
  },
  methods: {
    submit (newModel) {
      this.$store.dispatch('addLocation', newModel)
      this.$router.push({ name: 'LocationGroup', id: this.groupId })
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
