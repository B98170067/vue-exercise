import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import setupAtnd from "./ant-design-vue/index";

const app = createApp(App)
setupAtnd(app)
app.use(store).use(router).mount('#app')
