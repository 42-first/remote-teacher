// 把正则表达式两个 / 之间的代码作为字符串传给new RegExp函数，所有 \ 前都要再加一个 \ ，（因为在字符串中 \ 本身就是转义字符），用RegExp函数字符串参数可以使用变量。
export default {
  fullscreen: {
    name: 'fullscreen',
    regex: new RegExp(`/v3/\\d+/`),
    module: () => import('./module/fullscreen/v3/index'),
    css: () => import("./module/fullscreen/v3/index.scss"),
  },
};
