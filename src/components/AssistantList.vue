<template>
  <div class="assistant-list">
    <div class="logo-container">
      <img src="../assets/logo-White.svg" alt="logo" class="logo-image" />
    </div>
    <div
      v-for="assistant in assistants"
      :key="assistant.id"
      :class="[
        'assistant-item',
        { active: currentAssistant?.id === assistant.id },
      ]"
      shadow="hover"
      @click="$emit('select-assistant', assistant)"
    >
      <el-tooltip
        :content="assistant.description"
        placement="top"
        :hide-after="0"
      >
        <div class="assistant-item-content">
          <div class="assistant-avatar">
            <img
              :src="assistant.avatar || assistantAvatar"
              :alt="assistant.name"
            />
          </div>
          <div class="assistant-info">
            <div class="assistant-name">{{ assistant.name }}</div>
            <div class="assistant-description">{{ assistant.description }}</div>
          </div>
        </div>
      </el-tooltip>
    </div>
  </div>
</template>

<script setup>
import assistantAvatar from "../assets/assistant-avatar.svg";

defineProps({
  assistants: {
    type: Array,
    default: () => [],
  },
  currentAssistant: {
    type: Object,
    default: null,
  },
});

defineEmits(["select-assistant"]);
</script>

<style lang="scss" scoped>
.assistant-list {
  width: 240px;
  background-color: transparent;
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  padding: 12px;
  position: relative;
  padding-top: 100px;
}

.logo-container {
  width: 165px;
  position: absolute;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
}

.logo-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.assistant-item {
  width: 100%;
  margin-bottom: 24px;
  cursor: pointer;
}

.assistant-item-content {
  display: flex;
  align-items: center;
  justify-content: center;
  fonts-size: 12px;
  border-radius: 12px;
  padding: 8px 10px;
  color: var(--assistant-text-color);
  &:hover {
    color: var(--assistant-text-light-color);
    background-color: rgba(255, 255, 255, 0.2);
    .assistant-avatar {
      img {
        opacity: 1;
      }
    }
  }
  .assistant-avatar {
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    margin-right: 10px;
    img {
      width: 24px;
      height: 24px;
      object-fit: contain;
      opacity: 0.4;
    }
  }
}

.active {
  .assistant-item-content {
    color: var(--assistant-text-light-color);
    background-color: rgba(255, 255, 255, 0.2);
    .assistant-avatar {
      // background-color: rgba(255, 255, 255, 0.2);
      img {
        opacity: 1;
      }
    }
  }
}

.assistant-info {
  flex: 1;
  .assistant-name {
    font-size: 14px;
    font-weight: bolder;
    line-height: 22px;
  }
  .assistant-description {
    font-size: 12px;
    font-weight: 400;
    line-height: 16px;
  }
}
</style>