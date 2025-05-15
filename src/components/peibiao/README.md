各个项目具体用到的文件都放在extra文件夹

其他文件都是所有项目共用，包括profession_vue rainweb remote-teacher 等这些文件有改动需要同步到所有项目

注入文件和router.js的router配置是一一对应的，方便找到要修改的内容

因为项目的router组件都是异步组件，所以在router.afterEach方法中也不能立即获取vm实例，必须等懒加载的组件加载完成，才能获取vm实例，这个时间不一定，所以加了轮询，不过为了不等太久，轮询不会超过一秒

注入的css文件，css class 都写两种匹配规则，就算没有通过vm.$el加上唯一的class名，也是可以生效的，但是一样要把,逗号之前组件默认自带的class名带上，不要漏了

注入的css文件因为没有vue css scoped ，css都是全局生效的，尽量加上 > 选择器，降低对其他组件的影响

如果非要vm实例，其实在里面也是可以通过router相关数据再次轮询去获取，最终肯定是能拿到的，通用匹配那里，为了不等太久，轮询不会超过一秒，绝大多少情况都很快能拿到能拿到vm实例

之所以唯一cssname 加到vm.$el.parentElement 因为有些组件没有唯一的div根元素，而是用的ifelse切换根元素
