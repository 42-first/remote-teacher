<template>
    <div>
        <div class="masking" v-show="showMasking">
            <div class="mask-wrapper">
                <div class="back-header"></div>
                <div class="tips-wrapper back-f">
                    <div class="title font17 color3 text-center">旁听提示</div>
                    <div class="color-9b font15 gray">
                        未在教务系统选课，通过其他途径进入课程的学生为旁听生。
                    </div>
                    <div class="black font15 color3">
                        旁听生可以参与班级教学活动，但其教学行为数据不计入各类统计，授课教师感知不到旁听生的存在。
                    </div>
                    <div class="black font15 color3">
                        旁听产生的学习数据都会被记录，若作为正式学生加入该课程，之前的旁听数据都会恢复。
                    </div>
                    <div class="gray font15 color-9b">
                        如有需要，请联系学校教务老师调整选课数据。
                    </div>
                    <div class="button-confirm text-center" @click="showMasking = false">以旁听身份进入</div>
                </div>
            </div>
        </div>
    </div>
</template>
<style lang="scss" scoped>
    @import "~@/style/common";
    .masking{
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 100000;
        background-color: rgba(0,0,0,.7);
        .mask-wrapper{
            width: px2rem(640px);
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            .back-header{
                width: 100%;
                height: px2rem(268px);
                background-image: url(~images/student/binding.min.png);
                background-size: 100%;
                background-position: center center;
            }
            .tips-wrapper{
                padding: px2rem(60px);
                box-sizing: border-box;
                .title{
                    line-height: px2rem(48px);
                    margin-bottom: px2rem(40px);
                }
                .gray{
                    margin-bottom: px2rem(30px);
                    line-height: px2rem(42px);
                }
                .black{
                    margin-bottom: px2rem(30px);
                    line-height: px2rem(42px);
                }
                .button-confirm{
                    background-color: #639ef4;
                    color: #fff;
                    width: 100%;
                    height: px2rem(88px);
                    line-height: px2rem(88px);
                    border-radius: px2rem(8px);
                    margin: px2rem(10px) auto;
                }
            }
        }
    }
</style>
<script>
    export default {
        name: "auditorTips",
        data(){
            return {
                showMasking: true,
                miniprogram: false
            }
        },
        created(){
            // 检测是否在小程序中
            typeof wx !== 'undefined' && wx.miniProgram.getEnv((res)=>{
                this.miniprogram = res.miniprogram
            })
            this.init()
        },
        methods: {
            init() {
                let today = this.todayTime()
                if (localStorage) {
                    // 缓存 auditToday ，如果auditToday 和今天的getTime() 相等则认为已经展示过 旁听生提示
                    let auditToday = localStorage.getItem('auditToday')
                    this.showMasking = auditToday !== today
                    localStorage.setItem('auditToday', today)
                }
            },
            todayTime(){
                let date = new Date()
                return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() + ''
            }
        }
    }
</script>
