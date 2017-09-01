<template>
    <section>
        <!--顶部工具条-->
        <el-col :span="24" class="toolbar" style="padding-bottom: 0;">
            <el-form :inline="true" :model="filters">
                <el-form-item>
                    <el-input v-model="filters.kw" placeholder="帖子ID/关键字"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-input type="number" v-model="filters.uid" placeholder="用户ID"></el-input>
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
                    <el-button type="primary" @click="showForm('-1')">新增</el-button>
                </el-form-item>
            </el-form>
        </el-col>

        <!--表格-->
        <el-table v-loading="tableLoading" :data="tableList" stripe border style="width: 100%;">
            <el-table-column prop="id" label="id" width="180" fixed></el-table-column>
            <el-table-column prop="username" label="发帖人" min-width="150"></el-table-column>
            <el-table-column prop="videoText" min-width="200" label="帖子描述"></el-table-column>
            <el-table-column label="内容">
                <template scope="scope">
                    <el-button size="small" @click="playVideo(scope.row)">播放</el-button>
                </template>
            </el-table-column>
            <el-table-column prop="createTime" label="发帖时间" min-width="180"></el-table-column>
            <el-table-column prop="lastBarrageTime" label="最后弹幕时间" min-width="180"></el-table-column>
            <el-table-column label="精华" width="80">
                <template scope="scope">
                    <el-tag :type="scope.row.isEssence === 1 ? 'success' : 'danger'"
                            close-transition>{{ scope.row.isEssence === 1 ? '是' : '否' }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column label="来源">
                <template scope="scope">
                    {{ scope.row.publishType === 1 ? '后台' : '客户端' }}
                </template>
            </el-table-column>
            <el-table-column prop="videoInfoPo.viewCount" label="观看量"></el-table-column>
            <el-table-column prop="videoInfoPo.viewUserCount" label="观看人数" min-width="100"></el-table-column>
            <el-table-column prop="videoInfoPo.barrageCount" label="弹幕数"></el-table-column>
            <el-table-column prop="videoInfoPo.likeCount" label="喜欢"></el-table-column>
            <el-table-column label="显示">
                <template scope="scope">
                    <el-tag :type="scope.row.isDel === 0 ? 'success' : 'danger'"
                            close-transition>{{ scope.row.isDel === 0 ? '是' : '否' }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column label="操作" width="420" fixed="right">
                <template scope="scope">
                    <el-button size="small" @click="showForm(scope.row)">编辑</el-button>
                    <el-button :disabled="scope.row.isDel == 1 ? true : false" size="small" type="success" @click="showLike(scope.row)">点个赞</el-button>
                    <el-button :disabled="scope.row.isDel == 1 ? true : false" size="small" type="info" @click="showBarrage(scope.row)">加弹幕</el-button>
                    <el-button :type="scope.row.isEssence === 1 ? 'danger' : 'success'" size="small" @click="handleEssence(scope.row)">
                        {{ scope.row.isEssence === 1 ? '取精' : '加精' }}
                    </el-button>
                    <el-button :type="scope.row.isDel == 0 ? 'danger' : 'warning'" size="small"
                               @click="postsDel(scope.row)">
                        {{ scope.row.isDel === 0 ? '删除' : '恢复' }}
                    </el-button>
                    <el-button size="small" @click="showPostsBarrage(scope.row)">帖子弹幕</el-button>
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

        <!--为帖子点赞-->
        <el-dialog :title="likeData.title" v-model="showLikeForm">
            <el-form :model="likeData" label-width="80px" ref="likeData" style="margin-bottom: -20px;">
                <el-form-item label="点赞数" prop="count">
                    <el-input type="number" v-model.trim="likeData.count" auto-complete="off"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button size="small" @click.native="showLikeForm = false">取消</el-button>
                <el-button size="small" type="primary" @click.native="handleLike">提交</el-button>
            </div>
        </el-dialog>

        <!--为帖子加弹幕-->
        <v-barrage :postsData="postsData" v-model="isShowBarrage" v-on:refresh="fetchList"></v-barrage>

        <!--帖子弹幕列表-->
        <v-barrage-list :postsData="postsData" v-model="isShowPostsBarrage" v-on:refresh="fetchList"></v-barrage-list>

    </section>
</template>

<script type="es6">
    import util from '../../../api/util'
    import { axiosGet, axiosDel, axiosPost} from '../../../api/api';
    import vDetail from './postsDetail.vue'
    import vBarrage from './postsBarrage.vue'
    import vBarrageList from './postsBarrageList.vue'

    export default {
        components: {
            vDetail,
            vBarrage,
            vBarrageList
        },
        data() {
            return {
                filters: {
                    kw: '',
                    uid: '',
                    start: '',
                    end: ''
                },
                total: 0, //表格列表数据总数
                page: 1, //当前页，默认为第一页
                tableLoading: false, //表格的loading符号
                tableList: [], //表格数据
                isShowForm: false, //显示、隐藏编辑页
                isShowBarrage: false, //显示、隐藏弹幕列表
                isShowPostsBarrage: false, //显示、隐藏视频弹幕列表
                postsData: {},
                postsId: '', //帖子id
                isShowVideo: false, //显示、隐藏话题视频列表
                videoVisible: false,  //播放视频界面 显示、隐藏
                videoHtml: '',
                showLikeForm: false,
                likeData: {
                    id: '',
                    title: '',
                    count: 0
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
                    uid: this.filters.uid,
                    startTime: this.filters.start,
                    endTime: this.filters.end,
                    kw: '',
                    id: ''
                };
                if (isNaN(this.filters.kw)) { //输入不为数字，值传入kw
                    para.kw = this.filters.kw;
                } else {
                    para.id = this.filters.kw;
                }
                para.offset = (this.page - 1) * para.size;
                this.tableLoading = true;
                axiosGet('postsList', para).then((res) => {
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
                            if(item.lastBarrageTime){
                                item.lastBarrageTime = util.timestampFormat(item.lastBarrageTime);
                            }
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
            showBarrage (row){ //显示弹幕列表
                this.isShowBarrage = true;
                this.postsData = row;
            },
            showPostsBarrage (row){ //显示视频弹幕列表
                this.isShowPostsBarrage = true;
                this.postsData = row;
            },
            playVideo(row){ //播放视频
                this.videoVisible = true;
                this.videoHtml = '<video style="max-width: 100%;max-height:350px;" controls="controls" autoplay="autoplay">'
                    + '<source src="' + row.videoUrl + '" type="video/mp4">对不起，您的浏览器不支持video标签，无法播放视频。</video>';
            },
            videoClose(){
                this.videoHtml = '';
            },
            showLike(row){ //为视频点赞
                this.showLikeForm = true;
                this.likeData.title = '为视频：' + row.id + ' 疯狂打call！';
                this.likeData.id = row.id;
            },
            handleLike(){
                let para = new FormData();
                para.append("vpId", this.likeData.id);
                para.append("num", this.likeData.count);
                axiosPost('postsLike', para).then((res) => {
                    let { error, status } = res;
                    if (status !== 0) {
                        if (status == 403) { //返回403时，重新登录
                            sessionStorage.removeItem('user');
                            this.$router.push('/login');
                        }else{
                            this.$message.error(error);
                        }
                    } else {
                        this.$message.success('点赞成功');
                    }
                });
            },
            handleEssence(row){
                this.tableLoading = true;
                let paras = new FormData();
                paras.append("id", row.id);
                paras.append("status", Number(!row.isEssence));
                axiosPost('postsEssence', paras).then((res) => {
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
                        this.$message.success('操作成功');
                        this.fetchList();
                    }
                });
            },
            setStart(val){ //格式化日期控件值
                this.filters.start = val;
            },
            setEnd(val){
                this.filters.end = val;
            },
            postsDel: function (row) { //软删除帖子
                this.tableLoading = true;
                let paras = new FormData();
                paras.append("id", row.id);
                paras.append("status", Number(!row.isDel));
                axiosPost('postsStatus', paras).then((res) => {
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
                        this.$message.success('操作成功');
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
