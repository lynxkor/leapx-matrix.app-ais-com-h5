<template>
  <div class="alinClass">
    <div class="sureBtn">
      <ais-button class="overwrite_sign" size="large" type="default" @click="overwrite"
        >重写</ais-button
      >
      <ais-button
        :disabled="!isDown"
        class="confirm_sign"
        size="large"
        type="primary"
        @click="submit"
        >确认签字</ais-button
      >
    </div>
    <div class="signWrap" id="signWrap" ref="signWrap">
      <div class="tootip" v-show="!isDown">
        使用正楷字体
        <br />
        在此区域签字
      </div>
      <canvas
        style="opacity: 0.5"
        ref="myCanvas"
        @touchstart="touchStart"
        @touchmove="touchmove"
        @touchend="touchend"
      ></canvas>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, defineProps, defineEmits } from 'vue'
// import Oss from 'ali-oss'
import { showToast, showConfirmDialog, showLoadingToast, closeToast } from 'vant'
// import { getOssResponse } from '@/api/upload/index.js'
// import { montageOssName, isDevOrPro } from '@/utils'
// import 'vant/lib/index.css'
import AisButton from '@/components/AisButton.vue'
import { useRoute, useRouter } from 'vue-router'
import { confirmSign } from '@/api/vehretail'

const route = useRoute()
const router = useRouter()
const emit = defineEmits(['submit'])

// 引用
const signWrap = ref(null)
const myCanvas = ref(null)

// 数据
const canvasTxt = ref(null)
const stageInfo = ref('')
const hisSingdeg = ref('')
const startX = ref(0)
const startY = ref(0)
const moveY = ref(0)
const endX = ref(0)
const points = ref([])
const isDown = ref(false)
const show = ref(false)
const singdeg = ref(0)
const isSubmitting = ref(false)

// 生命周期
onMounted(() => {
  const canvas = myCanvas.value
  if (canvas && signWrap.value) {
    canvas.height = signWrap.value.offsetHeight
    canvas.width = signWrap.value.offsetWidth
    canvasTxt.value = canvas.getContext('2d')
    canvasTxt.value.lineWidth = 2
    stageInfo.value = canvas.getBoundingClientRect()
    singdeg.value = screen.orientation.angle
    console.log(signWrap.value.offsetHeight, signWrap.value.offsetWidth)
    if (singdeg.value !== 90 && singdeg.value !== 270) {
      hisSingdeg.value = canvas.getBoundingClientRect()
    }
    setTimeout(() => {
      if (canvasTxt.value) {
        canvasTxt.value.lineWidth = 2
      }
      if (myCanvas.value && signWrap.value) {
        myCanvas.value.height = signWrap.value.offsetHeight
        myCanvas.value.width = signWrap.value.offsetWidth
      }
    }, 0)

    const handleOrientationChange = () => {
      singdeg.value = screen.orientation.angle
      const ctx = canvas.getContext('2d')
      // 1. 保存当前图像数据
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      if (!signWrap.value) {
        return
      }
      if (myCanvas.value) {
        myCanvas.value.height = signWrap.value.offsetWidth
        myCanvas.value.width = signWrap.value.offsetHeight
      }
      // 3. 创建临时 Canvas 用于旋转操作
      const tempCanvas = document.createElement('canvas')
      tempCanvas.width = signWrap.value.offsetWidth
      tempCanvas.height = signWrap.value.offsetHeight
      const tempCtx = tempCanvas.getContext('2d')
      tempCtx.lineWidth = 2
      ctx.lineWidth = 2
      tempCtx.putImageData(imageData, 0, 0) // 4. 应用旋转并绘制到主 Canvas
      ctx.save()
      if (singdeg.value === 90 || singdeg.value === 270) {
        ctx.translate(0, canvas.height) // 平移到右侧边缘
        ctx.rotate(-Math.PI / 2) // 顺时针旋转90度
      } else {
        ctx.translate(canvas.width, 0) // 平移到右侧边缘
        ctx.rotate(Math.PI / 2) // 顺时针旋转90度
      }
      ctx.drawImage(
        tempCanvas,
        0,
        0,
        signWrap.value.offsetWidth,
        signWrap.value.offsetHeight, // 源尺寸
        0,
        0,
        canvas.height,
        canvas.width // 目标尺寸（交换宽高）
      )
      ctx.restore()
      if (singdeg.value === 90 || singdeg.value === 270) {
        stageInfo.value = canvas.getBoundingClientRect()
        console.log(stageInfo.value)
      } else {
        if (hisSingdeg.value) {
          stageInfo.value = hisSingdeg.value
        } else {
          stageInfo.value = canvas.getBoundingClientRect()
        }
      }
      // ctx.putImageData(imageData, 0, 0);
      console.log(signWrap.value.offsetHeight, signWrap.value.offsetWidth)
    }

    window.addEventListener('orientationchange', handleOrientationChange, false)

    onUnmounted(() => {
      window.removeEventListener('orientationchange', handleOrientationChange, false)
    })
  }
})

// 方法
const touchStart = (ev) => {
  ev.preventDefault()
  if (ev.touches.length === 1) {
    isDown.value = true
    const obj = {
      x: ev.targetTouches[0].clientX,
      y: ev.targetTouches[0].clientY
    }
    startX.value = obj.x
    startY.value = obj.y
    if (canvasTxt.value) {
      canvasTxt.value.beginPath()
      canvasTxt.value.moveTo(startX.value, startY.value)
      canvasTxt.value.lineTo(obj.x, obj.y)
      canvasTxt.value.stroke()
      canvasTxt.value.closePath()
    }
    points.value.push(obj)
  }
}

