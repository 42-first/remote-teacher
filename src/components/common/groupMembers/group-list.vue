<template>
    <div class="group-list-masking">
        <div class="group-list-wrapper">
            <div class="title-wrapper">
                <div class="icon-wrapper" @click="close">
                    <i class="iconfont icon-shiti_guanbitouping"></i>
                </div>
                <div class="ellipsis title"> {{ groupdata.team_name }} </div>
            </div>
            <div class="group-title">
                <div class="title">{{ groupdata.team_name }}</div>
                <div class="count">
                    共{{ groupdata.members.length }}人
                </div>
            </div>
            <div class="item-wrapper">
                <div class="group-item" v-for="(item, index) in groupdata.members" :key="index">
                    <img :src="item.avatar" />
                    <div class="ellipsis name-wrapper">{{item.name}}</div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    export default {
        name: 'group-list',
        props: [ 'groupdata' ],
        data() {
            return {
                list: []
            }
        },
        created() {
            this.init()
        },
        methods: {
            init() {
            },
            close() {
                this.$emit('close')
            }
        }
    }
</script>
<style lang="scss" scoped>
    @import "~@/style/common_rem";
    .group-list-masking{
        background-color: rgba(0,0,0,.75);
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        .ellipsis{
            text-overflow: ellipsis;
            overflow: hidden;
            white-space: nowrap;
        }
        .group-list-wrapper{
            background-color: #fff;
            height: 80%;
            width: 100%;
            position: absolute;
            bottom: 0;
            left: 0;
            display: flex;
            flex-direction: column;
            .title-wrapper{
                width: 100%;
                height: px2rem(100px);
                line-height: px2rem(100px);
                display: flex;
                border-bottom: px2rem(2px) solid #9b9b9b;
                padding: 0 px2rem(30px);
                .icon-wrapper{
                    .iconfont{
                        font-size: px2rem(64px);
                        display: block;
                    }
                }
                .title{
                    text-align: center;
                    flex: 1;
                    color: #9b9b9b;
                    font-size: px2rem(30px);
                }
            }
            .group-title{
                padding: px2rem(40px) px2rem(30px) px2rem(20px) px2rem(30px);
                line-height: px2rem(56px);
                font-size: px2rem(40px);
                font-weight: 500;
                display: flex;
                .count{
                    flex: 1;
                    color: #9b9b9b;
                    font-size: px2rem(28px);
                    text-align: right;
                    line-height: px2rem(40px);
                }
            }
            .item-wrapper{
                width: 100%;
                flex: 1;
                overflow: auto;
                -webkit-overflow-scrolling: touch;
                .group-item{
                    display: flex;
                    padding-left: px2rem(40px);
                    height: px2rem(110px);
                    line-height: px2rem(110px);
                    img{
                        width: px2rem(70px);
                        height: px2rem(70px);
                        border-radius: 50%;
                        vertical-align: middle;
                        margin-top: px2rem(15px);
                    }
                    .name-wrapper{
                        flex: 1;
                        padding-left: px2rem(20px);
                        color: #666;
                        font-size: px2rem(32px);
                        border-bottom: px2rem(2px) solid #d8d8d8;
                    }
                }
            }
        }
    }
</style>


