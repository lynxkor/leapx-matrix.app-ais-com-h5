<template>
  <van-dialog v-model:show="isShow" :title="dialogObj.title">
    <template #default>
      <div class="dialog-content">
        <slot></slot>
      </div>
    </template>
    <template #footer v-if="dialogObj.submitText">
      <div class="dialog-footer">
        <div
          class="dialog-submit-btn"
          :class="{ 'is-disabled': isCounting }"
          @click="handleSubmit"
        >
          {{ submitBtnText }}
        </div>
        <div
          class="dialog-cancel-btn"
          v-if="dialogObj.cancelText"
          @click="props.dialogObj.cancelFn?.()"
        >
          {{ dialogObj.cancelText }}
        </div>
      </div>
    </template>
  </van-dialog>
</template>

<script setup>
import { defineProps, watch, ref, computed, onBeforeUnmount } from 'vue'

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
// 剩余倒计时秒数;0 表示不在倒计时或倒计时已结束
const countdown = ref(0)
let timer = null

// 倒计时显示文案:不倒计时时直接用 submitText,倒计时中追加 " Xs"
const submitBtnText = computed(() => {
  if (countdown.value > 0) {
    return `${props.dialogObj.submitText} ${countdown.value}s`
  }
  return props.dialogObj.submitText
})

const isCounting = computed(() => countdown.value > 0)

const clearTimer = () => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

const startCountdown = () => {
  // 从 dialogObj.countdown 读取,允许调用方自定义秒数;不传则默认 3 秒
  const seconds = Number(props.dialogObj.countdown)
  const total = Number.isFinite(seconds) && seconds >= 0 ? Math.floor(seconds) : 3

  // 0 表示不需要倒计时
  if (total === 0) {
    countdown.value = 0
    return
  }

  clearTimer()
  countdown.value = total
  timer = setInterval(() => {
    countdown.value -= 1
    if (countdown.value <= 0) {
      countdown.value = 0
      clearTimer()
    }
  }, 1000)
}

// 监听显示状态:打开时启动倒计时,关闭时清理
watch(
  () => props.showDialog,
  newVal => {
    isShow.value = newVal
    if (newVal) {
      startCountdown()
    } else {
      clearTimer()
      countdown.value = 0
    }
  },
  { immediate: true }
)

// 组件销毁时清理 timer
onBeforeUnmount(() => {
  clearTimer()
})

// 确认按钮点击:倒计时期间不允许点击
const handleSubmit = () => {
  if (isCounting.value) return
  props.dialogObj.submitFn?.()
}
</script>

<style lang="scss" scoped>
.dialog-content{
    padding: 24px;

    p{
      font-family: "PingFang SC";
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
      background: #0A0;
      font-size: 14px;
      font-weight: 500;
      color: #FFF;
      border-radius: 11px;
      // 倒计时禁用态:视觉反馈 + 阻止点击
      &.is-disabled{
        background: #B5E2B5;
        color: #FFF;
        cursor: not-allowed;
      }
    }

    .dialog-cancel-btn{
      margin-top: 16px;
      font-family: "PingFang SC";
      font-size: 14px;
      font-weight: 500;
      letter-spacing: 0.25px;
      color: #032125;
      text-align: center;
    }
  }
</style>
