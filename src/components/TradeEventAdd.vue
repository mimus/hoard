<template>
  <v-card>
    <v-card-title>
      New Trade
    </v-card-title>
    <v-card-text>
      <TradeEventAddForm
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
import TradeEventAddForm from './TradeEventAddForm'

export default {
  components: { TradeEventAddForm },
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
      this.$store.dispatch('addTrade', newModel).then(
        () => {
          this.$router.push({ name: 'TradeEvents' })
        },
        (err) => {
          this.error = (err && err.message) || 'Error adding trade record'
        }
      )
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
