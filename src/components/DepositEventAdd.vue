<template>
  <v-card>
    <v-card-title>
      New Deposit (Fiat)
    </v-card-title>
    <v-card-text>
      <DepositEventAddForm
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
import DepositEventAddForm from './DepositEventAddForm'

export default {
  components: { DepositEventAddForm },
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
      this.$store.dispatch('addDeposit', newModel).then(
        () => {
          this.$router.push({ name: 'DepositEvents' })
        },
        (err) => {
          this.error = (err && err.message) || 'Error adding deposit record'
        }
      )
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
