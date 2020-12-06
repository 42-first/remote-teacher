/*
 * @page：布局模式用户头像
 * @author: tuqiushuang
 * @update: 2020.7.29
 * @desc
 *
 */


<template>
  <section class="user-item" >
    <div class="avatar-wrap">
      <img class="user--avatar" :src="member.avatar" alt="头像" v-show="!member.video">
      <video class="user--video" :id="'uid-'+member.id" v-show="member.video"></video>
      <audio class="user--audio" :id="'audio-'+member.id" v-show="member.audio"></audio>
    </div>
    <div class="user-info box-start">
      <div class="user-name box-center">
        <p class="user-status box-center">
          <svg class="icon f16 cfff" aria-hidden="true">
            <use xlink:href="#icon20-yuyin" v-if="member.audio"></use>
            <use xlink:href="#icon20-yuyin-jingyin-01" v-else></use>
          </svg>
        </p>
        <span class="name f12">{{ member.name }}</span>
      </div>
    </div>
    <div class="active__audio line-scale-pulse-out" v-if="member.active">
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  </section>
</template>

<script>
  import { mapState, mapActions } from 'vuex';

  export default {
    name: 'avatar-local',
    props: {
      member: Object,
      index: Number,
    },
    data() {
      return {
        role: 5,
      };
    },
    filters: {},
    computed: {
      ...mapState('meeting', [
        'local',
      ]),
    },
    watch: {
      'member.video'(newVal) {
        console.log('member.video', newVal);

        setTimeout(()=>{
          this.initLocalVideo();
        }, 2000)
      },
      'member.audio'(newVal) {
        console.log('member.audio', newVal);

        setTimeout(()=>{
          this.initLocalAudio();
        }, 1000)
      },
      'member.id'(newVal) {
        console.log('change uid:', newVal)

        setTimeout(()=>{
          this.init();
        }, 1000)
      }
    },
    methods: {
      init() {
        this.initLocalVideo();
        this.initLocalAudio();
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
      }, 500)
    },
    updated() {},
    beforeDestroy() {
    },
    destroyed() {},
  }
</script>
<style lang='scss' scoped>
  .f12 {
    font-size: 12px;
  }
  .user-item {
    position: relative;
    width: 100%;
    height: 100%;

    .avatar-wrap {
      width: 100%;
      height: 100%;
      overflow: hidden;
      position: relative;
      // border-radius: 4px;

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
        // width: 100px;
        // height: 100px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
      }
    }

    .user-info {
      z-index: 1;
      position: absolute;
      bottom: 0;
      left: 0;

      width: 100%;
      height: 29px;

      color: #ffff;
      font-size: 12px;
      white-space: nowrap;

      .user-name {
        align-self: flex-end;
        height: 22px;

        background: rgba(0,0,0,.7);
        .name {
          height: 100%;
          line-height: 22px;
          padding: 0 5px 0 0;
        }
      }

      .user-status {
        width: 22px;
        height: 22px;
        border-radius: 50%;
      }
    }
  }

  .active__audio {
    position: absolute;
    bottom: 2px;
    right: 5px;

    font-size: 0;
  }

  .line-scale-pulse-out > div {
    background-color: #08BC72;
    margin: 0 1px;
    width: 2px;
    height: 15px;
    border-radius: 2px;
    animation-fill-mode: both;
    display: inline-block;
    animation: line-scale-pulse-out 0.9s -0.6s infinite cubic-bezier(0.85, 0.25, 0.37, 0.85);
  }
  .line-scale-pulse-out > div:nth-child(2), .line-scale-pulse-out > div:nth-child(4) {
    animation-delay: -0.4s !important;
  }
  .line-scale-pulse-out > div:nth-child(1), .line-scale-pulse-out > div:nth-child(5) {
    animation-delay: -0.2s !important;
  }

  @keyframes line-scale-pulse-out {
    0% {
      transform: scaley(1); }
    50% {
      transform: scaley(0.4); }
    100% {
      transform: scaley(1); }
  }

</style>
