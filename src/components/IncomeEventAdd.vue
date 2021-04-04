<template>
  <v-card>
    <v-card-title>
      New Income (non-fiat)
    </v-card-title>
    <v-card-text>
      <IncomeEventAddForm
        :sourceId="sourceId"
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
import IncomeEventAddForm from './IncomeEventAddForm'

export default {
  components: { IncomeEventAddForm },
  props: {
    sourceId: {
      type: [String, Number],
      default: null
    },
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
      this.$store.dispatch('addIncome', newModel).then(
        () => {
          if (this.sourceId) {
            this.$router.push({ name: 'IncomeSource', params: { sourceId: this.sourceId } })
          } else {
            this.$router.push({ name: 'IncomeSources' })
          }
        },
        (err) => {
          this.error = (err && err.message) || 'Error adding income record'
        }
      )
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
