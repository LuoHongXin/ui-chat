import instance from "./auth";
import { API_CONFIG } from '../config';

/**
 * 创建用户会话记录
 * @param {Object} sessionData - 会话数据
 * @param {string} sessionData.chatId - 聊天ID
 * @param {string} sessionData.sessionId - 会话ID
 * @param {string} sessionData.userId - 用户ID
 * @param {string} sessionData.createdAt - 创建时间
 * @param {string} sessionData.updatedAt - 更新时间
 * @param {string} sessionData.deletedAt - 删除时间
 * @param {number} sessionData.id - 会话记录ID
 * @returns {Promise<Object>} 返回创建的会话记录
 */
export async function createUserSession(sessionData) {
    try {
        const response = await instance.post(
            `${import.meta.env.VITE_CURL_SERVER || API_CONFIG.CURL_SERVER}/user-sessions`,
            sessionData
        );
        if (response.status === 201) {
            return response;
        } else {
            console.error("Failed to create user session");
            throw new Error("Failed to create user session");
        }
    } catch (error) {
        console.error("Error creating user session:", error);
        throw error;
    }
}

/**
 * 获取用户会话记录
 * @param {string} userId - 用户ID
 * @returns {Promise<Array>} 返回用户会话记录数组
 */
export async function getUserSessions(userId, chatId) {
    try {
        const response = await instance.get(
            `${import.meta.env.VITE_CURL_SERVER || API_CONFIG.CURL_SERVER}/user-sessions?userId=${userId}&chatId=${chatId}`
        );
        if (response.status === 200) {
            return response.data;
        } else {
            console.error("Failed to fetch user sessions");
            return [];
        }
    } catch (error) {
        console.error("Error fetching user sessions:", error);
        return [];
    }
}

/**
 * 删除用户会话记录
 * @param {number} id - 会话记录ID
 * @returns {Promise<Object>} 返回删除操作的响应
 */
export async function deleteUserSession(id) {
    try {
        const response = await instance.delete(
            `${import.meta.env.VITE_CURL_SERVER || API_CONFIG.CURL_SERVER}/user-sessions/${id}`
        );
        if (response.status === 200) {
            return response;
        } else {
            console.error("Failed to delete user session");
            throw new Error("Failed to delete user session");
        }
    } catch (error) {
        console.error("Error deleting user session:", error);
        throw error;
    }
}

/**
 * 提交用户不满意反馈
 * @param {Object} feedbackData - 反馈数据
 * @param {string} feedbackData.messageId - 消息ID
 * @param {string} feedbackData.userId - 用户ID
 * @param {string} feedbackData.content - 反馈内容
 * @returns {Promise<Object>} 返回提交反馈的响应
 */
export async function postUnsatisfiedResponse(feedbackData) {
    try {
        const response = await instance.post(
            `${import.meta.env.VITE_CURL_SERVER || API_CONFIG.CURL_SERVER}/unsatisfied-responses`,
            feedbackData
        );
        if (response.status === 201) {
            return response;
        } else {
            console.error("Failed to submit unsatisfied response");
            throw new Error("Failed to submit unsatisfied response");
        }
    } catch (error) {
        console.error("Error submitting unsatisfied response:", error);
        throw error;
    }
}