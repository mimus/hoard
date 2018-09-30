<template>
  <div>
    <div
      v-for="(item, index) in items"
      :key="item.id"
    >
      <v-layout align-center>
        <v-flex>
          <slot
            v-bind:item="item"
            v-bind:index="index"
          ></slot>
        </v-flex>

        <div class="ml-4">
          <slot name="remove-item">
            <v-btn
              flat
              icon
              small
              color="blue-grey"
              @click="removeItem(item.id)"
            >
              <v-icon>clear</v-icon>
            </v-btn>
          </slot>
        </div>
      </v-layout>

      <slot name="divider">
        <v-divider />
      </slot>
    </div>

    <div class="pl-3 blue lighten-5">
      <v-layout align-center>
        <asset-select
          v-if="includeAssetSelection"
          v-model="selectedAssetId"
          label="Asset"
          :required="includeAssetSelection"
          class="mr-4"
        />
        <location-select
          v-model="selectedLocationId"
          label="Add Location"
          :asset="selectedAssetId"
          :requireAsset="requireAsset"
        />
        <v-btn
          flat
          icon
          small
          color="blue"
          :disabled="!canAdd"
          @click="addItem()"
        >
          <v-icon>add</v-icon>
        </v-btn>
      </v-layout>
    </div>
  </div>
</template>

<script>

import Vue from 'vue'

export default Vue.component('location-items-list', {
  props: {
    items: Array,
    assetId: [Number, String],
    requireAsset: { type: Boolean, default: true },
    includeAssetSelection: { type: Boolean, default: false }
  },
  data: () => ({
    selectedAssetId: '',
    selectedLocationId: ''
  }),
  computed: {
    asset () {
      return this.selectedAssetId && this.$store.getters.asset(this.selectedAssetId)
    },
    location () {
      return this.selectedLocationId && this.$store.getters.location(this.selectedLocationId)
    },
    canAdd () {
      // Must have selected location, and item must not already be in the list
      // This assumes that added items will have id == locationId
      var locationId = this.selectedLocationId
      return !!locationId && this.items.findIndex(x => x.id === locationId) === -1
    }
  },
  watch: {
    assetId: {
      immediate: true,
      handler (newVal, oldVal) {
        this.selectedAssetId = newVal
      }
    }
  },
  methods: {
    addItem () {
      this.$emit('add', { asset: this.asset, location: this.location })
    },
    removeItem (itemId) {
      this.$emit('remove', itemId)
    }
  }
})
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
