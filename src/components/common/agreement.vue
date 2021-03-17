/**
 * @author [tuqiushuang]
 * @email [tuqiushuang@xuetangx.com]
 * @create date 2021-03-11 17:22:56
 * @modify date 2021-03-11 17:22:56
 * @desc [用户协议内容]
 */

<template>
<section class='agreement__wrap'>
  <section class="agreement__container">
    <div class="agreement__content">
      <div class="title f18 c333">学员承诺书</div>
      <div class="text__box f16 c333">
        <div>1、请实名进入课堂并按时参加学习。</div> 
        <div>2、遵守国家法律法规，注意网络言行规范，为自己的言行负责，营造积极向上的学习氛围。 </div>
        <div>3、尊重清华大学及授课老师所拥有的课程知识产权，直播课程的所有内容（可包括但不限于：授课视频、教学课件、大纲、题库等）仅供已报名的学员在清华终身学习平台学习使用，严禁任何形式的录制、复制、传播等。</div>
        <div>4、学员不得将本课程内容用于个人学习目的以外的任何商业及非商业性行为，包括但不限于：复制、以线下、线上等形式传播等。</div>
        <div>5、清华大学及授课教师拥有本项目相关的各类知识产权，其范围包括但不限于：</div>
        <div>（1）	课程体系设置；</div>
        <div>（2）	各门课程的教学内容；</div>
        <div>（3）	教学资料，如讲义、课件、数据等，包括文字及电子版本资料、音像资料等形式；</div>
        <div>（4）	教师授课、答疑的录音、录像等。</div>
        <div>（5）	其他知识产权。</div>
        <div>6、请您认真阅读本承诺书，点击“同意并继续”，代表您已阅读并同意以上内容，完全理解并接受所有的提示内容。阅读过程中，如果您不同意以上内容或其中任何条款，请立即停止注册程序。</div>
      </div>
    </div>
    <div class="agreement__btns f14">
      <div class="btn cancel f14" @click="close">退出班级</div>
      <div class="btn confirm f14" @click="confirm">同意并继续</div>
    </div>
  </section>
</section>
</template>

<script>

export default {
name: '',
components: {},
data() {
return {

};
},
filters: {},
props: {},
mixins: [  ],
computed: {},
watch: {},
methods: {
  close(){
    this.$emit('close')
  },
  confirm(){
    this.$emit('confirm')
  }
},
created() {

},
mounted() {

},
updated() {}, 
beforeDestroy() {}, 
destroyed() {},
}
</script>
<style lang='scss' scoped>
.agreement__wrap {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;

  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,.7);

  display: flex;
  align-items: center;
  justify-content: center;
}
.agreement__container {
  width: 9.2rem;
  height: 14.72rem;
  background: #fff;
  border-radius: 0.10666667rem;

  overflow: hidden;

}

.agreement__content {
  height: calc(100% - 2.13333333rem);
  padding-top: 0.8rem;
  box-sizing: border-box;
  overflow: hidden;
}

.agreement__container .title {
  text-align: center;
  margin-bottom: 0.4rem;
  line-height: 0.66666667rem;
}

.agreement__container .text__box {
  height: calc(100% - 1.06666667rem);
  overflow: auto;
  padding: 0 0.53333333rem 0.26666667rem;
  text-align: left;
}


.agreement__btns {
  margin: 0 0.93333333rem;
  border-top: 1px solid #ddd;
  display: flex;
  align-items: center;
  justify-content: space-around;
  height: 2.13333333rem;
}
.agreement__btns .btn{
  width: 2.66666667rem;
  height: 0.90666667rem;
  border-radius: 0.58666667rem;
  text-align: center;
  line-height: 0.90666667rem;
}

.agreement__btns .cancel{
  border: 1px solid #5096f5;
  color: #5096f5;
  
}
.agreement__btns .confirm{
  border: 1px solid #5096f5;
  color: #fff;
  background: #5096f5;
}
</style>