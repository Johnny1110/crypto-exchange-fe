// src/services/apiService.js
import axios from 'axios'

const BASE_URL = 'http://34.81.155.101:8080'

const apiClient = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
})

export const marketAPI = {
    // 獲取所有市場數據
    getAllMarkets() {
        return apiClient.get('/api/v1/markets')
    },

    // 獲取特定市場數據
    getMarketData(market) {
        return apiClient.get(`/api/v1/market/${market}`)
    }
}

export const userAPI = {
    // 用戶註冊
    register(username, password) {
        return apiClient.post('/api/v1/users/register', {
            username,
            password
        })
    },

    // 用戶登入
    login(username, password) {
        return apiClient.post('/api/v1/users/login', {
            username,
            password
        })
    },

    // 用戶登出
    logout() {
        return apiClient.post('/api/v1/users/logout')
    },

    // 獲取用戶資料
    getProfile() {
        return apiClient.get('/api/v1/users/profile')
    }
}

// 錯誤處理攔截器
apiClient.interceptors.response.use(
    response => response,
    error => {
        console.error('API Error:', error)
        return Promise.reject(error)
    }
)

// 請求攔截器 - 自動添加 token
apiClient.interceptors.request.use(
    config => {
        const token = localStorage.getItem('cryptoex_token')
        if (token) {
            config.headers.Authorization = token
        }
        return config
    },
    error => {
        return Promise.reject(error)
    }
)