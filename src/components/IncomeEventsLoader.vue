<template>
  <div
    v-if="canShow"
  >
    Load income events from file:
    <file-input
      label="Choose file"
      @formData="formData"
    />
    <v-alert
      :value="!!importFileError"
      type="error"
    >
      {{ importFileError }}
    </v-alert>
    <v-btn
      @click="importFile"
      :disabled="noSelectedFile"
    >
      Load
    </v-btn>
  </div>
</template>

<script>
import Vue from 'vue'
import FileInput from './FileInput'

export default Vue.component('income-events-loader', {
  components: { FileInput },
  props: {
    asset: { type: String, required: true },
    importerId: { type: String, required: true }
  },
  data: function () {
    return {
      importFileError: null,
      selectedFile: null,
      loaded: false
    }
  },
  computed: {
    canShow () {
      return this.asset && this.importer && !this.loaded
    },
    importer () {
      return this.$genericServices.find(x => x.id === this.importerId)
    },
    noSelectedFile: function () {
      return !this.selectedFile
    }
  },
  watch: {
    asset (val, oldVal) {
      if (val !== oldVal) {
        this.resetStatus()
      }
    },
    importer (val, oldVal) {
      if (val !== oldVal) {
        this.resetStatus()
      }
    }
  },
  methods: {
    resetStatus () {
      this.loaded = false
      this.$emit('input', null)
      this.$emit('error', false)
    },
    formData: function (formDatas) {
      var file = null
      if (formDatas && formDatas[0]) {
        file = formDatas[0].get('data') // file-input stores file here
      }
      this.selectedFile = file
      this.importFileError = ''
    },
    importFile: function () {
      this.importFileError = ''
      if (!this.selectedFile) { return }
      var asset = this.asset
      this.$emit('error', false)
      var reader = new FileReader()
      reader.onerror = () => {
        console.error('Error reading file', arguments)
        this.importFileError = 'Error reading file'
      }
      reader.onload = (event) => {
        var data = event.target.result
        this.importer.loadIncomeEvents(asset, data).then(
          ({ incomeEvents }) => {
            if (this.asset !== asset) { return }
            this.loaded = true
            this.$emit('input', incomeEvents)
          }, (error) => {
            if (this.asset !== asset) { return }
            var importFileError = `Error importing data: ${error.message}`
            this.$emit('error', importFileError)
          }
        )
      }
      reader.readAsText(this.selectedFile)
    }
  }
})
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
