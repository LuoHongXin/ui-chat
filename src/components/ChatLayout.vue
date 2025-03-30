<template>
  <div class="chat-container">
    <ThemeSwitch />
    <!-- 助理列表 -->
    <div class="assistant-list">
      <div class="list-header">
        <el-button
          type="primary"
          @click="createAssistant"
          class="new-assistant-btn"
        >
          新建助理
        </el-button>
      </div>
      <el-card
        v-for="assistant in assistants"
        :key="assistant.id"
        :class="[
          'assistant-item',
          { active: currentAssistant?.id === assistant.id },
        ]"
        shadow="hover"
        @click="selectAssistant(assistant)"
      >
        <div class="assistant-item-content">
          <span>{{ assistant.name }}</span>
          <el-tooltip content="删除" placement="top" :hide-after="0">
            <el-button
              type="danger"
              size="small"
              @click.stop="deleteAssistant(assistant.id)"
            >
              <el-icon><Delete /></el-icon>
            </el-button>
          </el-tooltip>
        </div>
      </el-card>
    </div>

    <!-- 聊天记录列表 -->
    <div class="chat-history">
      <el-button
        type="primary"
        @click="createNewChat"
        class="new-chat-btn"
        :disabled="!currentAssistant"
      >
        新建对话
      </el-button>
      <el-card
        v-for="chat in currentAssistant?.chats || []"
        :key="chat.id"
        :class="['chat-history-item', { active: currentChat.id === chat.id }]"
        shadow="hover"
        @click="selectChat(chat)"
      >
        <div class="chat-history-item-content">
          <span>{{ chat.name }}</span>
          <el-tooltip content="删除" placement="top" :hide-after="0">
            <el-button
              type="danger"
              size="small"
              @click.stop="deleteChat(chat.id)"
            >
              <el-icon><Delete /></el-icon>
            </el-button>
          </el-tooltip>
        </div>
      </el-card>
    </div>

    <!-- 聊天对话界面 -->
    <div class="chat-main">
      <div class="chat-messages" ref="messageContainer">
        <div
          v-for="message in currentChat.messages"
          :key="message.id"
          class="message"
        >
          <div :class="['message-wrapper', message.role]">
            <div class="avatar">
              <img
                :src="
                  message.role === 'user'
                    ? '/user-avatar.svg'
                    : '/ai-avatar.svg'
                "
                :alt="message.role"
              />
            </div>
            <div class="message-actions" :class="message.role">
              <el-button-group v-if="message.role === 'user'">
                <el-tooltip content="复制" placement="top" :hide-after="0">
                  <el-button size="small" text @click="copyMessage(message)">
                    <el-icon><CopyDocument /></el-icon>
                  </el-button>
                </el-tooltip>
                <el-tooltip content="重新生成" placement="top" :hide-after="0">
                  <el-button
                    size="small"
                    text
                    @click="regenerateMessage(message)"
                  >
                    <el-icon><Refresh /></el-icon>
                  </el-button>
                </el-tooltip>
                <el-tooltip content="删除" placement="top" :hide-after="0">
                  <el-button
                    size="small"
                    text
                    type="danger"
                    @click="deleteMessage(message)"
                    ><el-icon><Delete /></el-icon
                  ></el-button>
                </el-tooltip>
              </el-button-group>
              <el-button-group v-else>
                <el-button size="small" text @click="copyMessage(message)"
                  >复制</el-button
                >
              </el-button-group>
            </div>

            <div class="message-content" :class="{ 'has-actions': true }">
              {{ removeThinkContent(message.content) }}
            </div>
          </div>
        </div>
      </div>
      <div class="chat-input">
        <div class="input-wrapper">
          <el-input
            v-model="messageInput"
            type="textarea"
            :rows="3"
            placeholder="请输入消息"
            @keyup.enter="sendMessage()"
            class="message-textarea"
          />
          <el-tooltip content="发送" placement="top" :hide-after="0">
            <el-button
              type="primary"
              class="send-button"
              @click="sendMessage()"
              :disabled="!messageInput.trim()"
            >
              <el-icon><SendIcon /></el-icon>
            </el-button>
          </el-tooltip>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { ElMessage } from "element-plus";
import axios from "axios";
import { API_CONFIG, ASSISTANTS } from "../config";
import ThemeSwitch from "./ThemeSwitch.vue";
import {
  Promotion,
  Delete,
  CopyDocument,
  Refresh,
} from "@element-plus/icons-vue";
const SendIcon = Promotion;

// 状态管理
const assistants = ref([]);
const currentAssistant = ref(null);
const currentChat = ref({ id: null, messages: [] });
const messageInput = ref("");

