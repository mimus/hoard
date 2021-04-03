<template>
  <v-card>
    <v-card-title>
      Edit Income Source
    </v-card-title>
    <v-card-text>
      <div v-if="!foundModel">
        Unknown ID
      </div>
      <IncomeSourceEditForm
        v-else
        :initialModel="model"
        @save="submit"
      />
    </v-card-text>
  </v-card>
</template>

<script>

import IncomeSourceEditForm from './IncomeSourceEditForm'
import fetchModelByIdMixin from './fetchModelByIdMixin'

export default {
  components: { IncomeSourceEditForm },
  mixins: [
    fetchModelByIdMixin(function (id) {
      return id && this.$store.getters.incomeSource(id)
    })
  ],
  data: () => ({
    model: {
      id: '',
      label: '',
      originalAsset: '',
      originalLocation: '',
      incomeAsset: '',
      incomeLocation: '',
      comments: ''
    }
  }),
  methods: {
    submit (newModel) {
      this.$store.dispatch('updateIncomeSource', newModel)
      this.$router.push({ name: 'IncomeSource', params: { id: newModel.id } })
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
