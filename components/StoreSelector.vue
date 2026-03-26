<template>
  <div class="store-selector" @click="$emit('click')">
    <span class="store-name">{{ storeName }}</span>
    <van-icon name="arrow-down" class="arrow-icon" />
  </div>
</template>

<script setup>
defineProps({
  storeName: {
    type: String,
    default: '请选择门店'
  }
})

defineEmits(['click'])
</script>

<style lang="scss" scoped>
.store-selector {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;

  .store-name {
    font-size: 16px;
    font-weight: 500;
    color: #191a1b;
    line-height: 22px;
  }

  .arrow-icon {
    font-size: 12px;
    color: #888888;
  }
}
</style>
