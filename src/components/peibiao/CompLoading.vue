<script>
export default {
  name: 'PeiBiaoGlobalLoading',
  props: {
    platform: {
      type: String,
      default: 'zhktpt',
    },
  },
  data() {
    return {
      isLoading: true,
    };
  },
  methods: {
    setLoading(loading) {
      this.isLoading = loading;
    },
  },
};
</script>

<template>
  <div
    :class="`pei-biao-global-class-name-loading pei-biao-global-class-name-loading-${platform}`"
    v-show="isLoading"
  >
    <div class="loading-spin"></div>
  </div>
</template>

<style lang="scss">
.pei-biao-global-class-name-loading {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 99999999999999;
  background: #fff;
  width: 100%;
  height: 100%;
  @keyframes donut-spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
  .loading-spin {
    box-sizing: border-box;
    border: 3px solid rgba(103, 82, 179, 0.3);
    border-left-color: #6752b3;
    border-radius: 50%;
    width: 32px;
    height: 32px;
    animation: donut-spin 1.2s linear infinite;

    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 1;
  }
}

.pei-biao-global-class-name-loading-cyktdx {
  background: #10122e;

  .loading-spin {
    border: 3px solid rgba(152, 147, 172, 0.3);
    border-left-color: #8e85af;
  }
}
</style>
