<template>
    <section>
        <!--顶部工具条-->
        <el-col :span="24" class="toolbar" style="padding-bottom: 0;">
            <el-form :inline="true" :model="filters">
                <el-form-item>
                    <el-input v-model="filters.kw" placeholder="ID/昵称" icon="circle-close" :on-icon-click="resetSearch"
                              @keyup.enter.native="fetchList"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-date-picker v-model="filters.time" type="datetimerange" :picker-options="pickerOptions"
                                    placeholder="选择时间范围" align="center" @change="setRange">
                    </el-date-picker>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="fetchList">查询</el-button>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handelPrivilege">权限开通</el-button>
                </el-form-item>
            </el-form>
        </el-col>

        <!--表格-->
        <el-table v-loading="tableLoading" :data="tableList" stripe border :max-height="tableHeight"
                  style="width: 100%;">
            <el-table-column prop="uid" label="主账号id"></el-table-column>
            <el-table-column prop="userName" label="昵称"></el-table-column>
            <el-table-column prop="avatar" label="头像" width="136">
                <template scope="scope">
                    <img v-if="scope.row.avatar !== ''" class="user-avatar" :src="scope.row.avatar" alt="用户头像"/>
                    <img v-else class="user-avatar" src="../../../../static/img/TV.png" alt="用户头像"/>
                </template>
            </el-table-column>
            <el-table-column label="发布视频数">
                <template scope="scope">
                    <el-button v-if="scope.row.kpiVideoCount" size="small" @click="showVideo(scope.row)">
                        {{scope.row.kpiVideoCount}}
                    </el-button>
                    <span v-else>0</span>
                </template>
            </el-table-column>
            <el-table-column label="发布弹幕数" width="120">
                <template scope="scope">
                    <el-button v-if="scope.row.kpiBarrageCount" size="small" @click="showBarrage(scope.row)">
                        {{scope.row.kpiBarrageCount}}
                    </el-button>
                    <span v-else>0</span>
                </template>
            </el-table-column>
            <el-table-column label="点赞数" width="120">
                <template scope="scope">
                    <el-button v-if="scope.row.kpiVideoLikeCount" size="small" @click="showLike(scope.row)">
                        {{scope.row.kpiVideoLikeCount}}
                    </el-button>
                    <span v-else>0</span>
                </template>
            </el-table-column>
        </el-table>

        <!--分页-->
        <el-col :span="24" class="mt-10">
            <el-pagination style="float:right;" @current-change="handleCurrentChange"
                           :page-size="10" :current-page="page"
                           layout="total, prev, pager, next, jumper" :total="total">
            </el-pagination>
        </el-col>

        <!--小号视频列表-->
        <v-video :masterData="masterData" v-model="isShowVideo" v-on:preview="playVideo"></v-video>

        <!--播放弹窗-->
        <el-dialog title="视频播放" v-model="videoVisible" @close="videoClose()">
            <div style="text-align: center;" v-html="videoHtml"></div>
        </el-dialog>

        <!--小号弹幕列表-->
        <v-barrage-list :masterData="masterData" v-model="isShowBarrage" v-on:preview="playVideo"></v-barrage-list>

        <!--小号点赞列表-->
        <v-like-list :masterData="masterData" v-model="isShowLike" v-on:preview="playVideo"></v-like-list>

        <!--配置置顶-->
        <el-dialog title="账号权限开通" v-model="configVisible" size="tiny">
            <el-form :model="configData" label-width="80px" :rules="configRules" ref="configData">
                <el-form-item label="账号id" prop="uid" style="margin-bottom: -20px;">
                    <el-input placeholder="请输入需要开通权限的用户id" v-model="configData.uid"
                              type="number"
                              auto-complete="off"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click.native="configVisible = false">取消</el-button>
                <el-button type="primary" @click.native="configSubmit">确定</el-button>
            </div>
        </el-dialog>
    </section>
</template>

