<template>
  <van-dialog
    v-model:show="innerShow"
    :title="title"
    show-cancel-button
    confirmButtonText="保存"
    cancelButtonText="取消"
    confirmButtonColor="#009100"
    cancelButtonColor="#191A1B"
    @confirm="onConfirm"
    @opened="onOpened"
    @closed="onClosed"
    :style="{ marginBottom: keyboardVisible ? '220px' : '0' }"
  >
    <template #title>
      <div class="dialog-title">{{ title }}</div>
      <div v-if="subtitle" class="dialog-subtitle">{{ subtitle }}</div>
    </template>
    <template #default>
      <div class="plate-input-wrapper">
        <div class="plate-input-box">
          <div
            v-for="(char, index) in chars"
            :key="index"
            :class="['plate-char', { active: currentIndex === index }]"
            @click="onCharClick(index)"
          >
            {{ char }}
          </div>
        </div>
      </div>
    </template>
  </van-dialog>

  <van-popup
    v-model:show="keyboardVisible"
    position="bottom"
    :style="{ height: '220px' }"
    :overlay="false"
  >
    <div class="plate-keyboard">
      <div v-if="currentIndex === 0" class="keyboard-content">
        <div class="keyboard-row" v-for="(row, ri) in provinceRows" :key="ri">
          <span
            v-for="item in row"
            :key="item"
            :class="['key-item', { disabled: !item }]"
            @click="onKeyClick(item)"
          >{{ item }}</span>
        </div>
      </div>
      <div v-else-if="currentIndex === 1" class="keyboard-content">
        <div class="keyboard-tabs">
          <span :class="['tab-item', { active: tab === 'letter' }]" @click="tab = 'letter'">字母</span>
          <span :class="['tab-item', { active: tab === 'province' }]" @click="tab = 'province'">省份</span>
        </div>
        <template v-if="tab === 'letter'">
          <div class="keyboard-row" v-for="(row, ri) in letterRows" :key="ri">
            <span
              v-for="item in row"
              :key="item"
              :class="['key-item', { disabled: !item }]"
              @click="onKeyClick(item)"
            >{{ item }}</span>
          </div>
        </template>
        <template v-else>
          <div class="keyboard-row" v-for="(row, ri) in provinceRows" :key="ri">
            <span
              v-for="item in row"
              :key="item"
              :class="['key-item', { disabled: !item }]"
              @click="onKeyClick(item)"
            >{{ item }}</span>
          </div>
        </template>
      </div>
      <div v-else class="keyboard-content">
        <div class="keyboard-row" v-for="(row, ri) in numberLetterRows" :key="ri">
          <span
            v-for="item in row"
            :key="item"
            :class="['key-item', { disabled: !item, special: item === '删除' || item === '完成' }]"
            @click="onKeyClick(item)"
          >{{ item }}</span>
        </div>
      </div>
    </div>
  </van-popup>
</template>

<script setup>
/**
 * PlateKeyboard - 车牌自定义键盘组件
 *
 * @property show      - v-model:show 控制弹框显示
 * @property modelValue - v-model 当前车牌号
 * @property title     - 弹框标题
 * @property subtitle  - 副标题，如 "原车牌：xxx"
 *
 * @emits update:show
 * @emits update:modelValue
 * @emits confirm - 用户点击确认，参数为新车牌号
 * @emits cancel
 */
import { ref, computed } from 'vue'
import { showToast } from 'vant'
import { getVehicleInfo } from '@/api/reception'

const props = defineProps({
  show: { type: Boolean, default: false },
  modelValue: { type: String, default: '' },
  title: { type: String, default: '实名认证车辆' },
  subtitle: { type: String, default: '' },
  /** 校验车牌唯一性时排除的 VIN（当前车辆） */
  excludeVin: { type: String, default: '' }
})

const emit = defineEmits(['update:show', 'update:modelValue', 'confirm'])

const innerShow = computed({
  get: () => props.show,
  set: (val) => emit('update:show', val)
})

const chars = ref(['', '', '', '', '', '', '', ''])
const currentIndex = ref(0)
const keyboardVisible = ref(false)
const tab = ref('province')

const PROVINCE_LIST = '京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领'
const LETTER_LIST = 'ABCDEFGHJKLMNPQRSTUVWXYZ'

const provinceRows = computed(() => {
  const provinces = PROVINCE_LIST.split('')
  const rows = []
  for (let i = 0; i < provinces.length; i += 10) {
    const row = provinces.slice(i, i + 10)
    while (row.length < 10) row.push('')
    rows.push(row)
  }
  return rows
})

