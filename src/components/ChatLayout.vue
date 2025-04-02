<template>
  <div class="chat-container">
    <!-- 助理列表 -->
    <div class="assistant-list">
      <div class="logo-container">
        <img src="../assets/logo-White.png" alt="logo" class="logo-image" />
      </div>
      <div
        v-for="assistant in assistants"
        :key="assistant.id"
        :class="[
          'assistant-item',
          { active: currentAssistant?.id === assistant.id },
        ]"
        shadow="hover"
        @click="selectAssistant(assistant)"
      >
        <el-tooltip
          :content="assistant.description"
          placement="top"
          :hide-after="0"
        >
          <div class="assistant-item-content">
            <div class="assistant-avatar">
              <img
                :src="assistant.avatar || winhongAvatar"
                :alt="assistant.name"
              />
            </div>
            <div class="assistant-info">
              <div class="assistant-name">{{ assistant.name }}</div>
            </div>
          </div>
        </el-tooltip>
      </div>
    </div>

    <!-- 聊天记录列表 -->
    <div class="chat-history">
      <el-button
        @click="createNewChat"
        class="new-chat-btn"
        :disabled="!currentAssistant"
        style="display: flex; justify-content: flex-start; gap: 8px"
      >
        <el-icon style="margin-right: 8px"><Plus /></el-icon>
        新建对话
      </el-button>
      <div v-if="!currentAssistant?.chats?.length" class="empty-state">
        暂无历史对话
      </div>
      <el-card
        v-else
        v-for="chat in currentAssistant?.chats || []"
        :key="chat.id"
        :class="['chat-history-item', { active: currentChat.id === chat.id }]"
        shadow="hover"
        @click="selectChat(chat)"
      >
        <div class="chat-history-item-content">
          <el-tooltip :content="chat.name" placement="top" :hide-after="0">
            <span class="chat-name">{{ chat.name }}</span>
          </el-tooltip>
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
                :src="message.role === 'user' ? userAvatar : aiAvatar"
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
                <el-tooltip content="复制" placement="top" :hide-after="0">
                  <el-button size="small" text @click="copyMessage(message)">
                    <el-icon><CopyDocument /></el-icon>
                  </el-button>
                </el-tooltip>
              </el-button-group>
            </div>

            <div
              class="message-content"
              :class="{ 'has-actions': true }"
              v-html="md.render(removeThinkContent(message.content))"
            ></div>
          </div>
        </div>
        <div v-if="isLoading" class="message">
          <div class="message-wrapper assistant">
            <div class="avatar">
              <img :src="aiAvatar" alt="assistant" />
            </div>
            <div class="message-content loading">
              <el-icon class="is-loading"><Loading /></el-icon> AI正在思考中...
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
import { ref, onMounted, nextTick } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import instance from "../utils/auth";
import {
  Promotion,
  Delete,
  CopyDocument,
  Refresh,
  Plus,
  Loading,
} from "@element-plus/icons-vue";
import aiAvatar from "../assets/ai-avatar.svg";
import userAvatar from "../assets/user-avatar.svg";
import winhongAvatar from "../assets/winhong.ico";
import MarkdownIt from "markdown-it";
const md = new MarkdownIt();
const SendIcon = Promotion;

// 状态管理
const assistants = ref([]);
const currentAssistant = ref(null);
const currentChat = ref({ id: null, messages: [] });
const messageInput = ref("");
const isLoading = ref(false);

// 从API加载数据
onMounted(() => {
  loadAssistants();
});
// 移除消息中的思考过程
function removeThinkContent(content) {
  return content.replace(/<think>.*?<\/think>/gs, "").replace(/##\d+\$\$/g, "");
}
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
    id: generateRandomId(), // 使用32位随机字符串作为临时ID
    name: `新对话 ${(currentAssistant.value.chats || []).length + 1}`,
    messages: [
      {
        role: "assistant",
        content: "你好！我是你的助理，有什么可以帮到你的吗？",
        id: generateRandomId(),
      },
    ],
    isTemp: true, // 添加临时标识
  };

  if (!currentAssistant.value.chats) {
    currentAssistant.value.chats = [];
  }
  currentAssistant.value.chats.unshift(newChat);
  currentChat.value = newChat;
}

