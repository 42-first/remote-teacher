/*
 * @page：公账号订阅消息
 * @author: chenzhou
 * @update: 2021.3.21
 * @desc
 *
 */

<template>
  <section class="page__subscribe">
    <div></div>
  </section>
</template>
<script>
  import { configWX } from '@/util/wx-util'

  export default {
    name: 'subscribe',
    data() {
      return {
      };
    },
    components: {
    },
    computed: {
    },
    watch: {
    },
    methods: {
      /**
       * @method 增加微信订阅消息组件
       */
      addSubscribe() {
        const ua = navigator.userAgent.toLowerCase();

        // 检测微信版本号 iOS android系统
        // 微信版本要求为：7.0.12及以上。 系统版本要求为：iOS 10.3及以上、Android 5.0及以上
        let version = ua.replace(/^.*micromessenger\/([\d.]+).*$/, "$1");
        let iOS = !!ua.match(/\(i[^;]+;( u;)? cpu.+mac os x/);
        this.platform = iOS ? 'ios' : 'android';

        if(version !== ua) {
          setTimeout(()=>{
            var weappEl = document.getElementById('J_subscribe');

            weappEl.addEventListener('success', (e) => {
              console.log('success', e.detail);
            });

            weappEl.addEventListener('error', (e) => {
              console.log('fail', e.detail);
            });
          }, 1000)

          let rem2px = window.lib && window.lib['flexible'] && window.lib['flexible']['rem2px'];
          let height = rem2px && rem2px(1) || 35;
          let script = document.createElement('script');
          script.type = 'text/wxtag-template';
          script.text = `<div style="width:100%;height:${height}px;display:flex;justify-content:center;align-items: center; color: #fff;font-size:32px;">消息订阅</div>`;

          let weappEl = document.createElement('wx-open-subscribe');
          weappEl.setAttribute('id', 'J_subscribe');
          weappEl.setAttribute('class', 'subscribe__btn');
          weappEl.setAttribute('template', 'gC7kS8pbtUEFgzU4s-6cAIybG9mF7MrUBcCD77UE2wY');

          weappEl.innerHTML = script.outerHTML;
          this.$el.appendChild(weappEl);

          console.log('subscribe render');
        }
      },
    },
    created() {
      configWX();
    },
    mounted() {
      let ua = navigator.userAgent.toLowerCase();
      let isWeixin = ~ua.indexOf('micromessenger');

      setTimeout(()=>{
        isWeixin && this.addSubscribe(ua);
      }, 500)
    },
    beforeDestroy() {
    }
  };
</script>

<style lang="scss">
  .page__subscribe {
    z-index: 1;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;

    background: #333;
  }

</style>


