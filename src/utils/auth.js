import axios from 'axios';
import { API_CONFIG } from '../config';
import { useAuthStore } from '../stores/auth';

// 创建axios实例
const instance = axios.create({
    baseURL: API_CONFIG.API_SERVER,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// 请求拦截器
instance.interceptors.request.use(
    config => {
        const token = getToken();
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

// 响应拦截器
instance.interceptors.response.use(
    response => response,
    error => {
        if (error.response && error.response.status === 401) {
            redirectToAuth();
            return Promise.reject(error);
        }
        return Promise.reject(error);
    }
);

// 生成随机state
export function generateState() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// 重定向到授权页面
export function redirectToAuth() {
    const state = generateState();
    const authUrl = `https://account.qiyeyun.co/authorize?response_type=code&client_id=${API_CONFIG.appId}&scope=profile&state=${state}`;
    window.location.href = authUrl;
}

// 从store获取token
export function getToken() {
    const authStore = useAuthStore();
    return authStore.token;
}

// 从API获取token
export async function fetchToken(code) {
    try {
        const credentials = btoa(`${API_CONFIG.appId}:${API_CONFIG.securityKey}`);
        const formData = new URLSearchParams();
        formData.append('grant_type', 'authorization_code');
        formData.append('client_id', API_CONFIG.appId);
        formData.append('code', code);

        const response = await instance.post('/api/v1/oauth2/token', formData, {
            headers: {
                'Authorization': `Basic ${credentials}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching token:', error);
        return null;
    }
}

// 获取用户信息
export async function fetchUserInfo(accessToken) {
    try {
        const response = await instance.get('/api/v1/oauth2/userinfo', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching user info:', error);
        return null;
    }
}

// 导出axios实例供其他模块使用
export default instance;