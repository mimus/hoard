<template>
  <div>
    <v-menu
      ref="dateMenu"
      :close-on-content-click="false"
      transition="scale-transition"
      min-width="290px"
    >
      <v-text-field
        slot="activator"
        v-model="dateString"
        label="Date"
        readonly
      ></v-text-field>
      <v-date-picker
        class="mt-5"
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
      <v-text-field
        slot="activator"
        v-model="timeString"
        label="Time"
        readonly
      ></v-text-field>
      <v-time-picker
        class="mt-5"
        v-model="timeString"
        format="24hr"
        @change="$refs.timeMenu.save(timeString)"
      ></v-time-picker>
    </v-menu>
  </div>
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
<style>
</style>
