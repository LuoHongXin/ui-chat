<template>
  <div class="chat-container">
    <AssistantList
      :assistants="assistants"
      :currentAssistant="currentAssistant"
      @select-assistant="selectAssistant"
    />
    <ChatHistory
      :currentAssistant="currentAssistant"
      :currentChat="currentChat"
      @create-chat="createNewChat"
      @select-chat="selectChat"
      @delete-chat="deleteChat"
    />
    <ChatMain
      :currentChat="currentChat"
      :isLoading="isLoading"
      @send-message="sendMessage"
      @copy-message="copyMessage"
      @regenerate-message="regenerateMessage"
      @delete-message="deleteMessage"
      @update-loading="updateLoadingStatus"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import instance from "../utils/auth";
import AssistantList from "./AssistantList.vue";
import ChatHistory from "./ChatHistory.vue";
import ChatMain from "./ChatMain.vue";
import {
  getUserSessions,
  createUserSession,
  deleteUserSession,
} from "../utils/sessions";
import { useAuthStore } from "../stores/auth";
const authStore = useAuthStore();

// 状态管理
const assistants = ref([]);
const currentAssistant = ref(null);
const currentChat = ref({ id: null, messages: [] });
const isLoading = ref(false);

// 更新loading状态
function updateLoadingStatus(status) {
  isLoading.value = status;
}

// 从API加载数据
onMounted(() => {
  loadAssistants();
});

async function loadAssistants() {
  try {
    const response = await instance.get(
      `/api/v1/chats?page=1&page_size=999&orderby=update_time`
    );
    if (response.data.code === 0) {
      assistants.value = response.data.data;
      if (assistants.value.length > 0) {
        selectAssistant(assistants.value[0]);
      }
    } else {
      ElMessage.error("获取助理列表失败");
    }
  } catch (error) {
    console.error("加载助理列表失败:", error);
    ElMessage.error("加载助理列表失败");
  }
}

async function loadChats(assistantId, sessionId) {
  try {
    // 如果提供了sessionId，只获取特定会话的聊天记录
    if (sessionId) {
      const response = await instance.get(
        `/api/v1/chats/${assistantId}/sessions?page=1&page_size=100&orderby=update_time&desc=false&id=${sessionId}`
      );
      if (response.data.code === 0) {
        return response.data.data;
      }
      return [];
    }

    // 获取用户会话记录
    const sessions = await getUserSessions(authStore.userInfo.id, assistantId);
    if (!sessions || sessions.length === 0) {
      return [];
    }
    // 根据每个会话ID获取聊天记录
    let allChats = [];
    for (const session of sessions) {
      try {
        const response = await instance.get(
          `/api/v1/chats/${assistantId}/sessions?page=1&page_size=100&orderby=update_time&desc=false&id=${session.sessionId}`
        );
        if (response.data.code === 0) {
          allChats = [...response.data.data, ...allChats];
        }
      } catch (error) {
        console.error(`获取会话 ${session.SessionID} 的聊天记录失败:`, error);
      }
    }
    return allChats;
  } catch (error) {
    console.error("加载对话列表失败:", error);
    ElMessage.error("加载对话列表失败");
    return [];
  }
}

