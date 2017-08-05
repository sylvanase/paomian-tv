<template>
    <section>
        <!--顶部工具条-->
        <el-col :span="24" class="toolbar" style="padding-bottom: 0;">
            <el-form :inline="true" :model="filters">
                <el-form-item>
                    <el-input v-model="filters.kw" placeholder="视频ID/关键字"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-input v-model="filters.uid" placeholder="用户ID/用户昵称"></el-input>
                </el-form-item>
                <!--<el-form-item>
                    <el-date-picker type="date" placeholder="开始时间" v-model="filters.start"
                                    style="width: 200px;"></el-date-picker>
                    <span> - </span>
                    <el-date-picker type="date" placeholder="结束时间" v-model="filters.end"
                                    style="width: 200px;"></el-date-picker>
                </el-form-item>-->
                <el-form-item>
                    <el-button type="primary" @click="fetchList">查询</el-button>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="showForm('-1')">新增</el-button>
                </el-form-item>
            </el-form>
        </el-col>

        <!--表格-->
        <el-table v-loading="tableLoading" :data="tableList" stripe border style="width: 100%;">
            <el-table-column prop="id" label="视频id" min-width="80" fixed></el-table-column>
            <el-table-column prop="username" label="发帖人" min-width="150"></el-table-column>
            <el-table-column prop="videoText" min-width="150" label="视频标题"></el-table-column>
            <el-table-column label="内容">
                <template scope="scope">
                    <el-button size="small" @click="playVideo(scope.row)">播放</el-button>
                </template>
            </el-table-column>
            <el-table-column prop="createTime" label="发帖时间" min-width="180"></el-table-column>
            <el-table-column label="精华" width="80">
                <template scope="scope">
                    <el-tag :type="scope.row.isEssence === 1 ? 'success' : 'danger'"
                            close-transition>{{ scope.row.isEssence === 1 ? 'Yes！' : 'No' }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column label="操作" width="100" fixed="right">
                <template scope="scope">
                    <el-button size="small" @click="showForm(scope.row)">编辑</el-button>
                    <!--<el-button v-if="scope.row.isDel == 0" type="danger" size="small" @click="topicDel(scope.row)">删除
                    </el-button>-->
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

        <!--帖子编辑-->
        <v-detail :postsData="postsData" v-model="isShowForm" v-on:refresh="fetchList"></v-detail>

        <!--播放弹窗-->
        <el-dialog title="视频播放" v-model="videoVisible" @close="videoClose()">
            <div style="text-align: center;" v-html="videoHtml"></div>
        </el-dialog>

    </section>
</template>

<script type="es6">
    import util from '../../../api/util'
    import { axiosGet, axiosDel, axiosPost} from '../../../api/api';
    import vDetail from './postsDetail.vue'

    export default {
        components: {
            vDetail
        },
        data() {
            return {
                filters: {
                    kw: '',
                    uid: ''
                },
                total: 0, //表格列表数据总数
                page: 1, //当前页，默认为第一页
                tableLoading: false, //表格的loading符号
                tableList: [], //表格数据
                isShowForm: false, //显示、隐藏编辑页
                postsData: {},
                postsId: '', //帖子id
                isShowVideo: false, //显示、隐藏话题视频列表
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
                let para = {
                    offset: 0,
                    size: 10,
                    uid: this.filters.uid,
                    kw: this.filters.kw
                };
                /*if (isNaN(this.filters.kw)) { //输入不为数字，值传入kw
                 para.kw = this.filters.kw;
                 } else {
                 para.id = this.filters.kw;
                 }*/
                para.offset = (this.page - 1) * para.size;
                this.tableLoading = true;
                axiosGet('videoList', para).then((res) => {
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
                            item.createTime = util.timestampFormat(item.createTime);
                            return item;
                        });
                        this.tableLoading = false;
                    }
                });
            },
            showForm (row){ //显示详情表单
                this.isShowForm = true;
                this.postsData = row;
            },
            playVideo(row){ //播放视频
                this.videoVisible = true;
                this.videoHtml = '<video style="max-width: 100%;max-height:350px;" controls="controls" autoplay="autoplay">'
                    + '<source src="' + row.videoUrl + '" type="video/mp4">对不起，您的浏览器不支持video标签，无法播放视频。</video>';
            },
            videoClose(){
                this.videoHtml = '';
            }
        },
        mounted() {
            this.fetchList();
        }
    }
</script>

<style>
</style>
