import axios from 'axios';
import qs from 'qs';
import {Message} from 'element-ui';
import {Notification} from 'element-ui'

let base = '';
let header = {
    'content-type': 'application/json'
};

// axios请求基础配置
axios.defaults.headers.get['Content-Type'] = 'application/json';
// axios.defaults.timeout = 60000;
axios.defaults.baseURL = '';
axios.interceptors.request.use(config => { // 请求拦截器
    return config
}, error => {
    return Promise.reject(error)
})

axios.interceptors.response.use(response => { // 响应拦截器
    return response
}, error => {
    // 返回接口返回的错误信息
    return Promise.resolve(error.response)
})

let api = { //接口地址
    login: '/login/ajax', // 登录
    logout: '/logout/ajax', // 登出
    logCode: '/sys/send_email', // 验证码获取
    changePwd: '/account/password/update', // 修改密码

    contentSourceList: '/content/video_resource/list', //内容资源列表
    contentSourceDel: '/content/video_resource/delete', //内容资源列表删除
    contentSourceEdit: '/ks3/video_upload_edit', //内容资源编辑

    contentImgSourceList: '/content/image/list', // 图片库列表
    contentImgSourceAdd: '/content/image/add', // 图片库新增

    contentPlayList: '/content/play/list', //内容剧本列表
    contentPlayDel: '/content/play/delete',
    contentPlayEdit: '/content/play/edit',
    contentPlayDetail: '/content/play/detail',
    contentPlayStatus: '/content/play/online_off', //剧本上下线

    contentPlayScriptDetail: '/content/play/script_detail', //剧本素材详情
    contentPlayScriptEdit: '/content/play/script_edit', //剧本素材编辑
    contentPlayScriptDel: '/content/play/script_delete', //剧本素材删除

    contentTopPlay: 'content/play/stick', //置顶剧本
    contentCancelTopPlay: 'content/play/cancelStick', //取消置顶剧本
    contentRecPlay: '/content/play/recommendOperation', //推荐剧本
    contentRecPlayList: '/content/recommendPlay/list', //推荐剧本列表


    contentTagList: '/content/tag/list', //内容标签列表
    contentTagDel: '/content/tag/delete',
    contentTagEdit: '/content/tag/edit',

    contentCatList: '/content/category/list', //内容分类列表
    contentCatDel: '/content/category/delete',
    contentCatEdit: '/content/category/edit',

    contentAttrList: '/content/attribute/list', //内容属性
    contentAttrDel: '/content/attribute/delete',
    contentAttrEdit: '/content/attribute/edit',
    contentAttrStatus: '/content/attribute/online_off', //属性上下线
    contentAttrShift: '/content/attribute/up_down_top', //属性上移、下移、置顶

    contentMovieList: '/content/movie/list', //内容电影列表
    contentMovieDel: '/content/movie/delete',
    contentMovieEdit: '/content/movie/edit',

    contentMusicList: '/content/music/list', //内容音乐列表
    contentMusicDel: '/content/music/delete',
    contentMusicEdit: '/content/music/edit',
    contentMusicDetail: '/content/music/detail',

    contentMaterialList: '/content/material/list', //内容素材列表
    contentMaterialDel: '/content/material/delete',
    contentMaterialEdit: '/content/material/edit',
    contentMaterialDetail: '/content/material/detail',
    contentChoiceMaterialList: '/content/choiceMaterial/list', //精选片段列表
    contentChoiceMaterial: '/content/material/choiceOperation',
    contentTopMaterial: '/content/material/stick', // 片段置顶
    contentCancelTopMaterial: '/content/material/cancelStick', // 取消片段置顶
    contentMaterialFeedbackList: '/content/material/feedback/list', // 片段反馈
    contentFeedbackReply: '/content/material/feedback/reply', // 回复片段反馈


    userList: '/user/list', //用户列表
    userDetail: '/user/detail', //用户详情
    userEdit: '/user/edit', //用户编辑
    userStatus: '/user/status/update', //用户删除
    userCare: '/user/user_care_edit', //运营关注用户
    userUnbind: '/user/bind/delete', //用户解绑第三方
    userPhoneUpdate: '/user/mobile/update', //用户更换手机号
    userFansList: '/user/fans/list', //用户粉丝列表
    userFanDel: '/user/fans/delete', //用户粉丝移除
    userFollowList: '/user/cares/list', //用户关注
    userFollowDel: '/user/cares/delete', //用户关注移除
    userVideoList: '/user/video_post/list', //用户发帖列表
    userLikeList: '/user/video_post/like_list', //用户喜欢列表
    userCareOperate: '/user/user_care_list', //运营关注用户
    userMasterList: '/user/master/list', //主账号列表
    userMasterAdd: '/user/master/add', //设置主账号权限
    userMasterVideo: '/user/master/video/list', //主账号下小号视频列表
    userMasterBarrage: '/user/master/video/barrage/list', //主账号下小号发送弹幕列表
    userMasterLike: '/user/master/video/like/list', //主账号下小号点赞列表
    userFansAdd: '/robot/user/followBatch', // 为用户增加粉丝

    regionList: '/user/region_list', //地区列表
    cityList: '/user/city_list', //城市列表

    robotList: '/user/robot_list', //机器人列表
    robotDel: '/user/robot_delete', //删除机器人
    robotEdit: '/user/robot_edit', //编辑机器人

    postsList: '/video/video_post/list', //全部帖子列表
    postsDetail: '/video/video_post/detail', //帖子详情
    postsEdit: '/video/video_post/edit', //帖子编辑
    postsLike: '/video/video_post/add_like', //帖子点赞
    postsBarrageAdd: '/video/video_post/add_barrage', //帖子增加弹幕
    postsEssence: '/video/update_essence', //帖子加精
    postsStatus: '/video/update_status', //帖子隐藏、恢复
    postsBarrageList: '/video/video_post/barrage_list', //帖子的弹幕列表
    postsCheckList: '/video/check_result_list', // 鉴黄列表
    postsBlocked: '/video/vpid_blocked', // 封禁视频
    postsUnblock: '/video/vpid_relieve', // 解封视频

    topicList: '/topic/list', //话题列表
    topicDel: '/topic/update_status', //删除话题
    topicEdit: '/topic/edit', //编辑话题
    topicVideoList: '/topic/video_post/list', //话题视频列表
    topicTop: '/topic/top_status', //话题置顶、取消置顶
    topConfigDetail: '/topic/top_all', //话题置顶配置详细
    topConfigHandel: '/topic/top_config', //话题置顶配置更改
    topicPosts: '/video/video_post/for_topic_list', //话题详情中查询帖子

    illegalList: '/video/illegal_report_list', //举报帖子
    illegalStatus: '/video/update_illegal_report_status', //隐藏举报帖子

    barrageList: '/video/video_robot_barrage_list', //弹幕库
    barrageEdit: '/video/video_robot_barrage/edit', //弹幕修改
    barrageTag: '/video/video_robot_barrage/tag_list', //弹幕标签

    androidApkList: '/sys/version/apk_list', //安卓包列表
    apkStatus: '/sys/version/apk_update_status', //安卓包状态控制
    apkAdd: '/sys/version/apk_add', //安卓包上传

    launchBannerList: '/ad/launch/list', // 开机页list
    launchBannerAdd: '/ad/launch/add', // 新增开机页banner
    launchBannerUpdate: '/ad/launch/update', // 新增开机页banner
    launchBannerDel: '/ad/launch/delete', // 删除开机页banner
    topicBannerList: '/ad/banner/list', // 话题页list
    topicBannerAdd: '/ad/banner/add', // 新增话题页banner
    topicBannerUpdate: '/ad/banner/update', // 新增话题页banner
    topicBannerDel: '/ad/banner/delete', // 删除话题页banner
    squareBannerList: '/ad/square/list', // 广场页list
    squareBannerAdd: '/ad/square/add', // 新增广场页banner
    squareBannerUpdate: '/ad/square/update', // 新增广场页banner
    squareBannerDel: '/ad/square/delete', // 删除广场页banner

    avatarUpload: '/ks3/user_image_upload', //头像文件上传
    imgUpload: '/ks3/video_image_upload', //图片文件上传
    musicSign: '/ks3/signature/music', //音乐文件获取签名
    videoSign: '/ks3/signature/video', //视频文件获取签名
    videoUpload: 'ks3/video_upload', //视频文件上传
    musicUpload: 'ks3/music_upload', //音乐文件上传


};

