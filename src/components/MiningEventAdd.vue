<template>
  <v-card>
    <div
      v-if="pool"
      key="found"
    >
      <v-card-title>
        New Mining Event in pool {{ pool.label }}
      </v-card-title>
      <v-card-text>
        <MiningEventAddForm
          :poolId="poolId"
          @save="submit"
        />
        <v-alert
          :value="!!error"
          type="error"
        >
          {{ error }}
        </v-alert>
      </v-card-text>
    </div>
    <div
      v-else
      key="notFound"
    >
      Unknown Mining Pool
    </div>
  </v-card>
</template>

<script>
import MiningEventAddForm from './MiningEventAddForm'

export default {
  components: { MiningEventAddForm },
  props: {
    poolId: [Number, String]
  },
  data: () => ({
    error: null
  }),
  computed: {
    pool () {
      return this.poolId ? this.$store.getters.miningPool(this.poolId) : null
    }
  },
  watch: {
    poolId (newVal, oldVal) {
      this.error = null
    }
  },
  methods: {
    submit (newModel) {
      this.error = false
      this.$store.dispatch('addNewMiningEvent', newModel).then(
        () => {
          this.$router.push({ name: 'MiningPool', params: { id: this.poolId } })
        },
        (err) => {
          this.error = (err && err.message) || 'Error adding mining event'
        }
      )
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
