// Spec: specs/portal/home.spec.md
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/main.css'

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.use(router)
app.mount('#app')

import('@/stores/auth').then(({ useAuthStore }) => {
  const authStore = useAuthStore()

  if (window.$wujie) {
    // 微前端（wujie）接入：从主应用监听 login 事件获取用户信息
    window.$wujie.bus.$on('login', (...args: unknown[]) => {
      const userinfo = args[0] as Record<string, unknown>
      console.log('[portal] 子应用获取到了用户信息', userinfo)
      authStore.setUserFromWujie(userinfo)
    })
  } else {
    // 独立运行 Mock：模拟主应用下发的用户信息
    authStore.setUserFromWujie({
      userInfo: {
        full_Name: '杨鹏军',
        w3Account: 'y00001111',
        avator: 'https://api.dicebear.com/9.x/avataaars/svg?seed=y00001111',
      },
    })
  }
})
