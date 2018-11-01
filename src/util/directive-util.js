/*
 * 白板绘制指令
 * @author: chenzhou
 * @update: 2018.11.1
 * @desc 白板绘制功能汇总
 *
 */

import Vue from 'vue'
import boardmixin from '@/components/common/board-mixin'


let methods = boardmixin.methods;

console.info('boardmixin methods', methods);

Vue.directive('canvas', {
  bind: function(el, binding) {
    var boardInfo = binding.value;
    var ctx = el.getContext('2d');

    methods.restore(boardInfo, ctx);
  }
})