function specialCodeHandle(vm, res, callback) { // 服务器端特殊的返回code统一处理
    if (res.data.status == 403) { //403表示登录过期，需要重新登录
        console.log('session过期，跳转到登录页');
        sessionStorage.removeItem('user');
        vm.$router.push('/login');
        return false;
    }
    if (callback) {
        callback(res);
        return;
    }
    if (vm.logining) {
        vm.logining = false
    }
    if (vm.tableLoading) {
        vm.tableLoading = false
    }
    if (vm.formLoading) {
        vm.formLoading = false
    }
    if (vm.showLoading) {
        vm.showLoading = false
    }
    if (res.data.error.length > 20) {
        Notification.error({
            title: '错误',
            message: res.data.error,
            duration: 0,
            offset: 150
        });
    } else {
        vm.$message.error(res.data.error); //不是特殊的code，显示返回的错误信息
    }
}

function httpErrorHandle(vm, res) { // 处理http的错误状态
    if (vm.logining) {
        vm.logining = false
    }
    if (vm.tableLoading) {
        vm.tableLoading = false
    }
    if (vm.formLoading) {
        vm.formLoading = false
    }
    if (vm.showLoading) {
        vm.showLoading = false
    }
    Notification.error({
        title: 'HTTP请求错误',
        message: res.data,
        duration: 0,
        offset: 150
    });
}

