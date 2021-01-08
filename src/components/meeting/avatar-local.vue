/*
 * @page：用户展示
 * @author:
 * @update: 2020.12.08
 * @desc
 *
 */


<template>
  <section class="user-item box-center" :class="{ 'fullscreen': fullscreen }" >
    <div class="avatar-wrap box-center" v-if="member">
      <img class="user--avatar" :class="{ 'small': meetingLayout === MeetingMode.DEFAULT }" :src="member.avatar" alt="头像" v-show="!member.video">
      <!-- 本地会议 -->
      <template v-if="meetingSDK === 'local'">
        <video class="user--video" :id="'uid-'+member.id" v-show="member.video"></video>
        <audio class="user--audio" :id="'audio-'+member.id" v-show="member.audio"></audio>
      </template>
      <div class="user--video" :id="member.id" v-show="member.video" v-else></div>
    </div>
    <div class="user__status box-between" v-if="member">
      <div class="user-name box-center cfff">
        <svg class="icon f16 cfff mr3" aria-hidden="true" v-if="member.role === 'lecturer' || member.role === 'collaborator'">
          <use xlink:href="#iconlaoshi"></use>
        </svg>
        <template v-if="member.audio">
          <div class="active__audio line-scale-pulse-out" v-if="member.active">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
          <svg class="icon f16 cfff" aria-hidden="true" v-else>
            <use xlink:href="#icon20-yuyin-weifashengbeifen"></use>
          </svg>
        </template>
        <svg class="icon f16 cfff" aria-hidden="true" v-else>
          <use xlink:href="#icon20-yuyin-weifasheng"></use>
        </svg>
        <span class="name f12">{{ member.name }}</span>
      </div>
    </div>
  </section>
</template>

<script>
  import { mapState, mapActions } from 'vuex';

  // 会议模式
  const MeetingMode = {
    // 默认 default
    DEFAULT: 0,
    // 九宫格 Jiugongge
    JIUGONGGE: 1,
    // 发言者模式
    SPEAKER: 2
  };

  export default {
    name: 'avatar-local',
    props: {
      member: {
        type: Object,
        default: {}
      },
      fullscreen: {
        type: Boolean,
        default: false
      },
    },
    data() {
      return {
        MeetingMode,
        role: 5,
      };
    },
    filters: {},
    computed: {
      ...mapState('meeting', [
        'local',
        'meetingSDK',
        'meetingLayout',
      ]),
    },
    watch: {
      'member.video'(newVal) {
        console.log('member.video', newVal);

        if(this.meetingSDK === 'local') {
          setTimeout(()=>{
            this.initLocalVideo();
          }, 1000)
        } else if(this.meetingSDK === 'tencent') {
          setTimeout(()=>{
            this.initTencent();
          }, 1000)
        } else {
          this.init();
        }
      },
      'member.audio'(newVal) {
        console.log('member.audio', newVal);

        if(this.meetingSDK === 'local') {
          setTimeout(()=>{
            this.initLocalAudio();
          }, 1000)
        } else if(this.meetingSDK === 'tencent') {
          setTimeout(()=>{
            this.initTencent();
          }, 100)
        } else {
          this.init();
        }
      },
      'member.id'(newVal) {
        console.log('change uid:', newVal)

        setTimeout(()=>{
          this.init();
        }, 100)
      },
    },
    methods: {
      init() {
        if(this.meetingSDK === 'local') {
          this.initLocalVideo();
          this.initLocalAudio();
        } else if(this.meetingSDK === 'tencent') {
          this.initTencent();
        }
      },

      initEvent() {
        // TODO: 这里处理不能自动播放问题
        // https://trtc-1252463788.file.myqcloud.com/web/docs/tutorial-11-advanced-auto-play-policy.html
        // document.addEventListener('mousedown', this.retryPlay);
      },

      /**
       * @method 初始化腾讯会议播放
       */
      initTencent() {
        let rtcEngine = window.rtcEngine;
        let member = this.member;
        let uid = String(member && member.id);

        if(rtcEngine && uid) {
          let stream = rtcEngine.members.get(uid);

          if(stream && (member.audio || member.video) && (stream.hasAudio() || stream.hasVideo())) {
            try {
              if(stream.audioPlayer_ || stream.videoPlayer_) {
                stream.stop();
              }

              // stream.stop();
              stream.play(uid)
              .catch(err => {
                let errCode = err.getCode()
                if (errCode === 0x4043) {
                  // stream.stop()
                  stream.resume()
                  console.log('stream.play 0x4043 自动播放失败');
                }

                document.addEventListener('mousedown', this.retryPlay);

                console.error('stream.play', err, err.message);
              });
            } catch (error) {
              stream.play(uid)
              console.error('Stream play exception:%s', error.message);
            }
          } else if(stream && !member.audio && !member.audio) {
            stream.stop();
          }
        }
      },

      /**
       * @method 尝试播放
       * @param
       */
      retryPlay() {
        let rtcEngine = window.rtcEngine;
        let member = this.member;
        let uid = String(member && member.id);

        if(rtcEngine && uid) {
          let stream = rtcEngine.members.get(uid);

          if(stream && (member.audio || member.video)) {
            try {
              stream.stop()
              stream.play(uid, { muted: false })
              .catch(err => {
                let errCode = err.getCode()
                if (errCode === 0x4043) {
                  // stream.stop()
                  stream.resume()
                  console.log('retryPlay stream.play 0x4043 自动播放失败');
                }
              });
            } catch (error) {
              console.error('Stream play exception:%s', error.message);
            }
          }
        }

        // 移除用户鼠标事件监听
        document.removeEventListener('mousedown', this.retryPlay);
      },

      /**
       * @method 初始化本地视频会话
       */
      initLocalVideo() {
        let rtcEngine = window.rtcEngine;
        let member = this.member;
        let uid = member && member.id;
        let videoConsumer = member.videoConsumer;

        console.log('initLocalVideo:', this.local, uid, videoConsumer)

        let role = 'remote';
        let local = this.local || this.user && this.user.id;
        if(local == uid) {
          role = 'local';
        }

        let videoEl = this.$el.querySelector(`#uid-${uid}`);
        if(!videoEl || !rtcEngine || !member.video) {
          return this;
        }

        if (role === 'local') {
          let consumer = this.getProducer();
          consumer && this._setTracks(videoEl, consumer);
        } else if (role === 'remote') {
          let consumer = this.getConsumer(videoConsumer.id || videoConsumer._id);
          consumer && this._setTracks(videoEl, consumer);
        }
      },

      /**
       * @method 初始化本地视频会话
       */
      initLocalAudio() {
        let rtcEngine = window.rtcEngine;
        let member = this.member;
        let uid = member && member.id;
        let audioConsumer = member.audioConsumer;

        console.log('initLocalAudio:', this.local, uid, audioConsumer)

        let role = 'remote';
        let local = this.local || this.user && this.user.id;
        if(local == uid) {
          role = 'local';

          return this;
        }

        let videoEl = this.$el.querySelector(`#audio-${uid}`);
        if(!videoEl || !rtcEngine || !member.audio) {
          return this;
        }

        if(role === 'remote') {
          let consumer = this.getConsumer(audioConsumer.id || audioConsumer._id);
          consumer && this._setTracks(videoEl, consumer);
        }
      },

      _setTracks(videoEl, consumer) {
        let { track } = consumer;
        console.log('track', track, consumer)

        if (track) {
          const stream = new MediaStream();
          stream.addTrack(track);
          videoEl.srcObject = stream;

          videoEl.oncanplay = () => videoEl.play();
          videoEl.onplay = () =>{
            videoEl.play()
              .catch((error) => console.warn('audioElem.play() failed:%o', error));
          };

          videoEl.play()
            .catch((error) => console.warn('videoEl.play() failed:%o', error));
        } else {
          videoEl.srcObject = null;
        }
      },

      /**
       * @method
       */
      getConsumer(id) {
        let rtcEngine = window.rtcEngine;
        let consumers = rtcEngine.getConsumers();
        let consumer = consumers.get(id);
        return consumer;
      },

      getProducer() {
        let rtcEngine = window.rtcEngine;
        let producer = rtcEngine.getProducer();
        let consumer = producer.get('video');

        return consumer;
      },
    },
    created() {
    },
    mounted() {
      setTimeout(()=>{
        this.init();
      }, 0)
    },
    updated() {},
    beforeDestroy() {
    },
    destroyed() {},
  }
