<template>
    <div>
        <div class="img-group-wrapper">
            <div class="img-wrapper">
                <img v-for="(item, index) in list" :src="item.avatar" :key="index" :class="{'img-right': index > 0}" />
            </div>
            <div class="group-name">
                {{ groupdata.team_name }}
            </div>
        </div>
    </div>
</template>
<script>
    export default {
        name: 'imgGroup',
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
                if( this.groupdata && this.groupdata.members ) {
                    this.list = this.groupdata.members.slice(0, 3)
                }
            }
        }
    }
</script>
<style lang="scss" scoped>
    @import "~@/style/common_rem";
    .img-group-wrapper{
        height: px2rem(32px);
        line-height: px2rem(32px);
        color: #639ef4;
        font-size: px2rem(28px);
        display: flex;
        cursor: pointer;
        .img-wrapper{
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
            padding-left: px2rem(14px);
        }
    }
</style>


