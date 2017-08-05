// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue' //vue组件
import ElementUI from 'element-ui'; //基于vue的ui组件库
import 'element-ui/lib/theme-default/index.css';    // 默认主题
//import 'element-ui/lib/theme-default/index.css'
import moment from 'moment'; //处理时间库

import App from './App'
import router from './router' //vue路由器
import Mock from './mock' //模拟数据生成器
//Mock.dataModel(); //开启本地数据模拟

Vue.use(ElementUI);

router.beforeEach((to, from, next) => { //拦截导航完成跳转或取消，to：即将进入的路由对象，form：离开的路由，next：function
    if (to.path == '/login') { //如果即将进入login页，移除session
        sessionStorage.removeItem('user');
    }
    let user = JSON.parse(sessionStorage.getItem('user')); //获取session
    if (!user && to.path != '/login') { //session为空，且跳转的路由不是登录页，则跳转到login
        next({
            path: '/login'
        })
    } else { //正常跳转到路由
        next()
    }
});

new Vue({
    router,
    render: h => h(App)
}).$mount('#app');
