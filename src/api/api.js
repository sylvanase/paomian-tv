import axios from 'axios';

let base = '';
let header = {
    'content-type': 'application/json'
};


axios.defaults.headers.get['Content-Type'] = 'application/json';

let api = { //接口地址
    contentSourceList: '/content/video_resource/list', //内容资源列表
    contentSourceDel: '/content/video_resource/delete', //内容资源列表删除
    contentSourceEdit: '/ks3/video_upload_edit', //内容资源编辑

    contentPlayList: '/content/play/list', //内容剧本列表
    contentPlayDel: '/content/play/delete',
    contentPlayEdit: '/content/play/edit',
    contentPlayDetail: '/content/play/detail',
    contentPlayStatus: '/content/play/online_off', //剧本上下线

    contentPlayScriptDetail: '/content/play/script_detail', //剧本素材详情
    contentPlayScriptEdit: '/content/play/script_edit', //剧本素材编辑
    contentPlayScriptDel: '/content/play/script_delete', //剧本素材删除


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


    avatarUpload: '/ks3/user_image_upload', //头像文件上传
    imgUpload: '/ks3/video_image_upload', //图片文件上传
    musicSign: '/ks3/signature/music', //音乐文件获取签名
    videoSign: '/ks3/signature/video', //视频文件获取签名
    videoUpload: 'ks3/video_upload', //视频文件上传
    musicUpload: 'ks3/music_upload', //音乐文件上传



};

export const axiosGet = (type, params) => { //get请求
    return axios.get(`${base}` + api[type], {params: params}).then(res => res.data);
};

export const axiosPost = (type, params) => { //post请求
    return axios.post(`${base}` + api[type], params, header).then(res => res.data);
};

export const axiosDel = (type, params) => { //del请求
    return axios.delete(`${base}` + api[type], {params: params}).then(res => res.data);
};

/*
 * 登录、登出
 * */
export const requestLogin = params => {
    return axios.post(`${base}/login/ajax`, params, header).then(res => res.data);
};

export const loginOut = (type, params) => {
    return axios.get(`${base}/logout/ajax`).then(res => res.data);
};

