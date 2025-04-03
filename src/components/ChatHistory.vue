<template>
  <div class="chat-history">
    <el-button
      @click="$emit('create-chat')"
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
    <div
      v-else
      v-for="chat in currentAssistant?.chats || []"
      :key="chat.id"
      :class="['chat-history-item', { active: currentChat.id === chat.id }]"
      shadow="hover"
      @click="$emit('select-chat', chat)"
    >
      <div class="chat-history-item-content">
        <el-tooltip :content="chat.name" placement="top" :hide-after="0">
          <span class="chat-name">{{ chat.name }}</span>
        </el-tooltip>
        <el-tooltip content="删除" placement="top" :hide-after="0">
          <el-icon
            class="delete-icon"
            @click.stop="$emit('delete-chat', chat.id)"
            ><Delete
          /></el-icon>
        </el-tooltip>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Plus, Delete } from "@element-plus/icons-vue";

defineProps({
  currentAssistant: {
    type: Object,
    default: null,
  },
  currentChat: {
    type: Object,
    default: () => ({ id: null, messages: [] }),
  },
});

defineEmits(["create-chat", "select-chat", "delete-chat"]);
</script>

<style lang="scss" scoped>
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

.new-chat-btn {
  width: 100%;
  margin-bottom: 16px;
  border-radius: 8px;
}

.chat-history-item {
  margin-bottom: 8px;
  background-color: transparent;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 12px;
  padding: 8px 12px;
  font-size: 14px;
  color: var(--message-text);

  &:hover {
    background-color: var(--message-hover-bg);
  }

  &.active {
    background-color: var(--el-color-primary-light-2);
  }
}

.chat-history-item-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--message-text);
  .delete-icon {
    &:hover {
      color: #d82f3a;
    }
  }
  .chat-name {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: left;
  }
}
</style>