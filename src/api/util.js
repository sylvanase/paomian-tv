import moment from 'moment';

var DEFAULT_PATTERN = 'YYYY-MM-DD HH:mm:ss'; //时间戳默认解析格式
var filterDate = [  //滤镜数据
    {id: 0, name: '无滤镜-原味'},
    {id: 1, name: '密阳-笋干味'},
    {id: 2, name: '火锅英雄-火辣味'},
    {id: 3, name: '情书-香菇味'},
    {id: 4, name: '杀人回忆-黑椒味'},
    {id: 5, name: '大独裁者-墨鱼味'},
    {id: 6, name: '禁闭岛-鲜虾味'},
    {id: 7, name: '星际穿越-酸菜味'},
    {id: 8, name: '梦旅人-豚骨味'},
    {id: 9, name: '童话镇-番茄味'},
    {id: 10, name: '电影胶片-鸡肉味'},
    {id: 11, name: '心灵捕手-麻辣味'},
    {id: 13, name: '红气球-红烧味'},
    {id: 14, name: '燃情岁月-香葱味'},
    {id: 15, name: '秋天童话-雪菜味'},
    {id: 18, name: '东京爱情-酸辣味'},
    {id: 19, name: '碧海蓝天-海鲜味'},
    {id: 26, name: '七月-蒜香味'},
    {id: 27, name: '漫画风-火鸡味'},
    {id: 28, name: '芦笋味'},
    {id: 29, name: '卤香味'},
    {id: 30, name: '田园味'}
];

export default {
    getQueryStringByName: function (name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        var r = window.location.search.substr(1).match(reg);
        var context = "";
        if (r != null)
            context = r[2];
        reg = null;
        r = null;
        return context == null || context == "" || context == "undefined" ? "" : context;
    },
    timestampFormat: function (date, pattern) {
        var timeString = '';
        pattern = pattern || DEFAULT_PATTERN;
        timeString = moment(parseInt(date)).format(pattern);
        return timeString;
    },
    formatDate: {
        format: function (date, pattern) {
            pattern = pattern || DEFAULT_PATTERN;
            /*return pattern.replace(SIGN_REGEXP, function ($0) {
             switch ($0.charAt(0)) {
             case 'y': return padding(date.getFullYear(), $0.length);
             case 'M': return padding(date.getMonth() + 1, $0.length);
             case 'd': return padding(date.getDate(), $0.length);
             case 'w': return date.getDay() + 1;
             case 'h': return padding(date.getHours(), $0.length);
             case 'm': return padding(date.getMinutes(), $0.length);
             case 's': return padding(date.getSeconds(), $0.length);
             }
             });*/
            var o = {
                "M+": date.getMonth() + 1, //月份
                "d+": date.getDate(), //日
                "h+": date.getHours(), //小时
                "m+": date.getMinutes(), //分
                "s+": date.getSeconds(), //秒
                "q+": Math.floor((date.getMonth() + 3) / 3), //季度
                "S": date.getMilliseconds() //毫秒
            };
            if (/(y+)/.test(pattern))
                pattern = pattern.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
            for (var k in o)
                if (new RegExp("(" + k + ")").test(pattern))
                    pattern = pattern.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
            return pattern;
        }
    },
    filterDate //素材的滤镜数据
};
