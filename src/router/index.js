import Vue from 'vue'
import Router from 'vue-router'

import Home from '../components/common/Home.vue'

Vue.use(Router)

export default new Router({
    routes: [
        /*{
         path: '/',
         redirect: '/login'
         }, */{
            path: '/404', //404页
            component: resolve => require(['../components/page/404.vue'], resolve),
            name: '',
            hidden: true
        }, {
            path: '/login', //登录界面
            component: resolve => require(['../components/page/login.vue'], resolve),
            name: '',
            hidden: true
        }, {
            path: '/',
            component: Home,
            name: '内容管理',
            children: [
                {
                    path: '/movie',
                    component: resolve => require(['../components/page/content/movie.vue'], resolve),
                    name: '电影'
                }, {
                    path: '/play',
                    component: resolve => require(['../components/page/content/play.vue'], resolve),
                    name: '剧本'
                }, {
                    path: '/recPlay',
                    component: resolve => require(['../components/page/content/recPlay.vue'], resolve),
                    name: '推荐剧本'
                }, {
                    path: '/music',
                    component: resolve => require(['../components/page/content/music.vue'], resolve),
                    name: '音乐'
                }, {
                    path: '/recMusic',
                    component: resolve => require(['../components/page/content/recMusic.vue'], resolve),
                    name: '推荐音乐'
                }, {
                    path: '/material',
                    component: resolve => require(['../components/page/content/material.vue'], resolve),
                    name: '片段'
                }, {
                    path: '/choiceMaterial',
                    component: resolve => require(['../components/page/content/choiceMaterial.vue'], resolve),
                    name: '精选片段'
                }, {
                    path: '/preMaterial',
                    component: resolve => require(['../components/page/content/preMaterial.vue'], resolve),
                    name: '前置片段'
                }, {
                    path: '/feedbackMaterial',
                    component: resolve => require(['../components/page/content/feedbackMaterial.vue'], resolve),
                    name: '片段反馈'
                }, {
                    path: '/resource',
                    component: resolve => require(['../components/page/content/resource.vue'], resolve),
                    name: '资源库'
                }, {
                    path: '/resourceImg',
                    component: resolve => require(['../components/page/content/resourceImg.vue'], resolve),
                    name: '图片库'
                }, {
                    path: '/category',
                    component: resolve => require(['../components/page/content/category.vue'], resolve),
                    name: '分类'
                }, {
                    path: '/attribute',
                    component: resolve => require(['../components/page/content/attribute.vue'], resolve),
                    name: '属性'
                }, {
                    path: '/tag',
                    component: resolve => require(['../components/page/content/tag.vue'], resolve),
                    name: '标签'
                }
            ]
        }, {
            path: '/',
            component: Home,
            name: '用户管理',
            children: [
                {
                    path: '/user',
                    component: resolve => require(['../components/page/user/userList.vue'], resolve),
                    name: '用户列表'
                }, {
                    path: '/userCategory',
                    component: resolve => require(['../components/page/user/category.vue'], resolve),
                    name: '用户分类'
                }, {
                    path: '/robot',
                    component: resolve => require(['../components/page/user/robotList.vue'], resolve),
                    name: '马甲号列表'
                }, {
                    path: '/care',
                    component: resolve => require(['../components/page/user/userCareList.vue'], resolve),
                    name: '运营关注用户'
                }, {
                    path: '/master',
                    component: resolve => require(['../components/page/user/masterList.vue'], resolve),
                    name: '小号权限管理'
                }
            ]
        }, {
            path: '/',
            component: Home,
            name: '帖子管理',
            children: [
                {
                    path: '/posts',
                    component: resolve => require(['../components/page/posts/postsList.vue'], resolve),
                    name: '帖子列表'
                }, {
                    path: '/topic',
                    component: resolve => require(['../components/page/posts/topicList.vue'], resolve),
                    name: '话题列表'
                }, {
                    path: '/illegal',
                    component: resolve => require(['../components/page/posts/illegalList.vue'], resolve),
                    name: '举报贴'
                }, {
                    path: '/comment',
                    component: resolve => require(['../components/page/posts/commentList.vue'], resolve),
                    name: '评论库'
                }, {
                    path: '/commentAttr',
                    component: resolve => require(['../components/page/posts/commentAttr.vue'], resolve),
                    name: '评论库分类'
                }, {
                    path: '/commentRobot',
                    component: resolve => require(['../components/page/posts/commentRobotList.vue'], resolve),
                    name: '机器人评论'
                }/*, {
                    path: '/barrage',
                    component: resolve => require(['../components/page/posts/barrageList.vue'], resolve),
                    name: '弹幕列表'
                }*/, {
                    path: '/postsCheck',
                    component: resolve => require(['../components/page/posts/postsCheck.vue'], resolve),
                    name: '鉴黄列表'
                }
            ]
        }, {
            path: '/',
            component: Home,
            name: '营销管理',
            children: [
                {
                    path: '/banner',
                    component: resolve => require(['../components/page/marketing/bannerList.vue'], resolve),
                    name: 'banner设置'
                },{
                    path: '/link',
                    component: resolve => require(['../components/page/marketing/linkList.vue'], resolve),
                    name: '推广链接'
                },{
                    path: '/notice',
                    component: resolve => require(['../components/page/marketing/noticeSend.vue'], resolve),
                    name: '站内消息'
                }, {
                    path: '/award',
                    component: resolve => require(['../components/page/marketing/awardList.vue'], resolve),
                    name: '发奖管理'
                }, {
                    path: '/advertisement',
                    component: resolve => require(['../components/page/marketing/adList.vue'], resolve),
                    name: '广告位管理'
                }
            ]
        }, {
            path: '/',
            component: Home,
            name: '',
            leaf: true,//只有一个节点
            children: [
                {
                    path: '/android',
                    component: resolve => require(['../components/page/androidPackage.vue'], resolve),
                    name: '安卓包管理'
                }
            ]
        }, {
            path: '*',
            hidden: true,
            redirect: {path: '/404'}
        }
    ]
})
