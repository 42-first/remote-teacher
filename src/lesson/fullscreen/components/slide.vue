/**
* @author [tuqiushuang]
* @email [tuqiushuang@xuetangx.com]
* @create date 2020-05-06 14:20:23
* @modify date 2020-05-06 14:20:23
* @desc [接收器ppt&习题图片展示]
*/
<template>
<section class='slide__cmp' :style="{ width: item.Width*scaleRate + 'px', height: item.Height*scaleRate + 'px' }">
  <section class="slide__wrap box-center" :style="{ width: item.Width + 'px', height: item.Height + 'px', transform: 'scale('+ scaleRate + ')', webkitTransform: 'scale('+ scaleRate + ')' }">
    <!-- 定时 续时等 -->
    <div v-if="isLoaded" class="time-box" v-show="!observerMode && item.problemID">
      <template v-if="!lessonStatus">
        <div class="timing" :class="['timing--number', warning&&!timeOver ? 'warning':'']" v-if="!isComplete && limit>0 && sLeaveTime && !hasNewExtendTime || timeOver">{{!timeOver && !isComplete ? $t('countdown') : ''}} {{ sLeaveTime }}</div>
        <div class="timing" v-else-if="hasNewExtendTime">{{ sExtendTimeMsg }}</div>
        <div class="timing" v-else-if="isComplete"><!-- 已完成 --> {{ $t('receiverdone') }} </div>
        <div class="timing willEnd" v-else><!-- 老师可能会随时结束答题 --> {{$t('collectprotip')}} </div>
      </template>
      <template v-else>
        <div class="timing willEnd"><!-- 作答时间结束 --> {{$t('student.receivertimeout')}} </div>
      </template>
    </div>
    <img class="cover" :src="item.cover || item.src" alt="" @load="handleImgLoaded">
    <!-- <image-cmp :src="item.cover || item.src" @imgloaded="handleImgLoaded" :isShare="isShare"></image-cmp> -->
    <template v-if="item.problemID && isLoaded">
      <template v-if="options" v-for="option in item.options">
        <p class="slide__shape" :class="['options-label', option.selected ? 'selected' : '', item.problemType === 1 || pollingCount === 1 ? 'MultipleChoice': '']" :style="option | setStyle" @click="handleClickOption(option.label, $event)" :data-option="option.label">{{ option.label }}</p>
      </template>
      <template v-if="!observerMode">
        <div v-if="[4, 5].includes(item.problemType)" class="slide__shape submit-btn" :style="item.submit | setStyle" :class="timeOver ? '' : 'can'" @click="handleAnswer">
          {{item.isComplete ? $t('viewdetails') : $t('answer') }}
        </div>
        <div v-else v-show="!item.isComplete && !lessonStatus" :class="['slide__shape', 'submit-btn', canSubmit === 1 || canSubmit === 2 ? 'can' : '']" :style="item.submit | setStyle" @click="handleClickBtn">
          {{canSubmit | setSubmitText}}
          <div class="tips f12 c333" v-if="!item.isComplete && !lessonStatus && canSubmit == 0"><!-- 请在题目中点击选项后提交答案 --> {{$t('qztmzdxx')}} </div>
        </div>
      </template>
      <div v-else-if="observerMode" class="slide__shape submit-btn" :style="item.submit | setStyle" @click="handleToast">
        {{[4, 5].includes(item.problemType) ? $t('answer') : $t('submitansw')}}
      </div>
    </template>
  </section>
  
</section>
</template>

