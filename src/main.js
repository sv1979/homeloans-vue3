import { plugin as VueTippy } from 'vue-tippy'
import 'tippy.js/dist/tippy.css' // optional for styling
// Vuetify
// import 'vuetify/styles'
// import { createVuetify } from 'vuetify'
// import { aliases, mdi } from 'vuetify/iconsets/mdi'
// import * as components from 'vuetify/components'
// import * as directives from 'vuetify/directives'
import './assets/theme.css';
import './assets/main.scss'

// const vuetify = createVuetify({
//     components,
//     directives,
//     icons: {
//         defaultSet: 'mdi',
//         aliases,
//         sets: {
//           mdi,
//         },
//       },
// })

import { createApp } from 'vue'
import PrimeVue from 'primevue/config';
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(
    VueTippy,
    { component: 'tippy' }
)
// app.use(vuetify)
app.use(PrimeVue);
app.mount('#app')
