<template>
    <div></div>
</template>
<script>
    import Picker from './index.js'
    export default {
        props: {
            list: {
                type: Array,
                required: true
            },
            text: {
                type: Object,
                required: true
            },
            selectedindex: {
                type: Array,
                required: true
            }
        },
        data() {
            return {
                picker: null
            }
        },
        mounted() {
            this.$nextTick(()=>{
                this.pickerInit()
            })
        },
        methods: {
            goPicker() {
                this.picker && this.picker.show()
            },
            pickerInit() {
                var picker = this.picker = new Picker({
                    data: this.list,
                    selectedIndex: this.selectedindex,
                    title: this.text.title,
                    cancel: this.text.cancel,
                    confirm: this.text.confirm
                });

                picker.on('picker.select', (selectedVal, selectedIndex)=> {
                    this.$emit('close', {selectedVal, selectedIndex})
                });
                picker.on('picker.cancel', (selectedVal, selectedIndex)=> {
                    this.$emit('close', null)
                });
                picker.show()
            }
        }
    }
</script>
<style lang="scss" scoped>
    @function px2rem($px) {
        $rem: 75px;
        @return ($px/$rem) + rem;
    }
    .picker-wrapper{
        height: px2rem(675px);
        font-size: px2rem(16px);
        .input{
            width: px2rem(200px);
            height: px2rem(80px);
        }
    }
</style>


