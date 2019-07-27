<template>
  <base-form @submit="submit">
    <v-text-field
      v-model="model.label"
      label="Label"
      placeholder="e.g. 2010/11"
      persistent-hint
      :rules="[required]"
    ></v-text-field>

    <v-layout align-content-start>
      <v-menu
        ref="startDateMenu"
        :close-on-content-click="false"
        transition="scale-transition"
        min-width="290px"
      >
        <template v-slot:activator="{ on }">
          <v-text-field
            v-model="model.startDate"
            label="Start Date"
            readonly
            :rules="[required]"
            class="date-field mr-4"
            v-on="on"
          ></v-text-field>
        </template>
        <v-date-picker
          v-model="model.startDate"
          @input="$refs.startDateMenu.save(model.startDate)"
        ></v-date-picker>
      </v-menu>

      <v-menu
        ref="endDateMenu"
        :close-on-content-click="false"
        transition="scale-transition"
        min-width="290px"
      >
        <template v-slot:activator="{ on }">
          <v-text-field
            v-model="model.endDate"
            label="End Date"
            readonly
            :rules="[required]"
            class="date-field"
            v-on="on"
          ></v-text-field>
        </template>
        <v-date-picker
          v-model="model.endDate"
          @input="$refs.endDateMenu.save(model.endDate)"
        ></v-date-picker>
      </v-menu>
    </v-layout>
  </base-form>
</template>

<script>

import copyModelMixin from './copyModelMixin'
import moment from 'moment'
import u from '../utils'

export default {
  mixins: [
    copyModelMixin({
      id: '',
      label: '',
      startDate: '',
      endDate: ''
    })
  ],
  data: () => ({
    required: (value) => !!value || 'Required'
  }),
  watch: {
    'model.label' (value) {
      var model = this.model
      if (model.label && !model.startDate && !model.endDate) {
        // recognise labels of form YYYY/YY and auto-fill dates
        var parsed = model.label.match(/^(\d+)\/\d+$/)
        if (parsed) {
          var firstYear = parsed[1]
          model.startDate = u.formatDate(moment(`${firstYear}-04-06`))
        }
      }
    },
    'model.startDate' (value) {
      var model = this.model
      if (model.startDate && !model.endDate) {
        var endDate = moment(model.startDate).add(1, 'years').subtract(1, 'days')
        model.endDate = u.formatDate(endDate)
      }
    }
  },
  methods: {
    submit () {
      this.$emit('save', this.model)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.date-field {
  max-width: 150px;
}
</style>
