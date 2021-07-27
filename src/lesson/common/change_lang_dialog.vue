<!-- 若未设置过雨课堂语言，且目前默认语言为英文时，展示设置语言的弹窗提示 20180412 by dangkexi-->
<template>
    <div class="change_lang f18" v-if="showChangeLang">
        <div class="mask_cover"></div>
        <div class="change_window">
            <div class="tit f15">
                Please click to choose<br>Rain Classroom language
            </div>
            <div class="tap-box">
                <div :class="['item', {'active': lang !== 'en'}]" style="border-bottom: 0.02666rem solid #EEEEEE;" @click="toggleLang('zh_CN')">
                    <div class="desc">中文（简体）</div>
                    <div class="circle">
                        <div class="core"></div>
                    </div>
                </div>
                <div :class="['item', {'active': lang === 'en'}]" @click="toggleLang('en')">
                    <div class="desc">English</div>
                    <div class="circle">
                        <div class="core"></div>
                    </div>
                </div>
            </div>
            <div class="close_window" @click="setLang">OK</div>
        </div>
    </div>
</template>
<style lang="scss" scoped>
    .mask_cover {
        position:fixed; 
        left: 0; 
        top:0; 
        width: 100%;
        height: 100%;
        background:#000;
        opacity: 0.5;
        z-index: 9999;
    }
    .change_window {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        box-sizing: border-box;
        padding: 0.533333rem 0.533333rem 0;
        width: 7.2rem;
        background: #fff;
        border-radius: 0.16rem;
        z-index: 9999;

        .tit {
            padding: 0 0.4rem;
            color: #666;
            line-height: 0.8rem;
            text-align: center;
            margin-bottom: 0.533333rem;
        }
        .tap-box {
            width: 5.133333rem;
            margin: 0 auto;

            .item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                height: 1.2rem;

                .circle {
                    width: 0.466667rem;
                    height: 0.466667rem;
                    border: 0.026667rem solid #CCCCCC;
                    border-radius: 50%;

                    .core {
                        margin: 0.073333rem auto;
                        width: 0.266667rem;
                        height: 0.266667rem;
                        border-radius: 50%;
                        background: #FFFFFF;
                    }
                }
            }
            .active .circle {
                border-color: #639EF4;

                .core {
                    background: #639EF4;
                }
            }
        }
        .close_window {
            //margin-top: 10px;
            height: 1.2rem;
            line-height: 1.2rem;
            text-align: center;
            color: #639EF4;
            border-top: 0.026667rem solid #eee;
        }
    }
</style>
<script>
    import request from '@/util/request'
    import API from '@/pages/teacher/config/api'

    export default {
        data() {
          return {
              showChangeLang: false,
              lang: 'en',
              radioOptions: [
                {
                    label: '中文（简体）',
                    value: 'zh_CN'
                },
                {
                    label: 'English',
                    value: 'en'
                }
              ]
 
          }
        },
        methods: {
            /*  点击选项切换语言 */
            toggleLang: function(str){
                this.lang = str
            },
            /*  点击OK设置语言 */
            setLang: function(){
				if(this.lang === 'zh_CN'){
					request.get(API.set_lang_zh_cn).then((res) => {
			            if(res.success) {
                            i18n.locale = 'zh_CN'
                            this.saveSuccess();
			            }
			        })
				}else if(this.lang === 'en'){
					request.get(API.set_lang_en).then((res) => {
			            if(res.success) {
                           i18n.locale = 'en'
                           this.saveSuccess();
			            }
			        })
				}
            },

            saveSuccess(){
                // T_PUBSUB.publish('ykt-msg-toast', 'success');
                this.showChangeLang = false;		
			}

        },
        mounted() {
            //是否展示弹窗
            let url = API.get_current_language;

            request.get(url).then((res) => {
                if(res.success) {
                    let data = res.data;
                    if(!data.is_self_set && data.language === 'en'){
                        this.showChangeLang = true;
                    }
                }
            })

        },
        created() {
        }
    }
</script>
