import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import About from '../components/About.vue'
import HelloWorld from '../components/HelloWorld.vue'
import DeviceUserList from '../components/user/device-user/List.vue'
import SystemUserList from '../components/user/system-user/List.vue'
import DeviceList from '../components/device/List.vue'
import AccountLogList from '../components/log/account-log/List.vue'
import AppLogLost from '../components/log/app-log/List.vue'
import IoTLogList from '../components/log/iot-log/List.vue'
import WebLogList from '../components/log/web-log/List.vue'
import store from '@/store'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { requiredLogin: true },
    children: [
      {
        path: '',
        component: HelloWorld,
        alias: 'HelloWorld',
      },
      {
        path: 'About',
        component: About,
      },
      {
        path: 'DeviceUserList',
        component: DeviceUserList,
      },
      {
        path: 'SystemUserList',
        component: SystemUserList,
      },
      {
        path: 'DeviceList',
        component: DeviceList,
      },
      {
        path: 'AccountLogList',
        component: AccountLogList,
      },
      {
        path: 'AppLogLost',
        component: AppLogLost,
      },
      {
        path: 'IoTLogList',
        component: IoTLogList,
      },
      {
        path: 'WebLogList',
        component: WebLogList,
      }
    ],
  },
  {
    path: '/Login',
    name: 'Login',
    component: Login,
    meta: { redirectAlreadyLogin: true },
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

router.beforeEach((to) => {
  const isAuthenticated = store.getters.isAuthenticated;
  const { requiredLogin, redirectAlreadyLogin } = to.meta;

  if (!isAuthenticated && requiredLogin) {
    return { path: '/login' }
  }

  if (isAuthenticated && redirectAlreadyLogin) {
    return { path: '/' }
  }
});

export default router
