<template>
  <v-app>
    <v-navigation-drawer
      app
      v-model="drawer"
      fixed width="220"
    >
      <v-layout
        column
        fill-height
        justify-space-between
      >
        <the-main-menu></the-main-menu>
        <test-data-loader></test-data-loader>
      </v-layout>
    </v-navigation-drawer>
    <v-toolbar
      app
      fixed
      dense
      extended
    >
      <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
      <v-toolbar-title>Hoard</v-toolbar-title>
      <v-spacer />
      <app-persistence></app-persistence>

      <template v-slot:extension>
        <the-main-breadcrumbs></the-main-breadcrumbs>
      </template>
    </v-toolbar>
    <v-content>
      <v-container
        fluid
        style="position: relative; z-index: 0;"
      >
        <router-view></router-view>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
import '@/components/TheMainMenu'
import '@/components/TestDataLoader'
import '@/components/AppPersistence'
import '@/components/TheMainBreadcrumbs'
import '@/components/AssociatedLink'
import '@/components/AssociatedLinks'
import '@/components/ExternalLocationLink'
import '@/components/ExternalAssetLink'
import '@/components/ExternalAssetLinks'
import '@/components/PriceLookup'
import '@/components/ExternalTransactionFetcher'
import '@/components/ExternalTransactionsFetcher'
import '@/components/DateTimePicker'
import '@/components/AssetSelect'
import '@/components/LocationSelect'
import '@/components/BaseForm'
import '@/components/LocationItemsList'

export default {
  name: 'App',
  data: () => ({
    drawer: null
  })
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
