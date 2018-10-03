<template>
  <v-bottom-sheet v-model="sheet">
    <div
      slot="activator"
      class="text-xs-center"
    >
      <v-btn
        color="green"
        dark
        class="mb-4"
      >
        Test Data
      </v-btn>
    </div>

    <v-card>
      <v-card-text class="pt-0">
        <v-layout row>
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
                @click="importFile"
              >
                Load Test Data
              </v-btn>
              (replaces current data)
            </div>
            <v-alert
              :value="importFileError"
              type="error"
            >
              {{ importFileError }}
            </v-alert>
          </div>

          <v-flex class="ml-5 mt-3">
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
import u from '../utils'

import airdrop_1_before from '@/store/testdata/airdrop_1_before.json'
import airdrop_2_after from '@/store/testdata/airdrop_2_after.json'
import cointracker_scenario1 from '@/store/testdata/cointracker_scenario1.json'
import cointracker_scenario2 from '@/store/testdata/cointracker_scenario2.json'
import hmrc_cgt_1 from '@/store/testdata/hmrc_cgt_1_start.json'
import hmrc_cgt_2 from '@/store/testdata/hmrc_cgt_2_buy_sell.json'
import hmrc_cgt_3 from '@/store/testdata/hmrc_cgt_3_buy_sell_buy.json'
import mining_pools_1 from '@/store/testdata/mining_pools_1_no_events.json'
import mining_pools_2 from '@/store/testdata/mining_pools_2_events.json'
import pineapple_transfer_1 from '@/store/testdata/pineapple_transfer_1_before.json'
import pineapple_transfer_2 from '@/store/testdata/pineapple_transfer_2_after.json'
import example_assets from '@/store/testdata/example_assets.json'

var testData = [
  airdrop_1_before, airdrop_2_after, cointracker_scenario1, cointracker_scenario2, hmrc_cgt_1, hmrc_cgt_2, hmrc_cgt_3, mining_pools_1, mining_pools_2, pineapple_transfer_1, pineapple_transfer_2, example_assets
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
