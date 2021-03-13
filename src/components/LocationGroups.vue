<template>
  <v-card class="pb-2x">
    <v-list
      v-if="locationGroups && locationGroups.length"
      three-line
    >
      <template
        v-for="(category, categoryIndex) in categoriesOfGroups"
      >
        <v-divider
          v-if="categoryIndex"
          :key="`${category.id}_divider`"
        />
        <v-subheader
          :key="`${category.id}_subheader`"
        >
          <v-chip
            color="blue-grey"
            outlined
            small
          >
            {{ category.label }}
          </v-chip>
        </v-subheader>
        <v-list-item-group
          :key="`${category.id}_groups`"
        >
          <v-list-item
            v-for="group in category.groups"
            :key="group.id"
            :to="{name: 'LocationGroup', params: {id: group.id}}"
          >
            <v-list-item-content>
              <v-list-item-title>
                {{ group.label }}

                <template v-if="group.totalGBPValue !== null">
                  <span
                    :class="{
                      'text--disabled': group.totalGBPValue.isZero()
                    }"
                    :style="group.totalGBPValue.isZero() ? 'font-size: 0.7em' : ''"
                  >
                    ({{ group.totalGBPValue | formatFiat }})
                  </span>
                </template>
              </v-list-item-title>
              <v-list-item-subtitle>
                <span
                  v-for="(total, assetId) in group.assets"
                  :key="assetId"
                  class="mr-2"
                  :class="{
                    'text--disabled': total.isZero()
                  }"
                  :style="total.isZero() ? 'font-size: 0.7em' : ''"
                >
                  {{ total | formatAssetValue(assetId) }}&nbsp;{{ assetId }}
                </span>
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-list-item-group>
      </template>
    </v-list>
    <v-card-text v-else>
      No location groups.
    </v-card-text>
    <v-btn
      absolute bottom right
      fab color="blue" dark small
      :to="{name: 'LocationGroupAdd'}"
    >
      <v-icon>add</v-icon>
    </v-btn>
  </v-card>
</template>

<script>

import { mapGetters } from 'vuex'

export default {
  computed: {
    ...mapGetters([
      'locationGroups',
      'locationGroupCategories'
    ]),
    locationGroupsWithTotals () {
      return this.locationGroups.map(group => ({
        ...group,
        totalGBPValue: this.$store.getters.totalLocationGroupGBPValue(group.id),
        assets: Object.fromEntries(
          Object.entries(
            this.$store.getters.locationsInGroupByAssetWithTotal(group.id)
          ).map(
            ([assetId, { total }]) => [
              assetId,
              total
            ]
          )
        )
      }))
    },
    categoriesOfGroups () {
      let categoriesToDisplay = []
      let addedGroupIds = []
      this.locationGroupCategories.forEach(category => {
        const groupsInCategory = this.locationGroupsWithTotals.filter(group => group.category === category.id)
        if (groupsInCategory.length) {
          categoriesToDisplay = categoriesToDisplay.concat({
            id: category.id,
            label: category.label,
            groups: groupsInCategory
          })
          addedGroupIds = addedGroupIds.concat(groupsInCategory.map(group => group.id))
        }
      })
      const remainingGroups = this.locationGroupsWithTotals.filter(group => !addedGroupIds.includes(group.id))

      if (remainingGroups.length) {
        categoriesToDisplay.push({
          id: 'ALL_REMAINING',
          label: 'Uncategorized',
          groups: remainingGroups
        })
      }

      return categoriesToDisplay
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
