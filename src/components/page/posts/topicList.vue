<template>
    <section>
        <!--顶部工具条-->
        <el-col :span="24" class="toolbar" style="padding-bottom: 0;">
            <el-form :inline="true" :model="filters">
                <el-form-item>
                    <el-input v-model="filters.kw" placeholder="ID/关键字"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-date-picker type="date" placeholder="开始时间" v-model="filters.start"
                                    style="width: 200px;" @change="setStart"></el-date-picker>
                    <span> - </span>
                    <el-date-picker type="date" placeholder="结束时间" v-model="filters.end"
                                    style="width: 200px;" @change="setEnd"></el-date-picker>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="fetchList">查询</el-button>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handelConfig">置顶配置</el-button>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="showForm('-1')">新增</el-button>
                </el-form-item>
            </el-form>
        </el-col>

        <!--表格-->
        <el-table v-loading="tableLoading" :data="tableList" stripe border style="width: 100%;">
            <el-table-column prop="id" label="id" min-width="80" fixed></el-table-column>
            <el-table-column prop="username" label="发帖人" min-width="150"></el-table-column>
            <el-table-column prop="name" label="标题" min-width="200"></el-table-column>
            <el-table-column label="样片">
                <template scope="scope">
                    <el-button size="small" @click="playVideo(scope.row)">播放</el-button>
                </template>
            </el-table-column>
            <el-table-column prop="createTime" label="发帖时间" min-width="120"></el-table-column>
            <el-table-column prop="viewCount" label="视频总数" min-width="100"></el-table-column>
            <el-table-column prop="userCount" label="参与人数" min-width="100"></el-table-column>
            <el-table-column prop="viewCount" label="浏览量"></el-table-column>
            <el-table-column prop="actionUserCount" label="互动人数" min-width="100"></el-table-column>
            <el-table-column prop="status" label="置顶" width="80">
                <template scope="scope">
                    <el-tag :type="scope.row.top === 1 ? 'success' : 'danger'"
                            close-transition>{{ scope.row.top === 1 ? 'Yes！' : 'No' }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column label="操作" width="310" fixed="right">
                <template scope="scope">
                    <el-button type="info" size="small" @click="showVideo(scope.row)">视频列表</el-button>
                    <el-button size="small" @click="showForm(scope.row)">编辑</el-button>
                    <el-button v-if="scope.row.isDel == 0" type="danger" size="small" @click="topicDel(scope.row)">删除
                    </el-button>
                    <el-button :type="scope.row.top === 1 ? 'danger' : 'success'" size="small"
                               @click="topicTop(scope.row)">
                        {{ scope.row.top === 1 ? '取消置顶' : '置顶' }}
                    </el-button>
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

        <!--话题编辑-->
        <v-detail :topicData="topicData" v-model="isShowForm" v-on:refresh="fetchList"></v-detail>

        <!--视频列表-->
        <v-video :topicData="topicData" v-model="isShowVideo" v-on:preview="playVideo"
                 v-on:refresh="fetchList"></v-video>

        <!--播放弹窗-->
        <el-dialog title="视频播放" v-model="videoVisible" @close="videoClose()">
            <div style="text-align: center;" v-html="videoHtml"></div>
        </el-dialog>

        <!--配置置顶-->
        <el-dialog title="话题置顶配置" v-model="configVisible" size="tiny">
            <el-form :model="configData" label-width="80px" ref="configData">
                <el-form-item label="top1" prop="first">
                    <el-input style="width: 200px;" v-model.number="configData.first" type="number"
                              auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="top2" prop="second">
                    <el-input style="width: 200px;" v-model.number="configData.second" type="number"
                              auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="top3" prop="third" style="margin-bottom: 0;">
                    <el-input style="width: 200px;" v-model.number="configData.third" type="number"
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
    import { axiosGet, axiosDel, axiosPost} from '../../../api/api';
    import vDetail from './topicDetail.vue'
    import vVideo from './topicVideo.vue'

    export default {
        components: {
            vDetail,
            vVideo
        },
        data() {
            return {
                filters: {
                    kw: '',
                    start: '',
                    end: ''
                },
                total: 0, //表格列表数据总数
                page: 1, //当前页，默认为第一页
                tableLoading: false, //表格的loading符号
                tableList: [], //表格数据
                isShowForm: false, //显示、隐藏编辑页
                topicData: {},
                topicId: '', //话题id
                isShowVideo: false, //显示、隐藏话题视频列表
                videoVisible: false,  //播放视频界面 显示、隐藏
                videoHtml: '',
                configVisible: false,
                configData: {
                    first: '',
                    second: '',
                    third: ''
                }
            }
        },
        methods: {
            handleCurrentChange(val) { //翻页
                this.page = val;
                this.fetchList();
            },
            fetchList() {    //获取列表
                let para = {
                    offset: 0,
                    size: 10,
                    id: '',
                    kw: '',
                    startTime: this.filters.start,
                    endTime: this.filters.end
                };
                if (isNaN(this.filters.kw)) { //输入不为数字，值传入kw
                    para.kw = this.filters.kw;
                } else {
                    para.id = this.filters.kw;
                }
                para.offset = (this.page - 1) * para.size;
                this.tableLoading = true;
                axiosGet('topicList', para).then((res) => {
                    let { error, status,data } = res;
                    if (status !== 0) {
                        if (status == 403) { //返回403时，重新登录
                            sessionStorage.removeItem('user');
                            this.$router.push('/login');
                        } else {
                            this.$message.error(error);
                        }
                    } else {
                        this.total = data.totalElements;
                        this.tableList = data.content.map(function (item) { //格式化显示时间
                            item.createTime = util.timestampFormat(item.createTime, 'YYYY-MM-DD');
                            return item;
                        });
                        this.tableLoading = false;
                    }
                });
            },
            setStart(val){ //格式化日期控件值
                this.filters.start = val;
            },
            setEnd(val){
                this.filters.end = val;
            },
            handelConfig(){ //显示置顶配置弹窗
                this.configVisible = true;
                axiosGet('topConfigDetail').then((res) => {
                    let { error, status,data } = res;
                    if (status !== 0) {
                        if (status == 403) { //返回403时，重新登录
                            sessionStorage.removeItem('user');
                            this.$router.push('/login');
                        } else {
                            this.$message.error(error);
                        }
                    } else {
                        this.configData = {
                            first: data.firstTopId,
                            second: data.secondTopId,
                            third: data.thirdTopId
                        };
                    }
                });
            },
            configSubmit(){
                this.$refs.configData.validate((valid) => {
                    let para = new FormData();
                    para.append("firstTopId", this.configData.first);
                    para.append("secondTopId", this.configData.second);
                    para.append("thirdTopId", this.configData.third);
                    axiosPost('topConfigHandel', para).then((res) => {
                        let { error, status } = res;
                        if (status !== 0) {
                            if (status == 403) { //返回403时，重新登录
                                sessionStorage.removeItem('user');
                                this.$router.push('/login');
                            } else {
                                this.$message.error(error);
                            }
                        } else {
                            this.$message.success('更改配置成功');
                            this.$refs['configData'].resetFields();
                            this.configVisible = false;
                            this.fetchList();
                        }
                    });
                });
            },
            showForm (row){ //显示详情表单
                this.isShowForm = true;
                this.topicData = row;
            },
            showVideo (row){ //显示视频列表
                this.isShowVideo = true;
                this.topicData = row;
            },
            playVideo(row){ //播放视频
                this.videoVisible = true;
                this.videoHtml = '<video style="max-width: 100%;max-height:350px;" controls="controls" autoplay="autoplay">'
                    + '<source src="' + row.videoUrl + '" type="video/mp4">对不起，您的浏览器不支持video标签，无法播放视频。</video>';
            },
            videoClose(){
                this.videoHtml = '';
            },
            topicDel: function (row) {
                this.$confirm('确认删除该话题吗?', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.tableLoading = true;
                    let paras = new FormData();
                    paras.append("id", row.id);
                    paras.append("status", 1);
                    axiosPost('topicDel', paras).then((res) => {
                        this.tableLoading = false;
                        let { error, status } = res;
                        if (status !== 0) {
                            if (status == 403) { //返回403时，重新登录
                                sessionStorage.removeItem('user');
                                this.$router.push('/login');
                            } else {
                                this.$message.error(error);
                            }
                        } else {
                            this.$message.success('删除成功');
                            this.fetchList();
                        }
                    });
                });
            },
            topicTop: function (row) {
                this.tableLoading = true;
                let paras = new FormData();
                paras.append("id", row.id);
                paras.append("status", Number(!row.top));
                axiosPost('topicTop', paras).then((res) => {
                    this.tableLoading = false;
                    let { error, status } = res;
                    if (status !== 0) {
                        if (status == 403) { //返回403时，重新登录
                            sessionStorage.removeItem('user');
                            this.$router.push('/login');
                        } else {
                            this.$message.error(error);
                        }
                    } else {
                        this.$message.success('置顶成功');
                        this.fetchList();
                    }
                });
            }
        },
        mounted() {
            this.fetchList();
        }
    }
</script>

<style>
</style>
