<!--二维码控制面板 被父组件 home.vue 引用 -->
<template>
	<div class="mask-content qrcode-box">
    <div class="anhao">
      <div class="f16">{{ $t('classsignal') }}</div>
      <div class="anhao-code f32">{{inviteCode}}</div>
    </div>

    <v-touch v-show="qrcodeStatus === 1" class="scale-box" v-on:tap="setQrcodeStatus">
      <img src="~images/teacher/saoma-da.png" alt="">
      <div class="bb f16">{{ $t('zoomin') }}</div>
    </v-touch>

    <v-touch v-show="qrcodeStatus === 2" class="scale-box" v-on:tap="setQrcodeStatus">
      <img src="~images/teacher/saoma-xiao.png" alt="">
      <div class="bb f16">{{ $t('zoomout') }}</div>
    </v-touch>
    
    <v-touch class="btn _btn" v-on:tap="tryShowPresentation">{{ $tc('startclass', isBrandNewPpt) }}</v-touch>
  </div>
</template>

<script>
	import {mapGetters} from 'vuex'
	import config from '@/pages/teacher/config/config'

	export default {
	  name: 'Qrcode',
	  data () {
	    return {
	    }
	  },
	  computed: {
      ...mapGetters([
      	'inviteCode',
        'socket',
        'lessonid',
        'isBrandNewPpt',
				'qrcodeStatus',
				'isCloneClass'
      ])
    },
	  created(){
	  },
	  methods: {
	  	/**
		   * 点击放大、缩小二维码的按钮，发送指令给 WebSocket
		   *
		   * @event tap
		   */
		  setQrcodeStatus () {
				 // 克隆班不能执行当前操作
        if (!!this.isCloneClass) {
          this.$toast({
            message: this.$t('cloneTips'),
            duration: 3e3
          });
          return
        }
		    let self = this
		    let qrcodeStatus = self.qrcodeStatus
		    let str = JSON.stringify({
		      'op': 'tryzoomqrcode',
		      'lessonid': self.lessonid,
		      'qrcode': (qrcodeStatus === 1) ? 2 : 1
		    })

		    self.socket.send(str)
		  },
		  /**
		   * 二维码控制页点击 开始上课、继续上课 按钮，发送指令给 WebSocket
		   *
		   * @event tap
		   */
		  tryShowPresentation () {
				 // 克隆班不能执行当前操作
        if (!!this.isCloneClass) {
          this.$toast({
            message: this.$t('cloneTips'),
            duration: 3e3
          });
          return
        }
		    let self = this
		    let str = JSON.stringify({
		      'op': 'tryshowpresentation',
		      'lessonid': self.lessonid
		    })

		    self.socket.send(str)
		  },
	  }
	}
</script>

<style lang="scss" scoped>
	@import "~@/style/_variables";
	.qrcode-box {
		width: 4.8rem;

		.anhao {
		  margin-bottom: 1rem;
		}
		.scale-box {
			img {
				width: 100%;
			}
			.bb {
				height: 2.533333rem;
				padding-top: 0.32rem;
			}
		}
		._btn {
			width: 3.733333rem;
			margin: 0 auto;
		}
	}
</style>
