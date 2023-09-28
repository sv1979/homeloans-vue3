<script setup>
import { RouterLink, RouterView } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useApplicationStore } from '../stores/application'
import { useRouter, useRoute } from 'vue-router'
import commonMixin from '../helpers/commonMixin'

const router = useRouter()
const route = useRoute()

const { parseQuery, getLookup } = useApplicationStore()

const { guid } = storeToRefs(useApplicationStore())

// commonMixin.aaa()
async function init() {
    await parseQuery(router, route)
    getLookup()
}

init()

</script>

<template>
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