</script>
<style lang='scss' scoped>
  .mr3 {
    margin-right: 3px;
  }

  .user-item {
    position: relative;
    width: 100%;
    height: 100%;

    flex-flow: column;

    &.fullscreen {
      .avatar-wrap {
        width: 100%;
        height: 100%;
        background: transparent;

        .user--avatar {
          width: 100px;
          height: 100px;
        }
      }

      .user__status {
        position: absolute;
        bottom: 0;

        padding: 0 5px 0 0;
        background: transparent;

        .user-name {
          padding: 0 5px;
          height: 100%;
          background: rgba(0,0,0,0.7);
        }
      }
    }

    .avatar-wrap {
      position: relative;
      width: 100%;
      height: 100%;
      overflow: hidden;

      background: #3a3a3a;

      .user--video,
      .user--avatar {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);

        width: 100%;
      }

      .user--video {
        height: 100%;
        object-fit: cover;
      }

      .user--audio {
        opacity: 0;
        position: absolute;
      }

      .user--avatar {
        width: 60px;
        height: 60px;
        border-radius: 50%;

        &.small {
          top: calc(50% - 10px);
        }
      }
    }

    .user__status {
      position: absolute;
      bottom: 0;
      left: 0;

      padding: 0 5px;
      width: 100%;
      height: 26px;
      background: rgba(0,0,0,0.6);

      white-space: nowrap;

      .name {
        padding: 0 5px;
      }
    }
  }

  .active__audio {
    font-size: 0;
  }

  .line-scale-pulse-out > div {
    background-color: #08BC72;
    margin: 0 1px;
    width: 1px;
    height: 12px;
    border-radius: 1px;
    animation-fill-mode: both;
    display: inline-block;
    animation: line-scale-pulse-out 0.9s -0.6s infinite cubic-bezier(0.85, 0.25, 0.37, 0.85);
  }

</style>
