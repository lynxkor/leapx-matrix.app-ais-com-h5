<template>
    <div style="box-shadow: 0px 1px 0px 0px rgba(210, 216, 223, 0.6);">
      <div class="search-content">
          <form action="/" class="search-input">
              <van-search shape="round" v-model="searchValue" :placeholder="placeholder"
              @focus="focusEvent" @blur="blurEvent" @search="searchEvent"/>
              <img class="scan-icon" v-if="showScan" src="../assets/image/scan_icon.png" @click="scanClick"/>
          </form>
          <div class="toggle-content" v-show="!isInput && showSort" @click="toggleSort">
              <img class="toggle-icon" :src="sortOrder ? sortDownIcon : sortUpIcon"/>
              <span class="toggle-span">按照日期{{ sortOrder ? '升序' : '降序' }}</span>
          </div>
          <img v-show="!isInput && searchList.length" 
            :class="highlightSerchIcon ? 'more-condition-btn more-condition-btn-hl' : 'more-condition-btn'" :src="highlightSerchIcon ? moreIconHl : moreIcon" @click="showPannel"/>
      </div>
      <van-popup position="top" v-model:show="popupShow" class="top-pop" :class="topupClass">
          <div class="pop-inner-content">
              <div class="pop-scroll-view">
                  <div class="pop-scroll-left">
                      <p v-for="(item, index) in searchList" :key="index"
                          :class="index == activeIndex ? 'title-text active-title-text' : 'title-text'"
                          @click="toggleActiveIndex(index)">
                          {{ item.title }}
                      </p>
                  </div>
                  <div class="pop-scroll-right">
                      <div class="option-view" v-for="(item, index) in searchList" :key="index" :ref="optionRefView">
                          <p class="option-title">{{ item.title }}</p>
                          <div class="option-list">

                              <template v-if="item.nodeType === 'single'">
                                  <p v-for="(optionItem, optionIndex) in item.options" :key="optionIndex"
                                      :class="searchForm[item.key] && searchForm[item.key] == optionItem.value ? 'option-text active-option-text' : 'option-text'"
                                      @click="toggleOptionValue(item.key, optionItem.value, item.nodeType)"
                                  >
                                      {{ optionItem.label }}
                                  </p>
                              </template>

                              <template v-if="item.nodeType === 'multiple'">
                                  <p v-for="(optionItem, optionIndex) in item.options" :key="optionIndex"
                                      :class="searchForm[item.key] && Array.isArray(searchForm[item.key]) && searchForm[item.key].includes(optionItem.value) ? 'option-text active-option-text' : 'option-text'"
                                      @click="toggleOptionValue(item.key, optionItem.value, item.nodeType)"
                                  >
                                      {{ optionItem.label }}
                                  </p>
                              </template>
                              <template v-if="item.nodeType === 'day' || item.nodeType === 'month' || item.nodeType === 'year'">
                                <p v-for="(optionItem, optionIndex) in item.list"
                                    :key="optionIndex"
                                    :class="searchForm[item.key] && searchForm[item.key] == optionItem.value ? 'option-text active-option-text' : 'option-text'"
                                    @click="toggleOptionValue(item.key, optionItem.value, item.nodeType)">
                                    {{ optionItem.label }}
                                </p>
                                <p :class="searchForm[item.key] && item.list && !item.list.map(item => item.value).includes(searchForm[item.key]) ? 'option-text user-icon active-option-text' : 'option-text user-icon'"
                                  @click="showPick(item)">
                                    {{ 
                                      choiceDic[item.key] == '自选' ?
                                      '自选' : 
                                      choiceDic[item.key][0].join('/') + '~' + choiceDic[item.key][1].join('/')
                                      }}
                                </p>
                              </template>
                              <template v-if="item.nodeType === 'hour' || item.nodeType === 'minute' || item.nodeType === 'second'">
                                <p v-for="(optionItem, optionIndex) in item.list"
                                    :key="optionIndex"
                                    :class="searchForm[item.key] && searchForm[item.key] == optionItem.value ? 'option-text active-option-text' : 'option-text'"
                                    @click="toggleOptionValue(item.key, optionItem.value, item.nodeType)">
                                    {{ optionItem.label }}
                                </p>
                                <p :class="searchForm[item.key] && item.list && !item.list.map(item => item.value).includes(searchForm[item.key]) ? 'option-text user-icon active-option-text' : 'option-text user-icon'"
                                  @click="showPick(item)">
                                    <!-- {{ choiceDic[item.key] }} -->
                                    {{ 
                                      choiceDic[item.key] == '自选' ?
                                      '自选' : 
                                      choiceDic[item.key][0].join(':') + '~' + choiceDic[item.key][1].join(':')
                                    }}
                                </p>
                              </template>
                          </div>
                      </div>
                  </div>
              </div>
              <div class="pop-inner-footer">
                  <div class="clear-btn" @click="clearClick">清除全部</div>
                  <div class="search-btn" @click="filterClick">开始筛选</div>
              </div>
          </div>
      </van-popup>
      <van-popup v-model:show="pickVisible" class="pick-outter" :close-on-click-overlay="false">
          <div class="pick-content">
              <p class="pick-title">自选时间</p>
              <div class="pick-time-line">
                  <p :class="tempTime.selectType === 'start' ? 'pick-time-line-item pick-time-line-item-hl' : 'pick-time-line-item'" @click="timeItemClick('start')">
                      {{ dateTimeFilter(tempTime.startTime, tempTime.type) }}
                  </p>
                  <p class="pick-time-seperator">-</p>
                  <p :class="tempTime.selectType === 'end' ? 'pick-time-line-item pick-time-line-item-hl' : 'pick-time-line-item'" @click="timeItemClick('end')">
                      {{ dateTimeFilter(tempTime.endTime, tempTime.type) }}
                  </p>
              </div>
              <div class="picker-inner">
                  <van-date-picker
                    v-if="tempTime.type === 'year' || tempTime.type === 'month' || tempTime.type === 'day'"
                    v-model="tempTime[`${tempTime.selectType}Time`]"
                    :show-toolbar="false"
                    :option-height=45
                    :visible-option-num="3"
                    :columns-type="tempTime.columnsType"
                    title="选择日期"
                  />
                  <van-time-picker
                    v-if="tempTime.type === 'hour' || tempTime.type === 'minute' || tempTime.type === 'second'"
                    v-model="tempTime[`${tempTime.selectType}Time`]"
                    :show-toolbar="false"
                    :option-height=45
                    :visible-option-num="3"
                    :columns-type="tempTime.columnsType"
                    title="选择日期"
                  />
              </div>
              <p class="pick-btn" @click="pickClick">确定</p>
          </div>
      </van-popup>
    </div>
