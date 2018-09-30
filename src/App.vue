<template>
  <v-app>
    <v-navigation-drawer app fixed width="220" v-model="drawer">
      <the-main-menu></the-main-menu>
    </v-navigation-drawer>
    <v-toolbar app fixed dense extended>
      <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
      <v-toolbar-title>Hoard</v-toolbar-title>
      <v-spacer />
      <app-persistence></app-persistence>

      <template slot="extension">
        <the-main-breadcrumbs></the-main-breadcrumbs>
      </template>
    </v-toolbar>
    <v-content>
      <v-container fluid>
        <router-view></router-view>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
import '@/components/TheMainMenu'
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
