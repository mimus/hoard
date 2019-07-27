<template>
  <v-bottom-sheet v-model="sheet">
    <template v-slot:activator="{ on }">
      <div
        class="text-center"
      >
        <v-btn
          color="green"
          dark
          class="mb-6"
          v-on="on"
        >
          Test Data
        </v-btn>
      </div>
    </template>
    <v-card>
      <v-card-text class="pt-0">
        <v-layout>
          <div>
            <v-select
              v-model="selectedFile"
              return-object
              :items="files"
              item-value="title"
              item-text="title"
              placeholder="Select a data file"
              single-line
            ></v-select>
            <div v-if="selectedFile" style="white-space: nowrap;">
              <v-btn
                :disabled="!selectedFile"
                color="blue"
                dark
                class="mr-3"
                @click="importFile"
              >
                Load Test Data
              </v-btn>
              (replaces current data)
            </div>
            <v-alert
              :value="!!importFileError"
              type="error"
            >
              {{ importFileError }}
            </v-alert>
          </div>

          <v-flex class="ml-12 mt-4">
            <div v-if="loadedFile">
              <p><i>Loaded:</i> &nbsp; <b>{{ loadedFile.title }}</b></p>
              <div v-html="loadedFile.description"></div>
            </div>
          </v-flex>

        </v-layout>
      </v-card-text>
    </v-card>

  </v-bottom-sheet>
</template>

<script>
import Vue from 'vue'

import airdrop1 from '@/store/testdata/airdrop_1_before.json'
import airdrop2 from '@/store/testdata/airdrop_2_after.json'
import cointracker1 from '@/store/testdata/cointracker_scenario1.json'
import cointracker2 from '@/store/testdata/cointracker_scenario2.json'
import hmrc1 from '@/store/testdata/hmrc_cgt_1_start.json'
import hmrc2 from '@/store/testdata/hmrc_cgt_2_buy_sell.json'
import hmrc3 from '@/store/testdata/hmrc_cgt_3_buy_sell_buy.json'
import mining1 from '@/store/testdata/mining_pools_1_no_events.json'
import mining2 from '@/store/testdata/mining_pools_2_events.json'
import pineapple1 from '@/store/testdata/pineapple_transfer_1_before.json'
import pineapple2 from '@/store/testdata/pineapple_transfer_2_after.json'
import assets1 from '@/store/testdata/example_assets.json'

var testData = [
  airdrop1, airdrop2, cointracker1, cointracker2, hmrc1, hmrc2, hmrc3, mining1, mining2, pineapple1, pineapple2, assets1
]

export default Vue.component('test-data-loader', {
  data: () => ({
    sheet: null,
    importFileError: null,
    selectedFile: null,
    loadedFile: null,
    files: testData
  }),
  computed: {
    noSelectedFile: function () {
      return !this.selectedFile
    }
  },
  methods: {
    importFile () {
      var selectedFile = this.selectedFile
      this.$store.dispatch('importData', selectedFile).then(() => {
        this.loadedFile = selectedFile
      }, (errorMessage) => {
        this.importFileError = `Error importing data: ${errorMessage}`
      })
    }
  }
})

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