</template>

<script setup>
  import { ref, defineProps, reactive, watch, onMounted, defineEmits, onBeforeUpdate } from 'vue'
  import { getNavigatorType, formatDate } from '../utils/index'
  const navigatorType = getNavigatorType()
  const emit = defineEmits(['search', 'filterSearch', 'scanCb'])
  import { toScan } from '../utils/nativeFn'

  import sortDownIcon from '../assets/image/sort_down_icon.svg'
  import sortUpIcon from '../assets/image/sort_up_icon.svg'
  import moreIcon from '../assets/image/more_condition_icon.png'
  import moreIconHl from '../assets/image/more_condition_icon_highlight.png'

  const props = defineProps({
    placeholder: {
      type: String,
      default: ''
    },
    searchList: {
      type: Array,
      default: () => {
        return []
      }
    },
    route: {
      type: String
    },
    tempVin: {
      type: String,
      default: ''
    },
    showScan: {
      type: Boolean,
      default: true
    },
    showSort: {
      type: Boolean,
      default: true
    },
    isHeaderClick: {
      type: Boolean,
      default: true
    }
  })

  watch(
    () => props.isHeaderClick,
    (newVal) => {
      isHeaderScan.value = !newVal
    },
  )
  
  const teleportEle = ref(null)
  const searchValue = ref('')
  const sortOrder = ref(false)
  const isInput = ref(false)
  const popupShow = ref(false)  
  const activeIndex = ref(0)
  const searchForm = reactive({})
  const topupClass = ref(navigatorType === 'Android' ? 'topup-android' : 'topup-ios')
  const isHeaderScan = ref(props.isHeaderClick)
  const multipleList = ref([])
  const choiceDic = reactive({})
  let tempTime = reactive({
    selectType: 'start',
    startTime: [],
    endTime: []
  })
  const pickVisible = ref(false)
  const highlightSerchIcon = ref(false)

  const itemRefs = ref([])
  const optionRefView = (el) => {
    if (el) {
      itemRefs.value.push(el)
    }
  }

  onBeforeUpdate(() => {
    itemRefs.value = []
  })

  const dateTimeFilter = (_arr, type) => {
    if (type === 'year' || type === 'month' || type === 'day') {
      return _arr.join('/')
    } else if (type === 'hour' || type === 'minute' || type === 'second') {
      return _arr.join(':')
    }
  }

  onMounted(() => {
    teleportEle.value = document.getElementById('test_content')

    if (props.searchList && props.searchList.length > 0) {
      setSearchForm()
    }

    window.getScanResult = (res) => {
      if (res) {
        let _scanValue = JSON.parse(res)[0]
        if (_scanValue.endsWith('-A')) {
          _scanValue = _scanValue.replaceAll('-A', '')
        } else if (_scanValue.endsWith('-B')) {
          _scanValue = _scanValue.replaceAll('-B', '')
        }
        if (!isHeaderScan.value) {
          // 父组件的操作扫码
          // 传出去结果
          emit('scanCb', _scanValue)
        } else {
          // 头部的输入框扫码
          searchValue.value = _scanValue
          searchEvent(searchValue)
        }
      }
    }
  })

  const setSearchForm = () => {
    props.searchList.forEach(item => {
      let value
      if (item.nodeType === 'single') {
          value = item.default ? item.default : ''
      } else if (item.nodeType === 'multiple') {
          value = item.default ? item.default : []
          multipleList.value.push(item.key)
      } else if (item.nodeType === 'year' || item.nodeType === 'month' || item.nodeType === 'day') {
        if (Array.isArray(item.default) && item.default.length) {
          value = item.default
          const _arr = [...value]
          choiceDic[item.key] = _arr
        } else {
          value = item.default
          choiceDic[item.key] = '自选'
        }
      } else if (item.nodeType === 'hour' || item.nodeType === 'minute' || item.nodeType === 'second') {
        if (Array.isArray(item.default) && item.default.length) {
          value = item.default
          const _arr = [...value]
          choiceDic[item.key] = _arr
        } else {
          value = item.default
          choiceDic[item.key] = '自选'
        }
      }
      searchForm[item.key] = value
    })
  }

  watch(
    () => props.searchList,
    (newSearchList) => {
      if (newSearchList && newSearchList.length > 0) {
        setSearchForm()
      }
    },
    { immediate: true }
  )

  const focusEvent = () => {
    isInput.value = true
  }

  const blurEvent = () => {
    isInput.value = false
  }

  const searchEvent = (e) => {
    emit('search', {
      sortOrder: sortOrder.value,
      searchValue: e
    })
  }

  const scanClick = () => {
    isHeaderScan.value = true
    // 1vin码 2钥匙 3合格证
    toScan()
  }

  const toggleSort = () => {
    // 切换状态然后再调接口
    sortOrder.value = !sortOrder.value
    emit('search', {
        sortOrder: sortOrder.value,
        searchValue: searchValue
    })
  }

  const showPannel = () => {
    popupShow.value = true
  }

  const hidePannel = () => {
    popupShow.value = false
  }

  const toggleActiveIndex = (_index) => {
    if (activeIndex.value !== _index) {
        activeIndex.value = _index
        // 左边点击，右边对应区块上滑
        itemRefs.value[_index].scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const toggleOptionValue = (_key, _value, _type) => {
    if (_type === 'single') {
      if (searchForm[_key] !== _value) {
        searchForm[_key] = _value
      }
    } else if (_type === 'multiple') {
      let arr = searchForm[_key] || []
      if (Array.isArray(arr) && arr.includes(_value)) {
          arr = arr.filter(item => item !== _value)
      } else {
          arr.push(_value)
      }
      searchForm[_key] = arr
    } else if (_type === 'year' || _type === 'month' || _type === 'day') {
      if (searchForm[_key] !== _value) {
        searchForm[_key] = _value
        choiceDic[_key] = '自选'
      }
    }
  }

  const clearClick = () => {
    Object.keys(searchForm).map(item => {
      if (multipleList.value.includes(item)) {
          searchForm[item] = []
      } else {
          searchForm[item] = ''
      }
    })
    Object.keys(choiceDic).map(item => {
      choiceDic[item] = '自选'
    })
    highlightSerchIcon.value = false
  }

  const filterClick = () => {
    emit('filterSearch', searchForm)
    hidePannel()
    highlightSerchIcon.value = true
  }

  const showPick = (item) => { 
    const key = item.key
    const type = item.nodeType
    const columnsType = item.columnsType
    if (type === 'year' || type === 'month' || type === 'day') {
      const now = new Date()
      const thirtyDaysBefore = new Date(new Date().valueOf() - 30 * 24 * 60 * 60 * 1000)
      Object.assign(tempTime, {
        key,
        type,
        selectType: 'start',
        columnsType,
        startTime: choiceDic[key] !== '自选' ? choiceDic[key][0] : formatDate(thirtyDaysBefore, type),
        endTime: choiceDic[key] !== '自选' ? choiceDic[key][1] : formatDate(now, type)
      })
    } else if (type === 'hour' || type === 'minute' || type === 'second') {
      const now = new Date()
       Object.assign(tempTime, {
        key,
        type,
        selectType: 'start',
        columnsType,
        startTime: choiceDic[key] !== '自选' ? choiceDic[key][0] : formatDate(now, type),
        endTime: choiceDic[key] !== '自选' ? choiceDic[key][1] : formatDate(now, type)
      })
    }
    pickVisible.value = true
  }

  const timeItemClick = (type) => {
    console.log(type)
    if (tempTime.selectType !== type) {
      tempTime.selectType = type
      console.log(tempTime)
    }
  }

  const pickClick = () => {
    let { startTime, endTime } = tempTime
    if (startTime.valueOf() > endTime.valueOf()) {
        let middleTime = startTime
        tempTime.startTime = tempTime.endTime
        tempTime.endTime = middleTime
    }
    pickVisible.value = false
    searchForm[tempTime.key] = [tempTime.startTime, tempTime.endTime]
    choiceDic[tempTime.key] = [tempTime.startTime, tempTime.endTime]
  }
    
</script>

<style lang="scss" scoped>
.search-content{
    width: 100%;
    height: 45px;
    display: flex;
    align-items: center;
    padding: 0 12px;
    position: relative;
    background-color: #ffffff;
    .search-input{
        flex: 1;
        border-radius: 15px;
        padding-left: 3px;
        height: 30px;
        margin-right: 10px;
        position: relative;
        .van-search{
          height: 30px;
          padding: 0;
        }
    }
    .scan-icon{
        width: 30px;
        height: 30px;
        position: absolute;
        top: 0px;
        right: 8px;
    }
    .toggle-content{
        display: flex;
        height: 30px;
        align-items: center;
        padding: 0 10px;
        border-radius: 30px;
        border: 1px solid #979797;
        margin-right: 10px;
        .toggle-icon{
            width: 30px;
            height: 30px;
        }
        .toggle-span{
            font-size: 12px;
            font-family: PingFangSC-Regular, PingFang SC;
            font-weight: 400;
            color: #000000;
            letter-spacing: 1px;
            word-break: keep-all;
        }
    }
    .more-condition-btn{
        width: 30px;
        height: 30px;
        border: 1px solid #979797;
        border-radius: 100% 100%;
    }
    .more-condition-btn-hl{
        border: 1px solid #00AA00;
    }
}

.top-pop{
    border-radius: 0px 0px 32px 32px;
}

.topup-android{
    top: 46px;
}

.topup-ios{
    top: 46px;
}

.pop-inner-content{
    position: relative;
    display: flex;
    flex-direction: column;
    .pop-scroll-view{
        width: 100%;
        height: 65vh;
        overflow-y: hidden;
        display: flex;
        .pop-scroll-left{
            width: 102px;
            overflow-y: auto;
            background: #F7F8FA;
            .title-text{
                width: 100%;
                text-align: left;
                padding: 22px 0;
                font-size: 14px;
                font-family: PingFangSC-Regular, PingFang SC;
                font-weight: 400;
                color: #191A1B;
                padding-left: 22px;
                line-height: 21px;
            }
            .active-title-text{
                color: #00AA00;
                background: #ffffff;
                position: relative;
                &::after{
                    display: inline-block;
                    width: 1.5px;
                    height: 17px;
                    content: '';
                    background: #00AA00;
                    position: absolute;
                    top: 50%;
                    left: 0;
                    margin-top: -8.5px;
                }
            }
        }
        .pop-scroll-right{
            flex: 1;
            background: #ffffff;
            overflow-y: auto;
            .option-view{
                padding-bottom: 16px;
                margin: 18px 13px 0;
                border-bottom: 1px solid #F2F3F2;
                &:nth-last-of-type(1) {
                    border-bottom: 0;
                }
                .option-title{
                    font-size: 14px;
                    font-family: PingFangSC-Medium, PingFang SC;
                    font-weight: 500;
                    color: #191A1B;
                    margin-bottom: 12px;
                }
                .option-list{
                    display: flex;
                    flex-wrap: wrap;
                    // justify-content: space-between;
                    justify-content: flex-start;
                    .option-text{
                        min-width: 77px;
                        background: #FFFFFF;
                        border-radius: 7px;
                        border: 1px solid #DCE0E4;
                        line-height: 15px;
                        text-align: center;
                        font-size: 10px;
                        margin-bottom: 8px;
                        font-family: PingFangSC-Regular, PingFang SC;
                        font-weight: 400;
                        color: #191A1B;
                        word-break: keep-all;
                        padding: 7px 4px;
                        margin-right: 8px;
                        &:nth-of-type(3n) {
                            margin-right: 0;
                        }
                    }
                    .user-icon{
                        flex: 0 0 100%;
                    }
                    .active-option-text{
                        border: 1px solid #00aa00;
                        color: #00AA00;
                    }
                }
            }
        }
    }
    .pop-inner-footer{
        width:100%;
        height: 76px;
        background: #ffffff;
        display: flex;
        padding: 0 16px;
        align-items: center;
        justify-content: space-between;
        .clear-btn{
            font-size: 16px;
            font-family: PingFangSC-Medium, PingFang SC;
            font-weight: 500;
            color: #525452;
        }
        .search-btn{
            padding: 10px 32px;
            font-size: 16px;
            font-family: PingFangSC-Medium, PingFang SC;
            font-weight: 500;
            color: #FFFFFF;
            background: #00AA00;
            border-radius: 22px;
        }
    }
}

.pick-outter{
    background: transparent;
}

.pick-content{
    padding: 32px 24px 16px;
    background: #FFFFFF;
    box-shadow: 0px 0px 12px 0px rgba(0,0,0,0.24);
    border-radius: 16px;
    .pick-title{
        font-size: 16px;
        font-family: PingFangSC, PingFang SC;
        font-weight: 500;
        color: #000000;
        letter-spacing: 1px;
        margin-bottom: 12px;
        text-align: center;
    }
    .pick-time-line{
        display: flex;
        align-items: center;
        margin-bottom: 6px;
        .pick-time-line-item{
            width: 135px;
            height: 28px;
            background: #F6F6F6;
            border-radius: 7px;
            text-align: center;
            line-height: 28px;
            color: #515351;
            font-size: 14px;
        }
        .pick-time-line-item-hl{
            color: #00AA00;
        }
        .pick-time-seperator{
            color: #515351;
            font-size: 16px;
            margin: 0 6px;
        }
    }
    .picker-inner{
        width: 288px;
        height: 150px;
        background: #F6F6F6;
        border-radius: 7px;
        margin-bottom: 16px;
        .van-picker{
            width: 100%;
            height: 100%;
            width: 288px;
            height: 150px;
        }
    }
    .pick-btn{
        width: 288px;
        height: 44px;
        background: #00AA00;
        border-radius: 11px;
        font-size: 14px;
        font-family: PingFangSC, PingFang SC;
        font-weight: 500;
        color: #FFFFFF;
        line-height: 44px;
        text-align: center;
    }
}

.search-input .van-search__content{
    background-color: #f7f7f7;
}

.search-input input.van-field__control {
    color: #000;
    font-size: 12px;
}

</style>
