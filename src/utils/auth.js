import axios from 'axios';
import { API_CONFIG } from '../config';
import { useAuthStore } from '../stores/auth';

// 创建用于认证的axios实例
const authInstance = axios.create({
    timeout: API_CONFIG.timeout
});

// 创建用于API请求的axios实例
const apiInstance = axios.create({
    baseURL: API_CONFIG.API_SERVER,
    timeout: API_CONFIG.timeout,
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_CONFIG.API_KEY}`
    }
});

// API实例的请求拦截器
apiInstance.interceptors.request.use(
    config => {
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

// API实例的响应拦截器
apiInstance.interceptors.response.use(
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
    // 开发环境使用模拟token
    if (import.meta.env.DEV) {
        const authStore = useAuthStore();
        authStore.token = 'dev_mock_token';
        authStore.userInfo = {
            name: 'Dev User',
            email: 'dev@example.com'
        };
        return;
    }

    // 生产环境执行实际授权跳转
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

        const response = await authInstance.post('https://account.qiyeyun.co/api/v1/oauth2/token', formData, {
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
        const response = await authInstance.get('https://account.qiyeyun.co/api/v1/oauth2/userinfo', {
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

// 导出API实例供其他模块使用
export default apiInstance;