import { createApp } from 'vue'
import { Quasar, Notify, Dialog } from 'quasar'
import { createPinia } from 'pinia'
import { router } from './router'
import App from './App.vue'

// Import Quasar css
import '@quasar/extras/material-icons/material-icons.css'
import 'quasar/dist/quasar.css'

// Import global styles
import './styles/main.scss'

const app = createApp(App)
const pinia = createPinia()

app.use(router)
app.use(pinia)
app.use(Quasar, {
    plugins: {
        Notify,
        Dialog
    },
    config: {
        brand: {
            primary: '#55C7CC',
            secondary: '#26A69A',
            accent: '#9C27B0',
            dark: '#1F2937',
            positive: '#21BA45',
            negative: '#C10015',
            info: '#31CCEC',
            warning: '#F2C037'
        },
        notify: {
            position: 'top',
            timeout: 2500,
            textColor: 'white'
        },
        dark: true
    }
})

app.mount('#app')