<template>
  <div class="chat-main">
    <div class="chat-messages" ref="messageContainer">
      <div
        v-for="message in currentChat.messages"
        :key="message.id"
        class="message"
      >
        <div :class="['message-wrapper', message.role]">
          <div class="avatar" v-if="message.role === 'assistant'">
            <img :src="aiAvatar" alt="assistant" />
          </div>
          <div class="message-actions" :class="message.role">
            <el-button-group v-if="message.role === 'user'">
              <el-tooltip content="复制" placement="top" :hide-after="0">
                <el-button
                  size="small"
                  text
                  @click="$emit('copy-message', message)"
                >
                  <el-icon><CopyDocument /></el-icon>
                </el-button>
              </el-tooltip>
              <el-tooltip content="重新生成" placement="top" :hide-after="0">
                <el-button
                  size="small"
                  text
                  @click="$emit('regenerate-message', message)"
                >
                  <el-icon><Refresh /></el-icon>
                </el-button>
              </el-tooltip>
              <!-- <el-tooltip content="删除" placement="top" :hide-after="0">
                <el-button
                  size="small"
                  text
                  type="danger"
                  @click="$emit('delete-message', message)"
                  ><el-icon><Delete /></el-icon
                ></el-button>
              </el-tooltip> -->
            </el-button-group>
            <el-button-group v-else>
              <el-tooltip content="复制" placement="top" :hide-after="0">
                <el-button
                  size="small"
                  text
                  @click="$emit('copy-message', message)"
                >
                  <el-icon><CopyDocument /></el-icon>
                </el-button>
              </el-tooltip>
              <el-tooltip content="喜欢" placement="top" :hide-after="0">
                <el-button
                  size="small"
                  text
                  @click="$emit('like-message', message)"
                >
                  <el-icon><img :src="likeStar" alt="assistant" /></el-icon>
                </el-button>
              </el-tooltip>
              <el-tooltip content="不喜欢" placement="top" :hide-after="0">
                <el-button size="small" text @click="handleDislike(message)">
                  <el-icon><img :src="unLikeStar" alt="assistant" /></el-icon>
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
      <!-- 没有对话内容时 -->
      <div class="no-chat-messages" v-if="currentChat.messages.length === 0">
        <div class="no-chat-messages-text-title">
          您好！我是您的智能助手，请问有什么可以帮到您的吗？
        </div>
        <div class="input-wrapper">
          <el-input
            v-model="messageInput"
            type="textarea"
            :rows="3"
            placeholder="请输入消息"
            @keyup.enter="handleSendMessage(true)"
            class="message-textarea"
          />
          <el-tooltip content="发送" placement="top" :hide-after="0">
            <el-button
              type="primary"
              class="send-button"
              @click="handleSendMessage(true)"
              :disabled="!messageInput.trim()"
            >
              <el-icon><SendIcon /></el-icon>
            </el-button>
          </el-tooltip>
        </div>
      </div>
    </div>
    <FeedbackDialog
      v-model:visible="showFeedbackDialog"
      @submit="handleFeedbackSubmit"
    />
    <div v-if="currentChat.messages.length > 0" class="chat-input">
      <div class="input-wrapper">
        <el-input
          v-model="messageInput"
          type="textarea"
          :rows="3"
          placeholder="请输入消息"
          @keyup.enter="handleSendMessage()"
          class="message-textarea"
        />
        <el-tooltip content="发送" placement="top" :hide-after="0">
          <el-button
            type="primary"
            class="send-button"
            @click="handleSendMessage()"
            :disabled="!messageInput.trim()"
          >
            <el-icon><SendIcon /></el-icon>
          </el-button>
        </el-tooltip>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import {
  Promotion as SendIcon,
  Delete,
  CopyDocument,
  Refresh,
  Loading,
  Star,
  CircleClose,
} from "@element-plus/icons-vue";
import { postUnsatisfiedResponse } from "../utils/sessions";
import FeedbackDialog from "./FeedbackDialog.vue";
import aiAvatar from "../assets/ai-avatar.svg";
import unLikeStar from "../assets/thumb-down-line.svg";
import likeStar from "../assets/thumb-up-line.svg";
// import userAvatar from "../assets/user-avatar.svg";
import MarkdownIt from "markdown-it";
import { useAuthStore } from "../stores/auth";
const authStore = useAuthStore();

