<template>
    <div :class="{'img-group-wrapper': !big, 'img-group-big-wrapper': big}" :style="{width: width}">
        <div class="img-wrapper">
            <img v-for="(item, index) in list" :src="item.avatar" :key="index" :class="{'img-right': index > 0}" />
        </div>
        <div class="group-name" :class="{
            'group-name-2': list.length === 2,
            'group-name-3': list.length === 3
        }">
            <div class="group-name-text">{{ name }}</div>
        </div>
    </div>
</template>
<script>
    export default {
        name: 'imgGroup',
        props: [ 'groupdata', 'big' ],
        data() {
            return {
                list: [],
                width: null
            }
        },
        created() {
            this.init()
        },
        methods: {
            init() {
                if( this.groupdata && this.groupdata.members ) {
                    const members = this.groupdata.members
                    this.list = members.slice(0, 3)
                }
            }
        },
        computed: {
            name() {
                const name = this.groupdata.team_name
                if(name) {
                    return name.slice(0)
                }
                return ""
            }
        }
    }
</script>
<style lang="scss" scoped>
    @import "~@/style/common_rem";
    .img-group-wrapper{
        margin-top: px2rem(28px);
        height: px2rem(32px);
        line-height: px2rem(32px);
        color: #639ef4;
        font-size: px2rem(28px);
        clear: both;
        cursor: pointer;
        .img-wrapper{
            float: left;
            img{
                height: px2rem(32px);
                width: px2rem(32px);
                border-radius: 50%;
            }
            .img-right{
                margin-left: px2rem(-10px);
            }
        }
        .group-name{
            padding-left: px2rem(46px);
            height: px2rem(32px);
            .group-name-text{
                width: 100%;
                height: 100%;
                overflow: hidden;
                text-overflow:ellipsis;
                white-space:nowrap;
            }
        }
        .group-name-2{
            padding-left: px2rem(68px);
        }
        .group-name-3{
            padding-left: px2rem(90px);
        }
    }
    .img-group-big-wrapper{
        height: px2rem(50px);
        line-height: px2rem(50px);
        color: #639ef4;
        font-size: px2rem(32px);
        clear: both;
        cursor: pointer;
        margin-bottom: px2rem(24px);
        .img-wrapper{
            float: left;
            img{
                height: px2rem(50px);
                width: px2rem(50px);
                border-radius: 50%;
            }
            .img-right{
                margin-left: px2rem(-16px);
            }
        }
        .group-name{
            padding-left: px2rem(62px);
            height: px2rem(50px);
            .group-name-text{
                width: 100%;
                height: 100%;
                overflow: hidden;
                text-overflow:ellipsis;
                white-space:nowrap;
            }
        }
        .group-name-2{
            padding-left: px2rem(102px);
        }
        .group-name-3{
            padding-left: px2rem(132px);
        }
    }
</style>


