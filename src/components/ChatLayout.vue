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

// 状态管理
const assistants = ref([]);
const currentAssistant = ref(null);
const currentChat = ref({ id: null, messages: [] });
const isLoading = ref(false);

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

async function loadChats(assistantId) {
  try {
    const response = await instance.get(
      `/api/v1/chats/${assistantId}/sessions?page=1&page_size=100&orderby=update_time&desc=false`
    );
    if (response.data.code === 0) {
      return response.data.data;
    } else {
      ElMessage.error("获取对话列表失败");
      return [];
    }
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
function createNewChat() {
  if (!currentAssistant.value) return;

  const newChat = {
    id: generateRandomId(),
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

async function deleteChat(id) {
  try {
    await ElMessageBox.confirm(
      "删除后，聊天记录将不可恢复。",
      "确定删除对话？",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }
    );

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

      ElMessage.success("对话删除成功");
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

function selectChat(chat) {
  currentChat.value = chat;
  scrollToBottom();
}

// 消息管理
async function sendMessage(value, isNew) {
  if (isNew) {
    createNewChat();
  }
  if (!value.trim()) return;
  if (!currentAssistant.value) {
    ElMessage.warning("请先选择一个助理");
    return;
  }

  const userMessage = {
    role: "user",
    content: value,
    id: Date.now().toString(),
  };
  currentChat.value.messages.push(userMessage);
  const originalInput = value;
  isLoading.value = true;

  scrollToBottom();

  try {
    let sessionId = currentChat.value.id;
    if (currentChat.value.isTemp) {
      const createSessionResponse = await instance.post(
        `/api/v1/chats/${currentAssistant.value.id}/sessions`,
        {
          conversation_id: sessionId,
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
        sessionId = createSessionResponse.data.data.id;
        currentChat.value.id = sessionId;
        currentChat.value.isTemp = false;
      } else {
        ElMessage.error("创建会话失败");
        currentChat.value.messages.pop();
        return;
      }
    }

    const response = await instance.post(
      `/api/v1/chats/${currentAssistant.value.id}/completions`,
      {
        question: originalInput,
        session_id: sessionId,
        stream: false,
      }
    );

    if (response.data.code === 0) {
      const aiMessage = {
        role: "assistant",
        content: response.data.data.answer,
        id: response.data.data.id,
      };
      currentChat.value.messages.push(aiMessage);
      scrollToBottom();
    } else {
      ElMessage.error("获取AI回答失败");
      currentChat.value.messages.pop();
    }
  } catch (error) {
    console.error("发送消息失败:", error);
    ElMessage.error("发送消息失败");
    currentChat.value.messages.pop();
  } finally {
    isLoading.value = false;
    scrollToBottom();
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
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-color: transparent;
  position: relative;
  z-index: 0;
}
</style>