<script type="es6">
    import util from '../../../api/util'
    import {httpGet, httpPost} from '../../../api/api';
    import vVideo from './masterVideoList.vue'
    import vBarrageList from './masterBarrageList.vue'
    import vLikeList from './masterLikeList.vue'

    export default {
        components: {
            vVideo,
            vBarrageList,
            vLikeList
        },
        data() {
            return {
                filters: {
                    kw: '',
                    time: '',
                    start: '',
                    end: ''
                },
                pickerOptions: { //时间控件快捷方式
                    shortcuts: [{
                        text: '最近一周',
                        onClick(picker) {
                            const end = new Date();
                            const start = new Date();
                            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
                            picker.$emit('pick', [start, end]);
                        }
                    }, {
                        text: '最近一个月',
                        onClick(picker) {
                            const end = new Date();
                            const start = new Date();
                            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
                            picker.$emit('pick', [start, end]);
                        }
                    }]
                },
                total: 0, //表格列表数据总数
                page: 1, //当前页，默认为第一页
                tableHeight: '100%',
                tableLoading: false, //表格的loading符号
                tableList: [], //表格数据
                masterData: '', //查询的主账号信息
                isShowForm: false, //显示、隐藏权限开通
                isShowVideo: false, //显示、隐藏话题视频列表
                isShowLike: false, //显示、隐藏点赞列表
                isShowBarrage: false, //显示、隐藏弹幕列表
                configVisible: false,
                configData: {
                    uid: ''
                },
                configRules: {
                    name: [
                        {required: true, message: '请输入用户id', trigger: 'blur'}
                    ]
                },
                videoVisible: false,  //播放视频界面 显示、隐藏
                videoHtml: ''
            }
        },
        methods: {
            handleCurrentChange(val) { //翻页
                this.page = val;
                this.fetchList();
            },
            fetchList() {    //获取列表
                let _self = this;
                _self.tableHeight = document.getElementById('container').clientHeight - 77 - 42 - 15;
                let paras = {
                    offset: 0,
                    size: 10,
                    id: '',
                    kw: '',
                    startTime: _self.filters.start,
                    endTime: _self.filters.end
                };
                if (isNaN(_self.filters.kw)) { //输入不为数字，值传入kw
                    paras.kw = _self.filters.kw;
                } else {
                    paras.id = _self.filters.kw;
                }
                paras.offset = (_self.page - 1) * paras.size;
                _self.tableLoading = true;
                httpGet('userMasterList', paras, _self, function (res) {
                    _self.tableLoading = false;
                    try {
                        let {error, status, data} = res;
                        _self.total = data.totalElements;
                        _self.tableList = data.content;
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            resetSearch() {
                this.filters.kw = '';
                this.fetchList();
            },
            setRange(val) { //格式化日期控件值
                this.filters.start = val.substring(0, 19);
                this.filters.end = val.substring(22);
            },
            handelPrivilege() { //显示置顶配置弹窗
                this.configVisible = true;
                this.configData = {
                    uid: ''
                };
            },
            configSubmit() {
                this.$refs.configData.validate((valid) => {
                    let _self = this;
                    let paras = new FormData();
                    paras.append("uid", _self.configData.uid);
                    httpPost('userMasterAdd', paras, _self, function (res) {
                        try {
                            _self.$message.success('账号权限开通成功');
                            _self.$refs['configData'].resetFields();
                            _self.configVisible = false;
                            _self.fetchList();
                        } catch (error) {
                            util.jsErrNotify(error);
                        }
                    })
                });
            },
            showVideo(row) { //显示视频列表
                this.isShowVideo = true;
                this.masterData = row;
            },
            playVideo(row) { //播放视频
                this.videoVisible = true;
                this.videoHtml = '<video style="max-width: 100%;max-height:350px;" controls="controls" autoplay="autoplay">'
                    + '<source src="' + row.videoUrl + '" type="video/mp4">对不起，您的浏览器不支持video标签，无法播放视频。</video>';
            },
            videoClose() {
                this.videoHtml = '';
            },
            showBarrage(row) { //显示弹幕列表
                this.isShowBarrage = true;
                this.masterData = row;
            },
            showLike(row) { //显示赞列表
                this.isShowLike = true;
                this.masterData = row;
            }
        },
        mounted() {
            this.fetchList();
        }
    }
</script>

<style>
    .user-avatar {
        width: 100px;
        height: 100px;
        border-radius: 50%;
        margin-top: 10px;
    }
</style>
