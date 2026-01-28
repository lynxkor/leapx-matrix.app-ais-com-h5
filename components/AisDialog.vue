<template>
  <van-dialog v-model:show="isShow" :title="dialogObj.title">
    <template #default>
      <div v-if="dialogObj.default" class="dialog-content" v-html="dialogObj.default"></div>
      <slot v-else></slot>
    </template>
    <template #footer v-if="dialogObj.submitText">
      <div class="dialog-footer">
        <div class="dialog-submit-btn" @click="dialogObj.submitFn">{{ dialogObj.submitText }}</div>
        <div class="dialog-cancel-btn" v-if="dialogObj.cancelText" @click="dialogObj.cancelFn">{{ dialogObj.cancelText }}</div>
      </div>
    </template>
  </van-dialog>
</template>

<script setup>
import { defineProps, watch, ref } from 'vue'
const props = defineProps({
  showDialog: {
    type: Boolean,
    default: false
  },
  dialogObj: {
    type: Object,
    default: () => {
      return {}
    }
  }
})

const isShow = ref(false)

watch(
  () => props.showDialog,
  newVal => {
    isShow.value = newVal
  }
)
</script>

<style lang="scss" scoped>
.dialog-content{
    padding: 24px;
    p{
      font-family: PingFang SC;
      font-size: 14px;
      letter-spacing: 0.43px;
      color: #545454;
    }
  }
  .dialog-footer{
    padding: 24px;
    padding-top: 0;
    .dialog-submit-btn{
      width: 100%;
      height: 44px;
      text-align: center;
      line-height: 44px;
      background: #00AA00;
      font-size: 14px;
      font-weight: 500;
      color: #FFFFFF;
      border-radius: 11px;
    }
    .dialog-cancel-btn{
      margin-top: 16px;
      font-family: PingFang SC;
      font-size: 14px;
      font-weight: 500;
      letter-spacing: 0.25px;
      color: #032125;
      text-align: center;
    }
  }
</style>
