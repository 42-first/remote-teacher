/*
 * @page：完善个人信息
 * @author: chenzhou
 * @update: 2018.02.28
 * @desc 用户第一次进入雨课堂弹层展示完善信息
 *
 */


<template>
  <!-- 完善信息 -->
  <div class="info__wrap" aria-cmp="">
    <!-- 内容展示区 -->
    <section class="info__area">
      <header class="info__header">
        <div class="header__tip">
          <!-- 花30秒完善你的信息 -->{{ $t('infocosttime') }}<br><!-- 方便老师快速认识你 -->{{ $t('infogood') }}
        </div>
        <img class="user-avatar" :src="user_profile.avatar_96" v-if="user_profile" >
      </header>

      <!-- form -->
      <form class="info__form">
        <div class="form__item">
          <label class="item--label" for="name" title="真实姓名"><!-- 真实姓名 -->{{ $t('merealname') }}</label>
          <input class="item--ipt" type="text" name="name" v-model="name" :placeholder="$t('nameeg')">
        </div>
        <div class="form__item">
          <label class="item--label" for="name" title="社会身份"><!-- 社会身份 -->{{ $t('merole') }}</label>
          <div class="info__roles">
            <p :class="['role--btn', role === 1 ? 'active':'']" @click="handleselectRole(1)"><!-- 老师 -->{{ $t('meteacher') }}</p>
            <p :class="['role--btn', role === 2 ? 'active':'']" @click="handleselectRole(2)"><!-- 学生 -->{{ $t('student') }}</p>
            <p :class="['role--btn', role === 3 ? 'active':'']" @click="handleselectRole(3)"><!-- 其他 -->{{ $t('meothers') }}</p>
          </div>
        </div>
        <div class="form__item" v-if="role===1||role===2">
          <label class="item--label" for="school" title="所在院校"><!-- 所在院校 -->{{ $t('meschoolbelongs') }}</label>
          <div class="item--ipt">
            <input class="item--ipt--inner" type="text" name="school" v-model="school" :placeholder="$t('schooleg')" autocomplete="off" @input="handlehint($event)" @focus="handleshowHint(true)" @blur="handleshowHint(false)" >
            <!-- 学校提示 -->
            <ul class="school__list" v-show="showHint">
              <li class="school" v-for="school in schoolList" @click="handlesetSchol(school, $event)">{{ school }}</li>
            </ul>
          </div>
        </div>
        <div class="form__item" v-if="role===3">
          <label class="item--label" for="school" title="组织/机构"><!-- 组织/机构 -->{{ $t('infoorg') }}</label>
          <input class="item--ipt" type="text" name="school" v-model="school" :placeholder="$t('infoorgtip')">
        </div>
        <div class="form__item" v-if="role===2">
          <label class="item--label" for="school_number" title="在校学号"><!-- 在校学号 -->{{ $t('mestudentid') }}</label>
          <input class="item--ipt" type="text" name="school_number" v-model="school_number" :placeholder="$t('infonumbereg')">
        </div>
      </form>

      <!-- footer -->
      <footer class="info__footer">
        <p :class="['info--comfirm', cansubmit ? 'active' : '']" @click="handleconfirm"><!-- 确定 -->{{ $t('confirm') }}</p>
        <p class="footer--tip"><!-- * 你可以在“我的主页”中随时修改个人信息 -->{{ $t('infotip') }}</p>
      </footer>
    </section>
  </div>
</template>
<style lang="scss">
  .info__wrap {
    z-index: 100;
    position: fixed;
    top: 0;
    left: 0;

    width: 100%;
    height: 100%;

    background: rgba(0, 0, 0, 0.7);
  }

  .info__area {
    position: absolute;
    top: 50%;
    left: 50%;

    width: calc(100% - 40px);
    min-height: 13.866667rem;
    transform: translate(-50%, -50%);

    background: #fff;
    border-radius: 0.16rem;

    .info__header {
      position: relative;
      height: 3.2rem;

      font-size: 0.426667rem;
      color: #666;
      background: #F6F7F8;
      border-bottom: 0.053333rem solid #E5E5E5;

      border-radius: 0.16rem 0.16rem 0 0;

      .header__tip {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
        text-align: center;
      }

      .user-avatar {
        margin: -0.8rem auto;
        display: block;
        width: 1.6rem;
        height: 1.6rem;

        border: 0.053333rem solid #E5E5E5;
        border-radius: 50%;
      }
    }

    .info__form {
      box-sizing: border-box;
      height: 8.426667rem;
      padding: 1.6rem 0.533333rem;

      font-size: 0.426667rem;
      color: #666;

      .form__item {
        position: relative;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        padding-bottom: 0.4rem;

        .item--label {
          width: 2.0rem;
          text-align: right;
        }

        .item--ipt {
          position: relative;
          flex: 1;
          padding: 0.186667rem 0.266667rem;

          outline: none;
          appearance: none;
          border: none;
          border-bottom: 1px solid #EEEEEE;

          .item--ipt--inner {
            width: 100%;
            outline: none;
          }
        }
      }

      .info__roles {
        flex: 1;
        display: flex;
        justify-content: space-around;
        align-items: center;
        padding: 0 0.4rem 0 0;

        .role--btn {
          padding: 0.133333rem 0.346667rem;
          font-size: 0.32rem;
          border: 1px solid #E5E5E5;
        }

        .active {
          color: #fff;
          background: #5096F5;
          border: 1px solid #5096F5;
        }
      }
    }


    .info__footer {
      padding-bottom: 0.426667rem;
      color: #9B9B9B;
      text-align: center;

      .info--comfirm {
        margin: 0 auto 0.4rem;
        width: 5.333333rem;
        height: 1.173333rem;
        line-height: 1.173333rem;
        font-size: 0.48rem;
        background: #E5E5E5;
        border-radius: 0.533333rem/50%;
      }

      .active {
        color: #fff;
        background: #5096F5;
        box-shadow: 0 0.106667rem 0.186667rem rgba(80, 150, 245, 0.4);
      }

      .footer--tip {
        font-size: 0.32rem;
      }
    }

  }

  .school__list {
    z-index: 1;
    box-sizing: border-box;
    position: absolute;
    top: 0.96rem;
    left: 0;
    right: 0;
    min-width: 5.333333rem;
    max-height: 4.266667rem;
    text-align: left;
    background-color: #F6F7F8;
    overflow-x: hidden;
    overflow-y: auto;

    .school {
      padding-left: 0.186667rem;
      height: 1.173333rem;
      line-height: 1.173333rem;
      overflow: hidden;
      text-overflow:ellipsis;
      white-space: nowrap;
      border-bottom: 1px solid #EEEEEE;
    }

    .school:active,
    .active {
      background-color: #c7c7c7;
    }

    .school:last-child {
      border: none;
    }
  }

  @media screen and (min-width: 320px) and (max-width: 340px) {
    .info__area {
      width: calc(100% - 0.533333rem);

      .info__form {
        padding: 1.6rem 0;
      }
    }
  }

