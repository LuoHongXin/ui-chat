import { API_CONFIG } from '../config';

// 获取cookie中的token
export function getToken() {
    return document.cookie.split(';').find(c => c.trim().startsWith('SESSION='))?.split('=')[1];
}

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

// 检查token并处理授权
export function checkAuth() {
    const token = getToken();
    if (!token) {
        redirectToAuth();
        return false;
    }
    return true;
}