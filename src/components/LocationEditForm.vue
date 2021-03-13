<template>
  <base-form @submit="submit">
    <asset-select
      v-if="!model.id"
      v-model="model.asset"
      label="Asset"
      :required="true"
    />

    <v-text-field
      v-model="model.address"
      label="Address"
      @change="onAddressChanged"
    />

    <v-text-field
      v-model="model.label"
      label="Label"
      :rules="[required]"
    />

    <v-textarea
      v-model="model.comments"
      label="Comments"
    />
  </base-form>
</template>

<script>

import copyModelMixin from './copyModelMixin'

export default {
  mixins: [
    copyModelMixin({
      id: '',
      group: '',
      label: '',
      asset: '',
      address: ''
    })
  ],
  data: () => ({
    required: (value) => !!value || 'Required'
  }),
  computed: {
    locationGroupLabel () {
      var locationGroup = this.model.group ? this.$store.getters.locationGroup(this.model.group) : null
      return (locationGroup && locationGroup.label) || ''
    }
  },
  methods: {
    onAddressChanged () {
      // Using @change listener so that this only triggers after the full address has been entered
      // ('watch' might work if the text input could be lazy, but it doesn't seem to support that)
      var model = this.model
      if (!model.label && model.address) {
        var shortAddress = model.address.substring(0, 6)
        model.label = `${this.locationGroupLabel} ${shortAddress}`
      }
    },
    submit () {
      if (this.model.asset) {
        this.$emit('save', this.model)
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
