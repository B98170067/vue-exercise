import axios from 'axios'
import store from '@/store'
import router from '@/router'
import config from '@/common/config/index'

let isRefreshing = false
let requests: ((token: string) => void)[] = []

const apiRequest = axios.create({
    baseURL: process.env.NODE_ENV === 'production' ? config.dev.baseUrl.api : config.prod.baseUrl.api
})

apiRequest.interceptors.request.use(
    function (config) {
        config = {
            ...config,
            headers: { ...config.headers, ...store.getters.headers },
        }
        return config
    },
    function (error) {
        return Promise.reject(error)
    },
)

apiRequest.interceptors.response.use(
    function (response) {
        return response
    },
    function (error) {
        if (error.response.status === 401) {
            if (!isRefreshing) {
                isRefreshing = true
                return store
                    .dispatch('refreshTokenAPI', store.state.refreshToken)
                    .then((res) => {
                        console.log('成功刷新token', res)
                        store.commit('setAccessToken', res.data.access_token)
                        store.commit('setRefreshToken', res.data.refresh_token)
                        const { config } = error
                        requests.forEach((cb) => cb(store.getters.headers.Authorization))
                        requests = []
                        console.log(config)
                        return apiRequest(config)
                    })
                    .catch((err) => {
                        console.log('刷新token失敗，登出', err)
                        store.dispatch('logOut')
                        router.push({ path: '/' })
                    })
                    .finally(() => {
                        isRefreshing = false
                        store.commit('loaded')
                    })
            } else {
                // 正在刷新token，返回一個未執行resolve的promise
                return new Promise((resolve) => {
                    // 將resolve放進隊列，用一個函數形式來保存，等token刷新後直接執行
                    requests.push((token: string) => {
                        const { config } = error
                        config.baseURL = ''
                        config.headers.Authorization = token
                        resolve(apiRequest(config))
                    })
                    console.log(requests)
                })
            }
        }
        if (!window.navigator.onLine) {
            alert('網路出了點問題，請重新連線後重整網頁')
            return
        }
        return Promise.reject(error)
    },
)

export default apiRequest