const md = new MarkdownIt();
const messageInput = ref("");
const showFeedbackDialog = ref(false);

const props = defineProps({
  currentChat: {
    type: Object,
    default: () => ({ id: null, messages: [] }),
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits([
  "send-message",
  "copy-message",
  "regenerate-message",
  "delete-message",
  "like-message",
  "dislike-message",
  "update-loading",
]);

// 监听currentChat的变化
watch(
  () => props.currentChat.id,
  (newId, oldId) => {
    if (oldId && newId !== oldId && !oldId.includes("temp")) {
      // 切换对话时，通知父组件更新loading状态
      emit("update-loading", false);
    }
  }
);

function removeThinkContent(content) {
  if (!content) return "";
  try {
    const jsonData = JSON.parse(content);
    if (jsonData.data?.data?.answer) {
      return jsonData.data.data.answer;
    }
  } catch (e) {
    // 非 JSON 格式，使用原有逻辑处理
  }
  return content.replace(/<think>.*?<\/think>/gs, "").replace(/##\d+\$\$/g, "");
}

function handleSendMessage(isTemp) {
  emit("send-message", messageInput.value, isTemp);
  messageInput.value = "";
}

async function handleFeedbackSubmit(feedback) {
  try {
    await postUnsatisfiedResponse({
      ...feedbackData.value,
      ...feedback,
    });
    showFeedbackDialog.value = false;
    feedbackData.value = null;
  } catch (error) {
    console.error("提交反馈失败:", error);
  }
}

const feedbackData = ref(null);

const handleDislike = (message) => {
  feedbackData.value = {
    aiAnswer: message.content,
    userId: authStore.userInfo.id,
    chatId: props.currentChat.chat_id,
    sessionId: props.currentChat.id,
  };
  showFeedbackDialog.value = true;
  emit("dislike-message", message);
};
</script>

<style lang="scss" scoped>
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
    display: flex;
    flex-direction: column;
    align-items: center;

    &::-webkit-scrollbar {
      display: none;
    }
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  .chat-input {
    padding: 24px;
    padding-top: 0;
    background-color: var(--chat-bg);
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
.input-wrapper {
  display: flex;
  position: relative;
  width: 800px;
  position: relative;
}
.message-textarea {
  flex: 1;

  :deep(.el-textarea__inner) {
    border-radius: 24px;
    resize: none;
    padding: 14px;
    background-color: var(--message-bg);
    border: 1px solid var(--border-color);
    color: var(--message-text);
    box-shadow: none;
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
  border-radius: 50%;
  background-color: var(--send-button-bg);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;

  :deep(.el-icon) {
    font-size: 16px;
  }
}

.message {
  margin-bottom: 16px;
  width: 800px;
}
.message-wrapper {
  display: flex;
  align-items: flex-start;
  margin-bottom: 16px;
  position: relative;
  padding: 8px 16px;

  &.user {
    flex-direction: row-reverse;

    .message-content {
      margin-right: 0;
      background-color: #f2f3f5;
    }

    .message-actions {
      right: 16px;
      bottom: -24px;
    }
  }

  &.assistant {
    .message-content {
      margin-left: 12px;
    }

    .message-actions {
      left: 60px;
      bottom: -24px;
    }
  }
  &:hover .message-actions {
    display: flex;
    gap: 4px;
    padding: 4px;
  }
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--chat-bg);
}

.message-actions {
  position: absolute;
  display: none;
  z-index: 10;
  :deep(.el-button--small) {
    border-radius: 4px;
    padding: 4px;
    margin-right: 4px;
  }
  :deep(.el-button) {
    color: var(--message-text);
  }
}

.message-content {
  word-break: break-word;
  padding: 8px 16px;
  border-radius: 12px;
  max-width: 70%;
  position: relative;
  text-align: left;
  font-size: 16px;
  :deep(p) {
    margin: 0;
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

  &.loading {
    display: flex;
    align-items: center;
    gap: 8px;
    .is-loading {
      animation: rotating 2s linear infinite;
    }
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
.no-chat-messages {
  margin: auto;
  .no-chat-messages-text-title {
    font-size: 32px;
    font-weight: 500;
    color: #1f2229;
    margin-bottom: 32px;
  }
}
</style>