const touchmove = (ev) => {
  ev.preventDefault()
  const canvas = myCanvas.value
  if (canvas) {
    stageInfo.value = canvas.getBoundingClientRect()
    if (canvasTxt.value) {
      canvasTxt.value.lineWidth = 2
    }
    if (ev.touches.length === 1) {
      const obj = {
        x: ev.targetTouches[0].clientX - stageInfo.value.left,
        y: ev.targetTouches[0].clientY - stageInfo.value.top
      }
      if (canvasTxt.value) {
        canvasTxt.value.beginPath()
        canvasTxt.value.moveTo(startX.value, startY.value)
        canvasTxt.value.lineTo(obj.x, obj.y)
        canvasTxt.value.stroke()
        canvasTxt.value.closePath()
      }
      startY.value = obj.y
      startX.value = obj.x
      points.value.push(obj)
    }
  }
}

const touchend = (ev) => {
  ev.preventDefault()
  const canvas = myCanvas.value
  if (canvas) {
    stageInfo.value = canvas.getBoundingClientRect()
    if (ev.touches.length === 1) {
      const obj = {
        x: ev.targetTouches[0].clientX - stageInfo.value.left,
        y: ev.targetTouches[0].clientY - stageInfo.value.top
      }
      if (canvasTxt.value) {
        canvasTxt.value.beginPath()
        canvasTxt.value.moveTo(startX.value, startY.value)
        canvasTxt.value.lineTo(obj.x, obj.y)
        canvasTxt.value.stroke()
        canvasTxt.value.closePath()
      }
    }
  }
}

const overwrite = () => {
  if (canvasTxt.value && myCanvas.value) {
    canvasTxt.value.clearRect(0, 0, myCanvas.value.width, myCanvas.value.height)
  }
  isDown.value = false
}

// 上传base64图片
const submit = async() => {
  if (!isDown.value) {
    return showToast('签名不可为空')
  }
  if (isSubmitting.value) {
    return
  }
  showConfirmDialog({
    message: '确认签署交车单? ',
    width: '295px',
    confirmButtonColor: '#009100',
    cancelButtonColor: '#222222',
    className: 'sign-confirm-dialog'
  })
    .then(async() => {
      if (isSubmitting.value) {
        return
      }
      // 获取签名图片的 base64 数据
      // const canvas = myCanvas.value
      // const signatureImageUrl = canvas.toDataURL('image/png')
      const signatureImageUrl = 'https://linxiaopao-sit.leapmotor.com/2c070137-2a12-4d3a-8d6d-31c3c4782ce6/1760603473510_vehdeliverysign.png?ver=-1732284362'
      // 获取确认项树形结构数据
      const confirmItemTree = route.query.confirmItemTree
        ? JSON.parse(route.query.confirmItemTree)
        : []

      // 调用确认签署接口
      try {
        isSubmitting.value = true
        showLoadingToast({ message: '签署中...', forbidClick: true, duration: 0 })
        const res = await confirmSign({
          deliveryOrderId: route.query.deliveryOrderId,
          signatureImageUrl: signatureImageUrl,
          confirmItemTree: confirmItemTree
        })
        if (res?.code === 200) {
          // 返回交车完成页面
          router.replace({
            path: '/delivery/confirm',
            query: {
              id: route.query.deliveryOrderId,
              step: 3,
              isDetail: true
            }
          })
        } else {
          showToast(res?.msg || '签名失败')
        }
      } catch (error) {
        console.error('签名失败:', error)
        showToast(error?.msg || '签名失败')
      } finally {
        isSubmitting.value = false
        closeToast()
      }
    })
    .catch(() => {
      // on cancel
    })
}
</script>

<style lang="scss" scoped>
.alinClass {
  display: flex;
  height: 100%;
  padding-bottom: 34px;
  background-color: #ffffff;
  .signWrap {
    height: 100%;
    flex: 1;
    background-color: rgba(0, 145, 0, 0.05);
    border: 1px dashed #b3deb3;
    border-radius: 0.2rem;
    position: relative;
    .tootip {
      pointer-events: none;
      z-index: 999;
      transform: rotate(90deg);
      position: absolute;
      top: 50%;
      left: -50%;
      margin-left: 6rem;
      color: rgba(0, 145, 0, 0.2);
      font-size: 6rem;
      width: 50rem;
      height: 16rem;
    }
  }
  .sureBtn {
    height: 100%;
    padding-bottom: 34px;
    width: 56px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
    gap: 60px;
    font-weight: 400;
    .overwrite_sign {
      transform: rotate(90deg);
      height: 32px !important;
      width: 80px !important;
      white-space: nowrap;
    }
    .confirm_sign {
      transform: rotate(90deg);
      height: 32px !important;
      width: 90px !important;
      white-space: nowrap;
    }
  }
  .dialog-line-text {
    font-size: 14px;
    letter-spacing: 0.43px;
    color: #545454;
  }
}
</style>
<style lang="scss">
.sign-confirm-dialog {
  .van-dialog__message {
    font-size: 16px;
    color: #222222;
    font-weight: 400;
  }
  .van-dialog__footer {
    border-top: 0.25px solid #e6e6e5 !important;
  }
  .van-button {
    border-right: 0.25px solid #e6e6e5 !important;
  }
}
</style>
