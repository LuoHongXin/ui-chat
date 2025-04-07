import { defineStore } from 'pinia';
import { fetchToken, fetchUserInfo } from '../utils/auth';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        token: null,
        userInfo: import.meta.env.DEV ? {
            "id": "1145",
            "email": "luohx@winhong.com",
            "phone": "15360755056",
            "realName": "罗宏鑫",
            "birthday": "1996-12-16",
            "avatar": "https://portal.winhong.com/api/v1/files/portal/2023/6/9/avatar-729409-md1gy2-1686273729309.png",
            "staffNo": "WHXX00173",
            "status": "WORKING",
            "dateJoin": "2020-08-27",
            "sex": "MALE",
            "probationComplete": "2020-12-01",
            "owner": {
                "id": null,
                "name": null,
                "type": "INTERNAL"
            }
        } : null,
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
