<template>
  <el-dialog
    v-model="dialogVisible"
    title="反馈"
    width="528px"
    :close-on-click-modal="false"
    :show-close="true"
  >
    <el-form :model="form">
      <el-form-item>
        <el-checkbox-group v-model="form.reasons">
          <el-checkbox label="信息有误" border />
          <el-checkbox label="没有帮助" border />
          <el-checkbox label="其他" border />
        </el-checkbox-group>
      </el-form-item>
      <el-form-item>
        <el-input
          v-model="form.suggestion"
          type="textarea"
          :rows="4"
          placeholder="请输入您的具体反馈建议"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleSubmit">提交</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from "vue";
import { ElMessage } from "element-plus";

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:visible", "submit"]);

const dialogVisible = ref(props.visible);

const form = ref({
  reasons: [],
  suggestion: "",
});

const handleCancel = () => {
  form.value.reasons = [];
  form.value.suggestion = "";
  emit("update:visible", false);
};

const handleSubmit = () => {
  if (form.value.reasons.length === 0) {
    ElMessage.warning("请至少选择一个反馈原因");
    return;
  }
  emit("submit", {
    reasons: form.value.reasons,
    suggestion: form.value.suggestion,
  });
  handleCancel();
  ElMessage.success("感谢您的反馈");
};

// 监听visible属性变化
watch(
  () => props.visible,
  (newVal) => {
    dialogVisible.value = newVal;
  }
);

// 监听对话框关闭
watch(
  () => dialogVisible.value,
  (newVal) => {
    if (!newVal) {
      emit("update:visible", false);
    }
  }
);
</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
:deep(.el-checkbox__input) {
  display: none;
}
:deep(.el-checkbox__label) {
  padding: 0;
}
:deep(.el-checkbox) {
  margin-right: 8px;
  padding: 0 16px 0 16px !important;
}
</style>