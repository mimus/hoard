<template>
  <v-card>
    <v-card-title>
      New Transfer
    </v-card-title>
    <v-card-text>
      <TransferEventAddForm
        :baseEventId="baseEventId"
        @save="submit"
      />
      <v-alert
        :value="!!error"
        type="error"
      >
        {{ error }}
      </v-alert>
    </v-card-text>
  </v-card>
</template>

<script>
import TransferEventAddForm from './TransferEventAddForm'

export default {
  components: { TransferEventAddForm },
  props: {
    baseEventId: {
      type: [String, Number],
      default: null
    }
  },
  data: () => ({
    error: null
  }),
  methods: {
    submit (newModel) {
      this.error = false
      this.$store.dispatch('addTransfer', newModel).then(
        () => {
          this.$router.push({ name: 'TransferEvents' })
        },
        (err) => {
          this.error = (err && err.message) || 'Error adding transfer record'
        }
      )
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
