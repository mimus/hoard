<template>
  <v-card>
    <v-card-title>
      New Airdrop or Income (non-fiat)
    </v-card-title>
    <v-card-text>
      <AirdropEventAddForm
        :baseEventId="baseEventId"
        @save="submit"
      />
      <v-alert :value="!!error" type="error">
        {{ error }}
      </v-alert>
    </v-card-text>
  </v-card>
</template>

<script>
import AirdropEventAddForm from './AirdropEventAddForm'

export default {
  components: { AirdropEventAddForm },
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
      this.$store.dispatch('addAirdrop', newModel).then(
        () => {
          this.$router.push({ name: 'AirdropEvents' })
        },
        (err) => {
          this.error = (err && err.message) || 'Error adding airdrop record'
        }
      )
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
