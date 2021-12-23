/**
 * @page：不在班级 无权限访问用户
 * @author: chenzhou
 * @update: 2021.12.11
 * @desc
 *
 */


<template>
  <!-- 无权限用户进入 输入课堂暗号加入班级 -->
  <section class="student__no-limits">
    <section class="limits__modal" v-if="visibleSelect">
      <section class="modal__content">
        <section class="title pb10"><!-- 提示 -->{{ $t('tips') }}</section>
        <section class="content f14"><!-- 啊哦～你还未加入这个班级 -->{{ $t('lesson.notinclass') }}</section>
      </section>
      <section class="modal__btns">
        <section class="cancel" @click="handleClosed"><!-- 暂不加入 -->{{ $t('lesson.dontjoinclass') }}</section>
        <section class="confirm" @click="handleEnterCode"><!-- 我有暗号 -->{{ $t('lesson.havecode') }}</section>
      </section>
    </section>
    <section class="enterCode__wrap" v-else>
      <section class="options__wrap">
        <i class="iconfont icon-shiti_guanbitouping f24" @click="handleCloseCode"></i>
        <section class="complete f18" @click="handleJoinClass"><!-- 完成 -->{{ $t('lesson.codedone') }}</section>
      </section>
      <section class="input__wrap">
        <p class="placeholder f16"><!-- 输入暗号 -->{{ $t('lesson.entercode') }}</p>
        <input class="f16" ref="input" type="text" v-model="lessonCode" autofocus maxlength="5" @focus="handleFocus" @blur="handleBlur" />
        <!-- 错误提示及绑定 -->
        <div class="box-between f14">
          <p class="error__tips">{{errorTips}}</p>
          <a class="error__bind blue" :href="bindURL" v-if="bindURL">点击绑定</a>
        </div>
      </section>
    </section>
  </section>
</template>

<script>
import { mapState } from 'vuex';


export default {
  name: 'join',
  data() {
    return {
      // 无权限
      noLimits: false,
      // 选择输入暗号还是退出
      visibleSelect: true,
      errorTips: '',
      // 课堂暗号
      lessonCode: '',
      isFocus: false,
      // 绑定地址
      bindURL: '',
    };
  },
  components: {
  },
  mixins: [ ],
  computed: {
    ...mapState([
      'lessonId',
    ])
  },
  created() {
  },
  mounted() {
    this.init()
  },
  updated() {},
  beforeDestroy() {
  },
  filters: {
  },
  watch: {
  },
  methods: {
    /**
     * @method 页面初始化
     * @params
     */
    async init() {
      try {
        console.log('lessonId:', this.lessonId);

      } catch (error) {
        console.error('[init] exception:%s', error);
      }
    },

    /**
     * @method 签到
     * @param source: 场景值
     */
    checkin(source = 1, code) {
      let URL = API.lesson.checkin;
      let params = {
        'source': source
      };

      if(code) {
        params['inviteCode'] = code;
        params['joinIfNotIn'] = true;
      } else {
        params['lessonId'] = this.lessonId;
      }

      return request.post(URL, params)
      .then((res)=>{
        if(res && res.code === 0) {
          let data = res.data;
          this.token = data.lessonToken;

          if(data.role) {
            this.role = data.role;
          }

          // 设置当前userid 专业版是虚ID 基础本是实ID
          if(data.identityId) {
            this.identityId = data.identityId;
          }
        }

        // return res.code;
        return res;
      })
      .catch(error => {
        console.log('checkin:', error);
        return { code: -1 };
      })
    },

    /**
     * @methos 加入班级验证
     */
    async handleJoinClass() {
      let lessonCode = this.lessonCode.replace(/^\s+|\s+$/g, '');
      if (lessonCode && lessonCode.length === 5 && /^([A-Za-z0-9])*?$/.test(lessonCode)) {
        let { code, data, msg } = await this.checkin(6, lessonCode);

        if(code === 0) {
          // 重新访问下页面
          this.$parent.init();
          this.handleClosed();
        } else if(code === 50019) {
          // 专业版未绑定
          const { university_id, university_name: name, university_authen_url } = data || {};
          this.errorTips = this.$t('lesson.isprotips', { name }) || `您未作身份绑定，该班级只允许${name}人员进入，请绑定后重新加入班级。`
          this.bindURL = university_authen_url ? `/v/index/bindSchool_cas/${university_id}` : `/v/index/bindSchool/${university_id}`;
        } else  {
          // 加入不成功的错误码信息
          this.errorTips = this.$t(`code.${code}`) || this.$t('lesson.enterwrong');
        }
      } else {
        this.errorTips = this.$t('lesson.enterwrong');
      }
    },

    /**
     * @methos 我有暗号
     */
    handleEnterCode(evt) {
      this.visibleSelect = false;

      Promise.resolve().then(() => {
        this.$refs.input.focus();
      });
    },

    /**
     * @methos 关闭输入框弹窗 回到modal框
    */
    handleCloseCode(){
      this.visibleSelect = true;
      this.lessonCode = '';
    },

    handleFocus(){
      this.errorTips = '';
      this.isFocus = true;
    },

    handleBlur(){
      this.isFocus = false;
    },

    handleClosed(evt) {
      this.$router.back();
    }

  }
};
</script>

