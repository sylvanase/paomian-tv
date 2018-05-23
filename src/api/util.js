import moment from 'moment';
import {
    Notification
} from 'element-ui'
import {
    Message
} from 'element-ui';

var filterDate = [ //滤镜数据
    {
        id: 0,
        name: '无滤镜-原味'
    }, {
        id: 1,
        name: '笋干味'
    }, {
        id: 2,
        name: '火辣味'
    }, {
        id: 3,
        name: '香菇味'
    }, {
        id: 4,
        name: '黑椒味'
    }, {
        id: 5,
        name: '墨鱼味'
    }, {
        id: 6,
        name: '鲜虾味'
    }, {
        id: 7,
        name: '酸菜味'
    }, {
        id: 8,
        name: '豚骨味'
    }, {
        id: 9,
        name: '番茄味'
    }, {
        id: 10,
        name: '鸡肉味'
    }, {
        id: 11,
        name: '麻辣味'
    }, {
        id: 13,
        name: '红烧味'
    }, {
        id: 14,
        name: '香葱味'
    }, {
        id: 15,
        name: '雪菜味'
    }, {
        id: 18,
        name: '酸辣味'
    }, {
        id: 19,
        name: '海鲜味'
    }, {
        id: 20,
        name: '老鸭味'
    }, {
        id: 21,
        name: '蟹黄味'
    }, {
        id: 24,
        name: '胡椒味'
    }, {
        id: 26,
        name: '蒜香味'
    }, {
        id: 27,
        name: '火鸡味'
    }, {
        id: 28,
        name: '芦笋味'
    }, {
        id: 29,
        name: '卤香味'
    }, {
        id: 30,
        name: '田园味'
    }
];

var illegalDate = [ // 举报类型定义
    {
        id: 0,
        name: '低俗内容'
    }, {
        id: 1,
        name: '违法行为'
    }, {
        id: 2,
        name: '垃圾广告'
    }
];

var postsLevel = [ // 鉴黄级别信息
    {
        id: 0,
        name: '正常'
    }, {
        id: 1,
        name: '不确定'
    }, {
        id: 2,
        name: '确定'
    }
];

var postsStatus = [ // 鉴黄视频处理状态码
    {
        id: 0,
        name: '检测成功'
    }, {
        id: 110,
        name: '请求重复'
    }, {
        id: 120,
        name: '参数错误'
    }, {
        id: 130,
        name: '解析错误'
    }, {
        id: 140,
        name: '数据类型错误'
    }
];

export default {
    getQueryStringByName: function(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        var r = window.location.search.substr(1).match(reg);
        var context = "";
        if (r != null)
            context = r[2];
        reg = null;
        r = null;
        return context == null || context == "" || context == "undefined" ? "" : context;
    },
    timestampFormat: function(date, pattern) { //使用moment进行时间戳解析，默认格式YYYY-MM-DD HH:mm:ss
        var timeString = '';
        var DEFAULT_PATTERN = 'YYYY-MM-DD HH:mm:ss'; //时间戳默认解析格式
        pattern = pattern || DEFAULT_PATTERN;
        timeString = moment(parseInt(date)).format(pattern);
        return timeString;
    },
    filterDate, //素材的滤镜数据
    fileSizeFormat: function(item) { // 文件大小格式化
        var size = item / 1024; //计算kb
        if (size >= 1024) {
            size = size / 1024; //计算M
            size = size.toFixed(2) + " M";
        } else {
            size = size.toFixed(2) + ' kb';
        }
        return size;
    },
    fileDuration: function(item) { // 文件时长
        var html, //计算时长
            s = (item % 60).toFixed(1),
            min = parseInt(item / 60),
            h;
        if (0 < min < 60) {
            html = min + ' 分 ' + s + ' 秒 ';
        } else if (min >= 60) {
            h = parseInt(min / 60);
            min = min % 60;
            html = h + ' 小时 ' + min + ' 分 ' + s + ' 秒 ';
        }
        return html;
    },
    jsErrNotify: function(error) { //js处理发生错误统一报错
        let errTxt = '错误：' + error.message;
        Notification.error({
            title: 'js错误',
            message: errTxt,
            duration: 0,
            offset: 150
        });
        console.error(error)
    },
    illegalType: function(type) { //查询举报类型
        return illegalDate[type].name;
    },
    imgFileCheck: function(dom) {
        const _type = dom.files[0].type.substring(0, 5);
        const isJPG = _type === 'image';
        if (!isJPG) { //判断文件是否是图片
            Message.warning('必须是图片文件，请重选');
            dom.value = ''; // 清空文件
            return false;
        }
        const isLt2M = dom.files[0].size / 1024 / 1024 <= 10;
        if (!isLt2M) {
            Message.warning('上传图片大小不能超过 10MB!');
            dom.value = ''; // 清空文件
            return false;
        }
        return true;
    },
    postsLevel: function(code) { // 查询鉴黄视频级别
        return postsLevel[code].name;
    },
    postsStatus: function(code) { // 鉴黄视频处理状态码
        let _name = '无对应状态码';
        for (var i = 0; i < postsStatus.length; i++) {
            if (postsStatus[i].id == code) {
                _name = postsStatus[i].name;
            }
        }
        return _name;
    }
};