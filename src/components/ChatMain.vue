<template>
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
              <el-tooltip content="删除" placement="top" :hide-after="0">
                <el-button
                  size="small"
                  text
                  type="danger"
                  @click="$emit('delete-message', message)"
                  ><el-icon><Delete /></el-icon
                ></el-button>
              </el-tooltip>
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
          你好！我是你的助理，有什么可以帮到你的吗？
        </div>
        <div class="input-wrapper">
          <el-input
            v-model="messageInput"
            type="textarea"
            :rows="3"
            placeholder="请输入消息"
            @keyup.enter="$emit('send-message', messageInput)"
            class="message-textarea"
          />
          <el-tooltip content="发送" placement="top" :hide-after="0">
            <el-button
              type="primary"
              class="send-button"
              @click="$emit('send-message', messageInput)"
              :disabled="!messageInput.trim()"
            >
              <el-icon><SendIcon /></el-icon>
            </el-button>
          </el-tooltip>
        </div>
      </div>
    </div>
    <div v-if="currentChat.messages.length > 0" class="chat-input">
      <div class="input-wrapper">
        <el-input
          v-model="messageInput"
          type="textarea"
          :rows="3"
          placeholder="请输入消息"
          @keyup.enter="$emit('send-message', messageInput)"
          class="message-textarea"
        />
        <el-tooltip content="发送" placement="top" :hide-after="0">
          <el-button
            type="primary"
            class="send-button"
            @click="$emit('send-message', messageInput)"
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
import { ref } from "vue";
import {
  Promotion as SendIcon,
  Delete,
  CopyDocument,
  Refresh,
  Loading,
} from "@element-plus/icons-vue";
import aiAvatar from "../assets/ai-avatar.svg";
import userAvatar from "../assets/user-avatar.svg";
import MarkdownIt from "markdown-it";

const md = new MarkdownIt();
const messageInput = ref("");

defineProps({
  currentChat: {
    type: Object,
    default: () => ({ id: null, messages: [] }),
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
});

defineEmits([
  "send-message",
  "copy-message",
  "regenerate-message",
  "delete-message",
]);

function removeThinkContent(content) {
  return content.replace(/<think>.*?<\/think>/gs, "").replace(/##\d+\$\$/g, "");
}
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