async function deleteChat(id) {
  try {
    await ElMessageBox.confirm("确定删除吗?", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });

    const chat = currentAssistant.value.chats.find((c) => c.id === id);
    if (chat && chat.isTemp) {
      // 如果是临时对话，直接从列表中移除
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
      // 从对话列表中移除该对话
      currentAssistant.value.chats = currentAssistant.value.chats.filter(
        (chat) => chat.id !== id
      );

      // 如果删除的是当前对话，则切换到其他对话或清空显示
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
async function sendMessage(value) {
  let msg = value || messageInput.value;
  if (!msg.trim()) return;
  if (!currentAssistant.value) {
    ElMessage.warning("请先选择一个助理");
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
  isLoading.value = true;

  scrollToBottom();

  try {
    // 如果是临时会话ID，先创建新会话
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
          name: msg,
        }
      );

      if (createSessionResponse.data.code === 0) {
        sessionId = createSessionResponse.data.data.id;
        currentChat.value.id = sessionId;
        currentChat.value.isTemp = false;
      } else {
        ElMessage.error("创建会话失败");
        currentChat.value.messages.pop();
        messageInput.value = originalInput;
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
      messageInput.value = originalInput;
    }
  } catch (error) {
    console.error("发送消息失败:", error);
    ElMessage.error("发送消息失败");
    currentChat.value.messages.pop();
    messageInput.value = originalInput;
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
  padding: 8px 0;
  display: flex;
  height: 100%;
  width: 100%;
  background-image: url("../assets/pageBg.png");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-color: transparent;
  position: relative;
  z-index: 0;
}

.assistant-list {
  width: 72px;
  background-color: transparent;
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  padding: 12px;
  position: relative;
  padding-top: 100px;
}

.logo-container {
  width: 72px;
  position: absolute;
  top: 12px;
}

.logo-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.chat-history {
  width: 250px;
  background-color: rgba(245, 245, 245, 1);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  padding: 16px;
  position: relative;
}

.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-color-secondary);
  font-size: 14px;
  color: #83878f;
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
}

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
  }
}
.assistant-item {
  width: 100%;
  margin-bottom: 24px;
  cursor: pointer;
}

.chat-history-item-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px;
  color: var(--message-text);

  .chat-name {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: left;
  }
}
.assistant-item-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  fonts-size: 12px;
  color: var(--assistant-text-color);
  &:hover {
    color: var(--assistant-text-light-color);
    .assistant-avatar {
      background-color: rgba(255, 255, 255, 0.2);
    }
  }
  .assistant-avatar {
    margin-bottom: 4px;
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    img {
      width: 24px;
      height: 24px;
      object-fit: contain;
    }
  }
}
.active {
  .chat-history-item-content,
  .assistant-item-content {
    color: var(--assistant-text-light-color);
    .assistant-avatar {
      background-color: rgba(255, 255, 255, 0.2);
    }
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
        right: 60px;
      }
    }

    &.assistant {
      .message-content {
        margin-left: 12px;
      }

      .message-actions {
        left: 60px;
      }
    }

    &:hover .message-actions {
      display: flex;
      gap: 4px;
      padding: 4px;
    }

    .avatar {
      width: 32px;
      height: 32px;
      border-radius: 4px;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: var(--chat-bg);
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
      word-break: break-word;
      padding: 10px 14px;
      border-radius: 4px;
      background-color: var(--message-bg);
      max-width: 70%;
      position: relative;
      text-align: left;

      :deep(p) {
        margin: 0.5em 0;
      }

      :deep(pre) {
        background-color: var(--code-bg);
        padding: 1em;
        border-radius: 4px;
        overflow-x: auto;
      }

      :deep(code) {
        font-family: monospace;
        background-color: var(--code-bg);
        padding: 0.2em 0.4em;
        border-radius: 3px;
      }

      :deep(ul),
      :deep(ol) {
        padding-left: 1.5em;
        margin: 0.5em 0;
      }

      :deep(blockquote) {
        margin: 0.5em 0;
        padding-left: 1em;
        border-left: 4px solid var(--border-color);
        color: var(--text-color-secondary);
      }

      &.has-actions {
        margin-top: 24px;
      }

      &.loading {
        display: flex;
        align-items: center;
        gap: 8px;
        .is-loading {
          animation: rotating 2s linear infinite;
        }
      }
    }
  }
}

.assistant-info {
  .assistant-name {
    font-size: 14px;
    font-weight: bolder;
  }
}

@keyframes rotating {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>