const letterRows = computed(() => {
  const letters = LETTER_LIST.split('')
  const rows = []
  rows.push(letters.slice(0, 10))
  rows.push(letters.slice(10, 20))
  const lastRow = letters.slice(20, 26)
  while (lastRow.length < 10) lastRow.push('')
  rows.push(lastRow)
  return rows
})

const numberLetterRows = computed(() => [
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'P', '港', '澳'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', '学'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M', '警', '领', ''],
  ['删除', '', '', '', '', '', '', '', '', '完成']
])

function onOpened() {
  const current = (props.modelValue || '').replace(/[·•]/g, '')
  const split = current.split('')
  while (split.length < 8) split.push('')
  chars.value = split.slice(0, 8)
  currentIndex.value = 0
  keyboardVisible.value = true
}

function onClosed() {
  keyboardVisible.value = false
}

function onCharClick(index) {
  currentIndex.value = index
  keyboardVisible.value = true
}

function onKeyClick(key) {
  if (!key) return
  if (key === '删除') {
    if (currentIndex.value > 0) {
      if (chars.value[currentIndex.value]) {
        chars.value[currentIndex.value] = ''
      } else {
        currentIndex.value--
        chars.value[currentIndex.value] = ''
      }
    } else {
      chars.value[0] = ''
    }
  } else if (key === '完成') {
    keyboardVisible.value = false
  } else {
    if (currentIndex.value < 8) {
      chars.value[currentIndex.value] = key
      if (currentIndex.value < 7) currentIndex.value++
    }
  }
}

async function onConfirm() {
  const newPlate = chars.value.join('')
  if (newPlate.length < 7) {
    showToast('请输入完整的车牌号')
    return
  }
  if (newPlate === props.modelValue) {
    innerShow.value = false
    return
  }

  try {
    const res = await getVehicleInfo({ searchVin: newPlate })
    if (res.code === 200) {
      const vehicleList = res.data || []
      const existingVehicle = vehicleList.find(
        (v) => v.vehiclePlateNo === newPlate && v.vin !== props.excludeVin
      )
      if (existingVehicle) {
        showToast('该车牌已具有一个VIN码，请检查确认')
      } else {
        emit('update:modelValue', newPlate)
        emit('confirm', newPlate)
        innerShow.value = false
        showToast('车牌修改成功')
      }
    } else {
      showToast(res.msg || '校验车牌失败')
    }
  } catch (error) {
    console.error('更换车牌失败:', error)
    showToast('更换车牌失败，请稍后重试')
  }
}
</script>

<style lang="scss" scoped>
.dialog-title {
  font-size: 16px;
  font-weight: 500;
  color: #191a1b;
  text-align: center;
}

.dialog-subtitle {
  font-size: 12px;
  color: #545454;
  text-align: center;
  margin-top: 2px;
}

.plate-input-wrapper {
  padding: 8px 10px 32px;
  display: flex;
  justify-content: center;
}

.plate-input-box {
  display: flex;
  align-items: center;
  gap: 4px;

  .plate-char {
    width: 30px;
    height: 40px;
    background: #ffffff;
    border: 0.5px solid #cecfce;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 500;
    color: #191a1b;
    cursor: pointer;

    &.active {
      background: rgba(0, 145, 0, 0.1);
      border-color: #009100;
      color: #009100;
    }
  }
}

.keyboard-tabs {
  display: flex;
  justify-content: center;
  gap: 16px;
  padding: 8px 0;

  .tab-item {
    font-size: 14px;
    color: #545454;
    cursor: pointer;

    &.active {
      color: #009100;
      font-weight: 500;
    }
  }
}

.plate-keyboard {
  background: #d1d5db;
  padding: 8px 6px;
  height: 100%;
  box-sizing: border-box;

  .keyboard-content {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
  }

  .keyboard-row {
    display: flex;
    justify-content: center;
    gap: 4px;
    margin-bottom: 6px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .key-item {
    flex: 1;
    max-width: 32px;
    height: 36px;
    background: #ffffff;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    color: #191a1b;
    cursor: pointer;
    user-select: none;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);

    &:active {
      background: #e5e7eb;
    }

    &.disabled {
      background: transparent;
      box-shadow: none;
      cursor: default;
    }

    &.special {
      max-width: 50px;
      background: #a3a3a3;
      color: #ffffff;

      &:active {
        background: #737373;
      }
    }
  }
}
</style>
