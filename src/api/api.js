import axios from 'axios';

let base = '';
let header = {
    'content-type': 'application/json'
};


axios.defaults.headers.get['Content-Type'] = 'application/json';

let api = { //接口地址
    userList: '/user/list', //用户列表
    userDetail: '/user/detail', //用户详情
    userEdit: '/user/edit', //用户编辑
    userStatus: '/user/status/update', //用户删除
    userUnbind: '/user/bind/delete', //用户解绑第三方
    userPhoneUpdate: '/user/mobile/update', //用户更换手机号
    userFansList: '/user/fans/list', //用户粉丝列表
    userFanDel: '/user/fans/delete', //用户粉丝移除
    userFollowList: '/user/cares/list', //用户关注
    userFollowDel: '/user/cares/delete', //用户关注移除
    userVideoList: '/user/video_post/list', //用户发帖列表
    userLikeList: '/user/video_post/like_list', //用户喜欢列表

    robotList: '/user/robot_list', //机器人列表
    robotDel: '/user/robot_delete', //删除机器人
    robotEdit: '/user/robot_edit', //编辑机器人

    videoList: '/video/video_post/list', //全部帖子列表
    videoDetail: '/video/video_post/detail', //帖子详情
    videoEdit: '/video/video_post/edit', //帖子编辑

    topicList: '/topic/list', //话题列表
    topicDel: '/topic/update_status', //删除话题
    topicEdit: '/topic/edit', //编辑话题
    topicVideoList: '/topic/video_post/list', //话题视频列表
    topicTop: '/topic/top_status', //话题置顶、取消置顶
    topConfigDetail: '/topic/top_all', //话题置顶配置详细
    topConfigHandel: '/topic/top_config', //话题置顶配置更改

    illegalList: '/video/illegal_report_list', //举报帖子

    barrageList: '/video/video_robot_barrage_list', //弹幕库



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


/*
 * 获取工具内容模块数据接口
 * type:接口类型 params:请求参数
 * */

export const tableListApi = (type, params) => {
    return axios.get(`${base}/content/` + type + `/list`, {params: params}).then(res => res.data);
};


/*
 * 删除工具内容模块数据接口
 * */

export const tableDelApi = (type, params) => {
    return axios.delete(`${base}/content/` + type + `/delete`, {params: params}).then(res => res.data);
};

/*
 * 编辑工具内容模块数据接口
 * */

export const tableEditApi = (type, params) => {
    return axios.post(`${base}/content/` + type + `/edit`, params, header).then(res => res.data);
};


/*
 * 获取工具内容模块详情接口
 * */

export const tableDetailApi = (type, params) => {
    return axios.get(`${base}/content/` + type + `/detail`, {params: params}).then(res => res.data);
};

/*
 * 剧本素材删除接口
 * */

export const scriptDelApi = (params) => {
    return axios.delete(`${base}/content/play/script_delete`, {params: params}).then(res => res.data);
};

/*
 * 剧本素材详情接口
 * */

export const scriptDetailApi = (params) => {
    return axios.get(`${base}/content/play/script_detail`, {params: params}).then(res => res.data);
};

/*
 * 剧本素材编辑接口
 * */

export const scriptEditApi = (params) => {
    return axios.post(`${base}/content/play/script_edit`, params, header).then(res => res.data);
};


/*
 * 更改工具内容模块上下线状态接口
 * */

export const tableStatusApi = (type, params) => {
    return axios.post(`${base}/content/` + type + `/online_off`, params, header).then(res => res.data);
};

/*
 * 上传视频图片至服务器 params：imageFile
 * */

export const imgUploadApi = (params) => {
    return axios.post(`${base}/ks3/video_image_upload`, params, header).then(res => res.data);
};

/*
 * 获取金山签名  type：video/music params：fileName
 * */

export const signatureApi = (type, params) => {
    return axios.get(`${base}/ks3/signature/` + type, {params: params}).then(res => res.data);
};

/*
 * 上传金山成功后回调 type：video/music params：视频（name, objectKey）  音乐（objectKey）
 * */

export const uploadCallbackApi = (type, params) => {
    return axios.post(`${base}/ks3/` + type + `_upload`, params, header).then(res => res.data);
};

/*
 * 上传用户头像至服务器 params：imageFile
 * */

export const avatarUploadApi = (params) => {
    return axios.post(`${base}/ks3/user_image_upload`, params, header).then(res => res.data);
};
