import { defineStore } from 'pinia';
import { fetchToken, fetchUserInfo } from '../utils/auth';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        token: null,
        userInfo: null,
        code: null
    }),
    actions: {
        setCode(code) {
            this.code = code;
        },
        async getToken() {
            if (!this.code) {
                return null;
            }
            const tokenData = await fetchToken(this.code);
            if (tokenData && tokenData.access_token) {
                this.token = tokenData.access_token;
                return tokenData.access_token;
            }
            return null;
        },
        async getUserInfo() {
            if (!this.token) {
                await this.getToken();
            }
            if (!this.token) {
                return null;
            }
            const userInfo = await fetchUserInfo(this.token);
            if (userInfo) {
                this.userInfo = userInfo;
                return userInfo;
            }
            return null;
        }
    }
});
