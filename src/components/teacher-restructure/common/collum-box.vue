<!--单选多选柱状图组件 -->
<template>
  <section class="histogram-with-mahint">
    <section class="mahint" v-if="problemType === 'MultipleChoiceMA'">
      <div class="mahint-item f12">
        <i style="background: #F5A623;"></i>
        {{ $t('standardans') }}
      </div>

      <div class="mahint-item f12">
        <i style="background: #639EF4;"></i>
        {{ $t('correctopt') }}
      </div>

      <div class="mahint-item f12">
        <i style="background: #C8C8C8;"></i>
        {{ $t('wrongopt') }}
      </div>
    </section>

    <section class="histogram-box">
      <div class="histogram-item" v-if="problemType === 'MultipleChoiceMA'">
        <div class="bar maright" :style="{height: ma_right_count.value/total*100+'%'}">
          <span class="value f18">{{ma_right_count.value}}</span>
          <span class="label f18">{{ma_right_count.label}}</span>
        </div>
      </div>
      <div class="histogram-item" v-for="(item, index) in graph" :key="index">
        <div :class="['bar', {'right': item.isRight}]" :style="{height: item.value === 0 ? 0 : item.value/total*100+'%'}">
          <span class="value f18">{{item.value}}</span>
          <span class="label f18">{{item.label}}</span>
        </div>
      </div>
    </section>
  </section>
</template>

<script>
	export default {
	  name: 'CollumBox',
	  props: ['problemType', 'graph', 'total', 'ma_right_count'],
	  data () {
	    return {
	    }
	  },
	  created(){
	  },
	  methods: {
	  	
	  }
	}
</script>

<style lang="scss" scoped>
	@import "~@/style/_variables";
  /* 中间柱状图 */
	  .histogram-with-mahint {
	  	margin: 1.0rem auto;
	  	width: 8.8rem;
	  	height: 5.0rem;
	  	border-top: 1px solid #cccccc;
	  }
	  .mahint {
	  	display: flex;
	  	align-items: center;
	  	padding-left: 0.266667rem;
	  	height: 0.693333rem;
	  	background: linear-gradient(rgba(255,255,255,0.12) 10%, rgba(255,255,255,0.03));

	  	.mahint-item {
	  		margin-right: 0.666667rem;

	  		i {
	  			display: inline-block;
	  			width: 0.266667rem;
	  			height: 0.266667rem;
	  		}
	  	}
	  }
	  .histogram-box {
	  	margin: 0 auto;
	  	padding-top: 1rem;
	  	width: 8.8rem;
	  	height: 100%;
		  display: flex;
		  justify-content: space-between;
		  align-items: bottom;

		  .histogram-item {
			  flex: 1;
			  position: relative;
			  border-bottom: 1px solid $white;

			  .bar {
				  position: absolute;
				  left: 50%;
				  bottom: 0.173333rem;
				  transform: translateX(-50%);
				  width: 0.8rem;
				  background-color: #C8C8C8;

					span {
					  position: absolute;
					  width: 100%;
					  left: 0;
					  text-align: center;
					  color: #fff;
					}
					.value {
					  top: -0.746667rem;
					}
					.label {
					  bottom: -1.0rem;
					}
				}
				.right {
				  background-color: $blue;
				}
				.maright {
				  background-color: #F5A623;
				  span {
				  	color: #F5A623;
				  }
				}
			}
		}

</style>