</style>
<script>

  export default {
    props:['showInfo'],
    data() {
      return {
        miniprogram: false,
        // 用户信息
        user_profile: null,
        // 角色 1 教师 2 学生 3 其它
        role: 0,
        name: '',
        school: '',
        school_number: '',
        // 是否显示学校提示
        showHint: false,
        // 学校提示列表
        schoolList: [],
        // 是否可以提交
        cansubmit: false
      }
    },
    watch: {
      'showInfo'(newVal, oldVal) {
        newVal && this.getUser();
      },
      'role'(newVal, oldVal) {
        this.checkUserInfo();
      },
      'name'(newVal, oldVal) {
        this.checkUserInfo();
      },
      'school'(newVal, oldVal) {
        this.checkUserInfo();
      },
      'school_number'(newVal, oldVal) {
        this.checkUserInfo();
      }
    },
    methods: {
      /**
       * @method 获取用户信息
       *
       */
      getUser() {
        let URL = '/v/course_meta/user_info';

        request.get(URL)
          .then((res) => {
            if(res && res.data) {
              this.user_profile = res.data.user_profile;

              if(this.user_profile) {
                this.name = this.user_profile['name'];
                this.role = this.user_profile['role'];
                this.school_number = this.user_profile['school_number'];
                this.school = this.user_profile['school'];
              }
            }
          });
      },

      /**
       * @method 检测用户信息 是否可以提交
       * @param
       */
      checkUserInfo() {
        let cansubmit = true;

        // 真实姓名 角色 学校/组织
        if(!this.name || !this.role || !this.school) {
          cansubmit = false;
        }

        // 学号
        if(this.role === 2 && !this.school_number) {
          cansubmit = false;
        }

        this.cansubmit = cansubmit;
      },

      /**
       * @method 学校列表
       * @param keyWord
       */
      querySchool(keyWord) {
        let URL = '/school_name/school_name_query';
        console.log(keyWord);

        !keyWord && (this.schoolList = []);
        keyWord && request.post(URL, { query: keyWord })
          .then((res) => {
            if(res.success) {
              this.schoolList = res.query_result;

              console.log(this.schoolList)
            }
          });
      },

      /**
       * @method 节流函数 (underscore)
       * @param
       */
      throttle(func, wait, options) {
        var context, args, result;
        var timeout = null;
        var previous = 0;
        if (!options) options = {};
        var later = function() {
          previous = options.leading === false ? 0 : Date.now;
          timeout = null;
          result = func.apply(context, args);
          if (!timeout) context = args = null;
        };

        return function() {
          var now = Date.now;
          if (!previous && options.leading === false) previous = now;
          var remaining = wait - (now - previous);
          context = this;
          args = arguments;
          if (remaining <= 0 || remaining > wait) {
            if (timeout) {
              clearTimeout(timeout);
              timeout = null;
            }
            previous = now;
            result = func.apply(context, args);
            if (!timeout) context = args = null;
          } else if (!timeout && options.trailing !== false) {
            timeout = setTimeout(later, remaining);
          }
          return result;
        };
      },

      /**
       * @method 选择身份
       * @param role
       */
      handleselectRole(role) {
        this.role = role;
      },

      /**
       * @method 设置学校名称
       * @param school
       */
      handlesetSchol(school, evt) {
        console.log(school);
        this.school = school;
        this.showHint = false;

        // evt.target.classList.add('active');
      },

      /**
       * @method 检索学校
       * @param
       */
      handlehint(evt) {
        let keyWord = evt.target.value;

        this.throttle(this.querySchool, 1000)(keyWord)
      },

      /**
       * @method 隐藏学校列表
       * @param
       */
      handleshowHint(show) {
        if(show) {
          this.showHint = show;
        } else {
          setTimeout(()=>{
            this.showHint = show;
          }, 500)
        }
      },

      /**
       * @method 提交个人信息
       * @param
       */
      handleconfirm(evt) {
        let URL = '/course_meta/simple_user_info';
        let params = {
          'name': this.name,
          'school': this.school,
          'role': this.role,
          'school_number': this.school_number
        };

        if(this.cansubmit) {
          this.cansubmit = false;

          request.post(URL, params)
          .then((res) => {
            if(res.success) {
              location.reload();
            }
          });
        }
      }
    },
    created() {
      let self = this;
      this.getUser();
    }
  }
</script>