// 生成32位随机字符串
function generateRandomId() {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// 聊天记录管理
async function createNewChat() {
  if (currentChat.value && currentChat.value.isTemp) return;
  // 检查现有对话数量，如果达到三个，提示用户删除旧对话
  if (
    currentAssistant.value.chats &&
    currentAssistant.value.chats.length >= 3
  ) {
    ElMessage.warning(
      "您已创建3个对话，达到上限。请删除一个旧对话后再创建新会话。"
    );
    return;
  }

  const newChat = {
    id: generateRandomId() + "_temp",
    name: `新对话 ${(currentAssistant.value.chats || []).length + 1}`,
    messages: [
      {
        role: "assistant",
        content: "你好！我是你的助理，有什么可以帮到你的吗？",
        id: generateRandomId(),
      },
    ],
    isTemp: true,
  };

  if (!currentAssistant.value.chats) {
    currentAssistant.value.chats = [];
  }
  currentAssistant.value.chats.unshift(newChat);
  currentChat.value = newChat;
}

async function deleteChat(id, skipConfirm = false) {
  try {
    if (!skipConfirm) {
      await ElMessageBox.confirm(
        "删除后，聊天记录将不可恢复。",
        "确定删除对话？",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      );
    }

    const chat = currentAssistant.value.chats.find((c) => c.id === id);
    if (chat && chat.isTemp) {
      currentAssistant.value.chats = currentAssistant.value.chats.filter(
        (c) => c.id !== id
      );

      if (currentChat.value.id === id) {
        currentChat.value =
          currentAssistant.value.chats.length > 0
            ? currentAssistant.value.chats[0]
            : { id: null, messages: [] };
      }
      if (!skipConfirm) {
        ElMessage.success("对话删除成功");
      }
      return;
    }

    const response = await instance.delete(
      `/api/v1/chats/${currentAssistant.value.id}/sessions`,
      {
        data: {
          ids: [id],
        },
      }
    );

    if (response.data.code === 0) {
      currentAssistant.value.chats = currentAssistant.value.chats.filter(
        (chat) => chat.id !== id
      );

      if (currentChat.value.id === id) {
        currentChat.value =
          currentAssistant.value.chats.length > 0
            ? currentAssistant.value.chats[0]
            : { id: null, messages: [] };
      }

      // 删除用户会话记录
      try {
        await deleteUserSession(id);
      } catch (error) {
        console.error("删除用户会话记录失败:", error);
      }

      ElMessage.success("对话删除成功");
    } else {
      ElMessage.error("删除对话失败");
    }
  } catch (error) {
    if (error === "cancel") {
      return;
    }
    console.error("删除对话失败:", error);
    ElMessage.error("删除对话失败");
  }
}

// 助理和对话选择
async function selectAssistant(assistant) {
  currentAssistant.value = assistant;
  const chats = await loadChats(assistant.id);
  currentAssistant.value.chats = chats;
  currentChat.value = chats.length > 0 ? chats[0] : { id: null, messages: [] };
}

async function selectChat(chat) {
  if (!currentAssistant.value) return;
  const updatedChats = await loadChats(currentAssistant.value.id, chat.id);
  if (updatedChats && updatedChats.length > 0) {
    currentChat.value = updatedChats[0];
  } else {
    currentChat.value = chat;
  }
  scrollToBottom();
}

// 消息管理
import { fetchEventSource } from "@microsoft/fetch-event-source";

async function sendMessage(value, isNew) {
  if (isNew) {
    createNewChat();
  }
  if (!value.trim()) return;
  if (!currentAssistant.value) {
    ElMessage.warning("请先选择一个助理");
    return;
  }

  // 记录发送消息时的对话ID
  let originalChatId = currentChat.value.id;
  const userMessage = {
    role: "user",
    content: value,
    id: Date.now().toString(),
  };

  // 确保当前对话仍然是发送消息时的对话
  if (currentChat.value.id === originalChatId) {
    currentChat.value.messages.push(userMessage);
  }
  const originalInput = value;
  isLoading.value = true;

  scrollToBottom();

  try {
    if (currentChat.value.isTemp) {
      // 新建对话
      const createSessionResponse = await instance.post(
        `/api/v1/chats/${currentAssistant.value.id}/sessions`,
        {
          dialog_id: currentAssistant.value.id,
          is_new: true,
          message: [
            {
              role: "assistant",
              content: "你好！ 我是你的助理，有什么可以帮到你的吗？",
            },
          ],
          name: value,
        }
      );

      if (createSessionResponse.data.code === 0) {
        // 确保当前对话仍然是发送消息时的对话
        if (currentChat.value.id === originalChatId) {
          originalChatId = createSessionResponse.data.data.id;
          currentChat.value.id = originalChatId; // 更新对话ID
          currentChat.value.isTemp = false;
        }

        // 创建用户会话记录
        await createUserSession({
          chatId: currentAssistant.value.id,
          sessionId: originalChatId,
          userId: authStore.userInfo.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      } else {
        ElMessage.error("创建会话失败");
        // 确保当前对话仍然是发送消息时的对话
        if (currentChat.value.id === originalChatId) {
          currentChat.value.messages.pop();
        }
        return;
      }
    }

    // 创建AI消息对象
    const aiMessage = {
      role: "assistant",
      content: "",
      id: Date.now().toString(),
    };

    // 获取token
    const headers = instance.defaults.headers;
    const baseUrl = instance.defaults.baseURL || "";
    // 使用fetchEventSource处理流式响应
    await fetchEventSource(
      `${baseUrl}/api/v1/chats/${currentAssistant.value.id}/completions`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          question: originalInput,
          session_id: originalChatId,
          stream: true,
        }),
        // onopen() {
        // },
        onmessage(event) {
          try {
            const data = JSON.parse(event.data);
            if (data.code === 0 && currentChat.value.id === originalChatId) {
              // 更新AI回答内容，使用响应式API确保界面实时更新
              const answer = data.data.answer;
              if (answer) {
                const thinkIndex = answer.lastIndexOf("</think>");
                const finalAnswer =
                  thinkIndex !== -1 ? answer.substring(thinkIndex + 8) : null;
                if (finalAnswer) {
                  if (isLoading.value) {
                    // 有值显示才去掉加载动画
                    isLoading.value = false;
                    // 确保当前对话仍然是发送消息时的对话
                    currentChat.value.messages.push(aiMessage);
                  }
                  currentChat.value.messages[
                    currentChat.value.messages.length - 1
                  ].content = finalAnswer;
                }
              }
              scrollToBottom();
            }
          } catch (error) {
            console.error("解析消息失败:", error);
          }
        },
        onerror(error) {
          console.error("流式响应错误:", error);
          ElMessage.error("获取AI回答失败");
          if (currentChat.value.id === originalChatId) {
            currentChat.value.messages.pop();
          }
        },
      }
    );
  } catch (error) {
    console.error("发送消息失败:", error);
    ElMessage.error("发送消息失败");
    // 确保当前对话仍然是发送消息时的对话
    if (currentChat.value.id === originalChatId) {
      currentChat.value.messages.pop();
    }
  } finally {
    isLoading.value = false;
    // 确保当前对话仍然是发送消息时的对话
    if (currentChat.value.id === originalChatId) {
      scrollToBottom();
    }
  }
}

// 复制消息内容
async function copyMessage(message) {
  try {
    await navigator.clipboard.writeText(message.content);
    ElMessage.success("复制成功");
  } catch (err) {
    ElMessage.error("复制失败");
  }
}

// 重新生成消息
async function regenerateMessage(message) {
  sendMessage(message.content);
}

// 删除消息
function deleteMessage(message) {
  ElMessage.warning("请通过API删除消息");
}

// 滚动到最新消息
function scrollToBottom() {
  nextTick(() => {
    const messageContainer = document.querySelector(".chat-messages");
    if (messageContainer) {
      messageContainer.scrollTop = messageContainer.scrollHeight;
    }
  });
}
</script>

<style lang="scss" scoped>
.chat-container {
  box-sizing: border-box;
  padding: 8px 8px 8px 0;
  display: flex;
  height: 100%;
  width: 100%;
  background-image: url("../assets/pageBg.svg");
  background-size: auto;
  background-repeat: no-repeat;
  background-color: transparent;
  position: relative;
  z-index: 0;
}
</style>