// 从API加载数据
onMounted(() => {
  loadAssistants();
});
// 移除消息中的思考过程
function removeThinkContent(content) {
  return content.replace(/<think>.*?<\/think>/gs, "");
}
async function loadAssistants() {
  try {
    const response = await axios.get(
      `${API_CONFIG.API_SERVER}/v1/dialog/list`,
      {
        headers: {
          Authorization: `Bearer ${API_CONFIG.API_KEY}`,
        },
      }
    );
    response.data = ASSISTANTS;
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
    const response = await axios.get(
      `${API_CONFIG.API_SERVER}/api/v1/chats/${assistantId}/sessions?page=1&page_size=100&orderby=create_time&desc=false`,
      {
        headers: {
          Authorization: `Bearer ${API_CONFIG.API_KEY}`,
        },
      }
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

// 助理管理
function createAssistant() {
  ElMessage.warning("请通过管理界面创建助理");
}

function deleteAssistant(id) {
  ElMessage.warning("请通过管理界面删除助理");
}

// 聊天记录管理
function createNewChat() {
  ElMessage.warning("请通过API创建对话");
}

function deleteChat(id) {
  ElMessage.warning("请通过API删除对话");
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
}

// 消息管理
async function sendMessage(value) {
  let msg = value || messageInput.value;
  if (!msg.trim()) return;
  if (!currentChat.value.id) {
    ElMessage.warning("请先选择或创建一个对话");
    return;
  }

  const userMessage = {
    role: "user",
    content: msg,
    id: Date.now().toString(),
  };
  currentChat.value.messages.push(userMessage);
  const originalInput = msg;
  messageInput.value = "";

  try {
    const response = await axios.post(
      `${API_CONFIG.API_SERVER}/api/v1/chats/${currentAssistant.value.id}/completions`,
      {
        question: originalInput,
        session_id: currentChat.value.id,
        stream: false,
      },
      {
        headers: {
          Authorization: `Bearer ${API_CONFIG.API_KEY}`,
        },
      }
    );

    if (response.data.code === 0) {
      const aiMessage = {
        role: "assistant",
        content: response.data.data.answer,
        id: response.data.data.id,
      };
      currentChat.value.messages.push(aiMessage);
    } else {
      ElMessage.error("获取AI回答失败");
      currentChat.value.messages.pop();
      messageInput.value = originalInput;
    }
  } catch (error) {
    console.error("发送消息失败:", error);
    ElMessage.error("发送消息失败");
    currentChat.value.messages.pop();
    messageInput.value = originalInput;
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
</script>

<style lang="scss" scoped>
.chat-container {
  display: flex;
  height: 100vh;
  width: 100vw;
  background-color: var(--chat-bg);
}

.assistant-list {
  width: 200px;
  background-color: var(--sidebar-bg);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  padding: 16px;

  .list-header {
    padding: 16px;
    border-bottom: 1px solid var(--border-color);
  }
}

.chat-history {
  width: 250px;
  background-color: var(--sidebar-bg);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  padding: 16px;
}

.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: var(--chat-bg);
  width: calc(100vw - 450px);
  max-width: 100%;
  overflow: hidden;

  .chat-messages {
    flex: 1;
    padding: 24px;
    overflow-y: auto;
    color: var(--message-text);
  }

  .chat-input {
    padding: 24px;
    border-top: 1px solid var(--border-color);
    background-color: var(--chat-bg);

    .input-wrapper {
      display: flex;
      position: relative;
      width: 100%;
    }
  }
}

.message-textarea {
  flex: 1;

  :deep(.el-textarea__inner) {
    border-radius: 12px;
    resize: none;
    padding: 14px;
    background-color: var(--message-bg);
    border: 1px solid var(--border-color);
    color: var(--message-text);

    &:focus {
      box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
      border: 1px solid var(--border-color);
    }
  }
}

.send-button {
  position: absolute;
  right: 28px;
  bottom: 12px;
  width: 32px;
  height: 32px;
  padding: 8px;
  border-radius: 4px;
  background-color: var(--send-button-bg);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;

  :deep(.el-icon) {
    font-size: 16px;
  }
}

.new-chat-btn,
.new-assistant-btn {
  width: 100%;
  margin-bottom: 16px;
  border-radius: 8px;
  background-color: var(--sidebar-bg);
  border: 1px solid var(--border-color);
  color: var(--message-text);
}

.assistant-item,
.chat-history-item {
  margin-bottom: 8px;
  background-color: transparent;
  border: 1px solid var(--border-color);
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 8px;
  padding: 8px 12px;
  color: var(--message-text);

  &:hover {
    background-color: var(--message-hover-bg);
  }

  &.active {
    background-color: var(--message-bg);
    border: 1px solid var(--el-color-primary-light-7);
    .chat-history-item-content,
    .assistant-item-content {
      color: var(--el-color-primary-light-7);
    }
  }

  &-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px;
    color: var(--message-text);
  }
}

.message {
  margin-bottom: 16px;

  .message-wrapper {
    display: flex;
    align-items: flex-start;
    margin-bottom: 16px;
    position: relative;
    padding: 8px 16px;

    &.user {
      flex-direction: row-reverse;

      .message-content {
        margin-right: 12px;
      }

      .message-actions {
        right: 68px;
      }
    }

    &.assistant {
      .message-content {
        margin-left: 12px;
      }

      .message-actions {
        left: 68px;
      }
    }

    &:hover .message-actions {
      display: flex;
      gap: 4px;
      padding: 4px;
    }

    .avatar {
      width: 40px;
      height: 40px;
      border-radius: 4px;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: var(--chat-bg);

      img {
        width: 24px;
        height: 24px;
        object-fit: contain;
      }
    }

    .message-actions {
      position: absolute;
      top: -6px;
      display: none;
      background: var(--sidebar-bg);
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      z-index: 10;

      :deep(.el-button) {
        color: var(--message-text);
      }
    }

    .message-content {
      white-space: pre-wrap;
      word-break: break-word;
      padding: 10px 14px;
      border-radius: 4px;
      background-color: var(--message-bg);
      max-width: 70%;
      position: relative;

      &.has-actions {
        margin-top: 24px;
      }
    }
  }
}
</style>