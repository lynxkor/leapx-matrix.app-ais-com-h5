import { ref, onMounted } from 'vue'
import { getOwnerTree } from '@/libs/api/common'

/**
 * 按钮级权限资源 composable
 * 在组件 onMounted 时自动拉取当前用户拥有的资源列表，递归遍历资源树（含 children 子节点），返回所有 resourceTag 的扁平数组。
 * @param {string} resourceTag 资源标识，各业务页不同（如 'AISVR100006'）
 * @param {string} [resourceType='APP_SIDE'] 资源类型，固定 APP_SIDE
 * @returns {import('vue').Ref<string[]>} resourceBtnList ref，模板可直接 resourceBtnList.includes(...)
 */
export function useResourceBtnList(resourceTag, resourceType = 'APP_SIDE') {
  const resourceBtnList = ref([])

  // 递归遍历资源树，收集所有节点（含子节点）的 resourceTag
  const flattenResourceTags = (list, tags = []) => {
    list.forEach((item) => {
      tags.push(item.resourceTag)
      if (Array.isArray(item.children) && item.children.length) {
        flattenResourceTags(item.children, tags)
      }
    })
    return tags
  }

  const fetchResourceList = () => {
    getOwnerTree({ resourceTag, resourceType })
      .then((res) => {
        if (res.code === 200 && Array.isArray(res.data)) {
          resourceBtnList.value = flattenResourceTags(res.data)
        }
      })
      .catch(() => {})
  }

  onMounted(fetchResourceList)

  return resourceBtnList
}