<style lang="scss" scoped>
  .student__no-limits {
    z-index: 1;
    position: fixed;
    top:0;
    left:0;

    width:100%;
    height:100%;

    background:rgba(0,0,0,.5);
  }

  .limits__modal {
    width: 72.53333333333333vw;
    position:fixed;
    top: 50%;
    left: 50%;
    transform:translate(-50%, -50%);

    background: #fff;
    border-radius: 1.6vw;
  }

  .modal__content {
    padding: 5.333333333333334vw;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border-bottom: 1px solid #eee;
  }
  .modal__content .title {
    padding-bottom: 2.666666666666667vw;
    font-weight: bold;
    color: #333;
    font-size: 4.533333333333333vw;
    line-height: 6.4vw;
  }
  .modal__content .content {
    color: #333;
    line-height: 5.333333333333334vw;
  }

  .modal__btns {
    width: 100%;
    padding: 2.666666666666667vw 0 3.2vw;
    display:flex;
    justify-content: space-between;
    position: relative;
    font-size: 4.533333333333333vw;

    .confirm,
    .cancel {
      flex: 1;
      text-align: center;
    }
  }
  .modal__btns::after {
    position: absolute;
    content: "";
    top: 0;
    left: 50%;
    width: 1px;
    height: 100%;
    transform: translateX(-50%);
    background: #eee;
  }

  .modal__btns .cancel {
    color: #333;
  }
  .modal__btns .confirm {
    color: #5096F5;
  }
  .enterCode__wrap {
    position:fixed;
    bottom:0;
    left:0;
    width:100%;
    background:#fff;
  }

  .options__wrap {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 5.333333333333334vw 0 4vw;
    height: 13.333333333333334vw;
    border-bottom: 1px solid #eee;
    box-sizing: border-box;
  }
  .options__wrap .complete {
    color: #5096F5;
  }
  .input__wrap {
    padding: 5.333333333333334vw 4vw 5.6000000000000005vw;
  }
  .input__wrap .placeholder {
    padding-left: 1.3333333333333334vw;
    color: #666;
  }
  .input__wrap input {
    margin-top: 4.666666666666667vw;
    width: 100%;
    height: 13.066666666666665vw;
    border-radius: 1.0666666666666667vw;
    border: 1px solid #eee;
    box-sizing: border-box;
    padding: 0 2.666666666666667vw;
  }
  .input__wrap .error__tips {
    padding-left: 1.3333333333333334vw;
    color: #F84F41;
    margin-top: 1.3333333333333334vw;
    text-align: left;
  }

  .error__bind {
    width: 20vw;
  }

</style>
