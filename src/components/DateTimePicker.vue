<template>
  <v-layout align-content-start>
    <v-menu
      ref="dateMenu"
      :close-on-content-click="false"
      transition="scale-transition"
      min-width="290px"
    >
      <template v-slot:activator="{ on }">
        <v-text-field
          v-model="dateString"
          label="Date"
          readonly
          class="date-field mr-4"
          v-on="on"
        ></v-text-field>
      </template>
      <v-date-picker
        v-model="dateString"
        @input="$refs.dateMenu.save(dateString)"
      ></v-date-picker>
    </v-menu>

    <v-menu
      ref="timeMenu"
      :close-on-content-click="false"
      transition="scale-transition"
      min-width="290px"
    >
      <template v-slot:activator="{ on }">
        <v-text-field
          v-model="timeString"
          label="Time"
          readonly
          class="time-field"
          v-on="on"
        ></v-text-field>
      </template>
      <v-time-picker
        v-model="timeString"
        format="24hr"
        @change="$refs.timeMenu.save(timeString)"
      ></v-time-picker>
    </v-menu>
  </v-layout>
</template>

<script>
import Vue from 'vue'
import u from '../utils'

export default Vue.component('date-time-picker', {
  props: {
    value: Date
  },
  data: () => ({
    dateString: '',
    timeString: '12:00'
  }),
  computed: {
    date () {
      if (!(this.dateString && this.timeString)) { return null }
      return new Date(`${this.dateString} ${this.timeString}`)
    }
  },
  watch: {
    value: function (val, oldVal) {
      // If parent changes the selection, update the display
      if (val !== oldVal) {
        if (val) {
          var datetime = u.formatDateTime(val)
          if (datetime) {
            datetime = datetime.split(' ')
            this.dateString = datetime[0]
            this.timeString = datetime[1]
            return
          }
        }
        this.dateString = ''
        this.timeString = ''
      }
    },
    date (val, oldVal) {
      this.$emit('input', val)
    }
  }
})
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.date-field, .time-field {
  max-width: 150px;
}
</style>