<script>
import { mapState, mapActions } from 'vuex'
// import imageCmp from './image'
export default {
name: 'slide-cmp',
components: {
  // imageCmp
},
data() {
return {
  scaleRate: 1,
  initScaleRate: 1,
  isLoaded: false
};
},
filters: {
  setStyle(shape){
    var astyle = [
      'width:'+ (shape.width + 2)+'px;',
      // 'height:'+ shape.Height +'px;',
      'min-height:'+ (shape.height + 2) +'px;',
      'left:'+ (shape.left - 1) +'px;',
      'top:'+ (shape.top - 1) +'px;',
      'z-index:'+ shape.zOrderPosition + ';',
      'transform: rotate('+ shape.rotation + 'deg);',
      'webkit-transform: rotate('+ shape.rotation + 'deg);',
    ];
    return astyle.join('');
  },
  setSubmitText(submitStatus) {
    let text = i18n.t('submitansw') || '提交答案';

    if(submitStatus) {
      switch (submitStatus) {
        case 0:
        case 1:
          text = i18n.t('submitansw') || '提交答案';
          break;
        case 2:
          text = i18n.t('submiting') || '提交中...';
          break;
        case 3:
          text = i18n.t('submitok') || '提交成功';
          break;
        default:
          break;
      }
    }

    return text;
  },
},
props: {
  item: {
    type: Object,
    default: null
  },
  options: {
    type: Array,
    default: null
  },
  canSubmit: {
    type: Number,
    default: 0
  },
  limit: Number,
  sLeaveTime: String,
  hasNewExtendTime: Boolean,
  timeOver: Boolean,
  warning: Boolean,
  sExtendTimeMsg: String,
  isComplete: Boolean,
  pollingCount: Number,
  isShare: Boolean
},
mixins: [  ],
computed: {
  ...mapState([
    'lessonStatus',
    'observerMode',
    'layoutSize'
  ]),

  maxWidth(){
    return this.layoutSize.maxWidth
  },
  maxHeight(){
    return this.layoutSize.maxHeight
  }
},
watch: {
  maxWidth(newVal, oldVal) {
    this.zoomSlide();
  },
  maxHeight(newVal, oldVal) {
    this.zoomSlide();
  },
  item(newVal){
    this.isLoaded = false
    this.zoomSlide();
  }
},
methods: {
  /*
    * @method 
    * @param
    */
  zoomSlide() {
    let maxWidth = this.maxWidth;
    let maxHeight = this.maxHeight;
    let width = this.item.Width;
    let height = this.item.Height;

    let rate = width/height;
    let containRate = maxWidth/maxHeight;
    this.scaleRate = this.initScaleRate = containRate > rate ? maxHeight/height : maxWidth/width;
    // this.scaleRate = this.scaleRate < 1 ? this.scaleRate : 1

  },
  handleClickOption(option, evt ){
    this.$emit('setoption', option, evt)
  },
  handleClickBtn(){
    this.$emit('clickbtn')
  },
  handleAnswer(){
    if(this.timeOver && !this.item.isComplete) return
    this.$emit('clickanswer')
  },
  handleImgLoaded(){
    this.isLoaded = true
  },

  handleToast(){
    this.$toast({
      message: this.$i18n.t('notsupportedasateacher') || '老师身份在学生模式下不支持此操作',
      duration: 3000,
      type: 'info'
    });
  }
},
created() {
  this.zoomSlide()
},
mounted() {
  
},
updated() {}, 
beforeDestroy() {}, 
destroyed() {},
}
</script>
<style lang='scss'>
.slide__cmp {
    position: relative;
    width: 100%;
    height: 100%;

    margin: 0 auto;
    overflow: hidden;
    box-shadow: 0 1px 4px 0 rgba(0,0,0,.1);

    .slide__wrap {
    position: absolute;
    width: 100%;
    height: 100%;

    transform-origin: 0 0 0;
    // border: 1px solid #979797;
    transition: all .1s ease-in;
    .cover {
      object-fit: contain;
      max-height: 100%;
      max-width: 100%;
    }
  }
  .slide__shape {
    position: absolute;
  }
  .options-label {
    z-index: 1001;
    display: flex;
    align-items: center;
    justify-content: center;

    font-size: 20px;
    color: #fff;
    background-color: #999;
    // border-radius: 3px;
    &.selected {
      background: #5096f5;
    }
    &.MultipleChoice {
      border-radius: 50%;
    }
  }
  .submit-btn {
    z-index: 1001;
    display: flex;
    align-items: center;
    justify-content: center;

    font-size: 16px;
    color: #fff;
    background: #999999;

    border-radius: 4px;
    cursor: pointer;

    margin: 0 !important;

    &.can {
      background: #5096F5;
    }
    &:hover {
      .tips  {
        display: block;
      }
    }
    .tips {
      display: none;
      position: absolute;
      bottom: calc(100% + 10px);
      line-height: 17px;
      white-space: nowrap;
      background: #fff;
      border-radius: 4px;
      box-shadow: 0 4px 20px 0 rgba(2,2,2,.3);
      padding: 7px 14px 8px;
      left: 50%;
      transform: translateX(-50%);
      &::after {
        content: "";
        position: absolute;
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        border: 5px solid transparent;
        border-top-color: #fff;
      }
    }
  }
  .time-box {
    position: absolute;
    top: 5px;
    right: 0;
    z-index: 99;
      font-size: 14px;
      min-width: 190px;
      height: 36px;
      .timing {
        width: 100%;
        height: 100%;
        line-height: 36px;
        text-align: center;
        background: #e5e5e5;
        color: #666;
        border-radius: 2px;
        font-weight: bold;
        &.warning {
          background: rgba(248,79,65,.8);
          color: #666;
        }
        &.willEnd {
          background: #ddd;
          color: #666;
        }
      }
    }
  }
</style>