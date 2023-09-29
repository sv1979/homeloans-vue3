<script setup>
import { RouterLink, RouterView } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useApplicationStore } from '../stores/application'
import { useRouter, useRoute } from 'vue-router'
import commonMixin from '../helpers/commonMixin'
import InlineSvg from './InlineSvg.vue';

const router = useRouter()
const route = useRoute()

const { parseQuery, getLookup, loadToken, runInitialLoad } = useApplicationStore()

const { guid, fields } = storeToRefs(useApplicationStore())

async function init() {
  await parseQuery(router, route)
  getLookup()
  loadToken()
  console.log(guid.value, fields.value.Has_RVC.value)

  // TODO: setCoappVerification / setPrimVerification

  if (guid.value && typeof guid.value === 'string' && guid.value.length === 36) {
    // not clear why it is separated in the v2 ?
    // TODO: getBiometrics status
    // TODO: load app by guid 
  } else {
    runInitialLoad()
  }
}

init()

</script>

<template>
  <nav class="navbar" role="navigation" aria-label="main navigation">
    <div class="cont">
      <div class="navbar-item" href="/">
        <a :href="this.backLink" class="brand">
          <InlineSvg
            class=""
            :src="import('@/assets/logo.svg')"/>
        </a>
      </div>
      <div class="navbar-end is-hidden-mobile">
        <div class="navbar-item">
          <h2 class="title is-4">Home Loan application</h2>
        </div>
      </div>
    </div>
  </nav>
  <header class="navbar">
    <div>
      <nav>
        <RouterLink to="/">Posts</RouterLink> -
        <RouterLink to="/authors">Authors</RouterLink>
      </nav>
    </div>
  </header>
  <RouterView />
</template>