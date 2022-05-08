import { createStore } from 'vuex'

export default createStore({
  state: {
    token: localStorage.getItem('token') || '',
    refreshToken: localStorage.getItem('refreshToken') || ''
  },
  mutations: {
    setAccessToken(state, newAccessToken) {
      state.token = newAccessToken
      localStorage.setItem('token', newAccessToken);
    },
    setRefreshToken(state, newRefreshToken) {
      state.refreshToken = newRefreshToken
      localStorage.setItem('refreshToken', newRefreshToken);
    },
    clearToken(state) {
      state.token = '';
      localStorage.setItem('token', '');
      state.refreshToken = '';
      localStorage.setItem('refreshToken', '');
    }
  },
  actions: {
  },
  modules: {
  },
  getters: {
    isAuthenticated: (state) => {
      return state.token.length > 0;
    },
    headers: (state) => {
      return {
        'Authorization': `Bearer ${state.token}`,
      }
    }
  }
})
