/**
 * @author [tuqiushuang]
 * @email [tuqiushuang@xuetangx.com]
 * @create date 2021-07-15 14:13:43
 * @modify date 2021-07-15 14:13:43
 * @desc [分组详情]
 */


<template>
<section class="team_cmp">
  <section class="tema__box pointer" tabindex="1" @blur="handleToggle(false)">
    <div class="team_info box-between" @click="handleToggle()">
      <p class="f12 cdd"><!-- 小组作答：--> {{ $t('team.groupanswered') }} <span class="f14 c333 bold">{{team.teamName}}</span></p>
      <p class="f12 cdd">
         <!-- 共{{ team.memberCount }}人 --> {{ $t('team.totalmembers', {num: team.memberCount}) }} 
        <svg class="icon font16 blue" :class="{'rotate': showTeamList}" aria-hidden="true">                 
          <use xlink:href="#icon16-xiaojiantou-xia"></use>        
        </svg>
      </p>
    </div>
    <div class="team_list box-start" v-if="showTeamList">
      <div class="team_member box-center" v-for="member in team.memberList">
        <img :src="member.avatar" :alt="member.userName" />
        <span class="f12 c666">{{ member.userName }}</span>
      </div>
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
      showTeamList: false
    };
  },
  filters: {},
  props: {
    team: {
      type: Object,
      default: {}
    }
  },
  mixins: [  ],
  computed: {},
  watch: {},
  methods: {
    handleToggle(show){
      if(typeof show === 'undefined'){
        this.showTeamList = !this.showTeamList
        return this
      }
      this.showTeamList = false
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
  .team_cmp {
    margin: 20px;
  }
  .tema__box {
    background: #f5f5f5;
    // border: 1px solid #666;
    border-radius: 4px;
    color: #666;
    outline: none;
    &:focus {
      border-color: #fff;
    }
    .team_info {
      padding: 6px 10px;
      p {
        height: 18px;
      }
      .icon {
        transition: all .5s;
        &.rotate {
          transform: rotate(-180deg);
        }
      }
    }
    .team_list {
      // border-top: 1px solid #414141;
      padding: 15px 17px 0;
      flex-wrap: wrap;
      .team_member {
        flex-direction: column;
        width: 65px;
        margin-bottom: 20px;
        
        &:not(:nth-of-type(4n)) {
          margin-right: 13px;
        }
        img {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          margin-bottom: 5px;
        }
        span {
          width: 100%;
          text-overflow: ellipsis;
          overflow: hidden;
          white-space: nowrap;
          
        }
      }
    }
  }
</style>