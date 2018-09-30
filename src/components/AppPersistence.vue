<template>
  <v-toolbar-items>
    <v-btn
      flat
      @click.stop="importDialog = true"
    >
      Import
    </v-btn>

    <v-btn
      ref="exportBtn"
      flat
      :href="exportUrl"
      target="_blank"
      :download="exportFilename"
      @mousedown="exportStore"
    >
      Export
    </v-btn>

    <v-dialog
      v-model="importDialog"
      max-width="500px"
    >
      <v-card>
        <v-card-title>
          Load from JSON (replaces current data)
        </v-card-title>

        <v-card-text>
          <file-input
            label="Choose file"
            @formData="formData"
          />
          <v-alert
            :value="importFileError"
            type="error"
          >
            {{ importFileError }}
          </v-alert>
        </v-card-text>

        <v-card-actions align-end justify-end>
          <v-spacer />
          <v-btn
            color="primary"
            flat
            @click.stop="importDialog = false"
          >
            Close
          </v-btn>

          <v-btn
            @click="importFiles"
            :disabled="noSelectedFile"
          >
            Load
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </v-toolbar-items>
</template>

<script>
import Vue from 'vue'
import u from '../utils'
import FileInput from './FileInput'

export default Vue.component('app-persistence', {
  components: { FileInput },
  data: () => ({
    importDialog: false,
    importFileError: null,
    selectedFile: null,
    exportUrl: '',
    exportFilename: 'hoard.json'
  }),
  computed: {
    noSelectedFile: function () {
      return !this.selectedFile
    }
  },
  methods: {
    formData: function (formDatas) {
      var file = null
      if (formDatas && formDatas[0]) {
        file = formDatas[0].get('data') // file-input stores file here
      }
      this.selectedFile = file
      this.importFileError = ''
    },
    importFiles: function () {
      this.importFileError = ''
      if (!this.selectedFile) { return }
      var reader = new FileReader()
      reader.onerror = () => {
        console.error('Error reading file', arguments)
        this.importFileError = 'Error reading file'
      }
      reader.onload = (event) => {
        var data = null
        try {
          data = JSON.parse(event.target.result)
        } catch (e) {
          console.error('Error parsing file', arguments)
          this.importFileError = 'Error parsing file'
        }
        // console.log('data', data)
        this.$store.dispatch('importData', data).then(() => {
          this.importDialog = false
        }, (errorMessage) => {
          this.importFileError = `Error importing data: ${errorMessage}`
        })
      }
      reader.readAsText(this.selectedFile)
    },
    exportStore: function () {
      var now = new Date()
      this.exportFilename = `hoard_${u.formatDateTimePlain(now)}.json`
      var exportState = this.$store.getters.dataForExport
      this.exportUrl = u.makeJsonFileUrl(exportState)
      // wait for exportUrl to be set on the button.
      Vue.nextTick(function () {
        this.$refs.exportBtn.$el.click()
      }, this)
    }
  }
})

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