/*
* type：根据type获取接口地址
* params：请求时的参数
* vm： vue实例
* callback：请求成功回调
* errorBack：请求失败时回调，如果没有定义，则进行默认操作
*
* */


export const httpGet = (type, params, vm, callback, errorBack) => { //封装的axios的get方法
    return axios({
        method: 'get',
        url: api[type],
        params: params, // get 请求时带的参数
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    }).then(
        (res) => {
            if (!res) { // 一直未返回res，进行提示
                Notification.error({
                    title: '错误',
                    message: '已经超过一分钟服务端没有任何返回',
                    duration: 0,
                    offset: 150
                });
                console.error(res)
                return false
            }
            if (res.status >= 200 && res.status < 300) { // http状态码在200到300间正常调用callback
                let resCode = res.data.status // 检测code码，对特殊定义的code进行处理
                if (resCode == 0) { //code值为0，操作成功
                    callback(res.data)
                } else {
                    specialCodeHandle(vm, res, errorBack) //处理特殊含义code值
                }
            } else {
                httpErrorHandle(vm, res) //处理http错误
            }
        }
    )
};

export const httpPost = (type, params, vm, callback, errorBack) => { //封装的axios的POST方法
    return axios({
        method: 'post',
        url: api[type],
        data: params, // post 请求时带的参数
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    }).then(
        (res) => {
            if (!res) { // 一直未返回res，进行提示
                Notification.error({
                    title: '错误',
                    message: '已经超过一分钟服务端没有任何返回',
                    duration: 0,
                    offset: 150
                });
                console.error(res)
                return false
            }
            if (res.status >= 200 && res.status < 300) { // http状态码在200到300间正常调用callback
                let resCode = res.data.status; // 检测code码，对特殊定义的code进行处理
                if (resCode == 0) { //code值为0，操作成功
                    callback(res.data)
                } else {
                    specialCodeHandle(vm, res, errorBack);
                }
            } else {
                httpErrorHandle(vm, res) //处理http错误
            }
        }
    )
};

export const httpDel = (type, params, vm, callback, errorBack) => { //封装的axios的get方法
    return axios({
        method: 'delete',
        url: api[type],
        params: params, // get 请求时带的参数
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    }).then(
        (res) => {
            if (!res) { // 一直未返回res，进行提示
                Notification.error({
                    title: '错误',
                    message: '已经超过一分钟服务端没有任何返回',
                    duration: 0,
                    offset: 150
                });
                console.error(res)
                return false
            }
            if (res.status >= 200 && res.status < 300) { // http状态码在200到300间正常调用callback
                let resCode = res.data.status // 检测code码，对特殊定义的code进行处理
                if (resCode == 0) { //code值为0，操作成功
                    callback(res.data)
                } else {
                    specialCodeHandle(vm, res, errorBack);
                }
            } else {
                httpErrorHandle(vm, res) //处理http错误
            }
        }
    )
};

