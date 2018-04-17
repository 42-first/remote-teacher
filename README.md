# remote-teacher

> 雨课堂遥控器接收器

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report

# run unit tests
npm run unit

# run e2e tests
npm run e2e

# run all tests
npm test
```

For detailed explanation on how things work, checkout the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).

## 遥控器开发流程

```
本地开发

npm run dev 启动本地服务

通过雷测试真实环境（h5或小程序）获取当前授课的 userinfo 信息及 lessonid
如小程序中是：Request URL:https://b.yuketang.cn/weapp/v/lesson/lesson_user_info?lesson_id=7873

获取真实信息后替换掉 /static/mock/userinfo_teacher.json 中的 data.user.user_auth 的值和 data.lesson.invite_code 的值。（因为要使用这个auth信息和node进行websocket通信，通信失败的话会跳转页面，所以使用真实的数据）

把 npm run dev 启动起来的浏览器中的 http://localhost:8088/#/ 替换为 http://192.168.106.87:8088/teacher.html#/7873
其中 192.168.106.87 为本机ip，每天都会变化；另外由于使用的vue测试环境开发，url使用的hash模式

将获取的真实课程数据 Request URL:https://b.yuketang.cn/weapp/v/lesson/fetch_presentation_data/10967/ 返回的值替换掉 /static/mock/fetch_presentation_data.json 中的数据。为了避免每次都需要进行替换，建议一直使用同一个ppt进行授课。这样进行翻页等操作时展示的数据就和ppt插件上的数据一样了。
也可以随时修改本地json中的数据，可以直接变化本地开发时浏览器中展示的内容。

现在由于ppt采用了指纹id，所以在本地点击翻页时，插件会翻页，但是回传回来的id和之前的老json的id不一样，本地不会翻页，只能替换 fetch_presentation_data.json 中的数据才能实现。
```
