<template>
    <section>
        <!--顶部工具条-->
        <el-col :span="24" class="toolbar" style="padding-bottom: 0;">
            <el-form :inline="true">
                <el-form-item>
                    <el-button type="primary" @click="showForm('')">新建</el-button>
                </el-form-item>
            </el-form>
        </el-col>

        <!--表格-->
        <el-table v-loading="tableLoading" :data="tableList" stripe border style="width: 100%;">
            <el-table-column prop="id" label="id" min-width="100" fixed></el-table-column>
            <el-table-column prop="avatarUrl" label="头像" width="136">
                <template scope="scope">
                    <img v-if="scope.row.avatarUrl" class="user-avatar" :src="scope.row.avatarUrl" alt="用户头像"/>
                    <img v-else class="user-avatar" src="../../../../static/img/TV.png" alt="用户头像"/>
                </template>
            </el-table-column>
            <el-table-column prop="username" min-width="150" label="昵称"></el-table-column>
            <el-table-column prop="createTime" label="注册时间" min-width="120"></el-table-column>
            <el-table-column prop="phone" label="手机" min-width="150"></el-table-column>
            <el-table-column prop="sex" label="性别" width="80">
                <template scope="scope">
                    {{ scope.row.sex == 0 ? '男' : '女' }}
                </template>
            </el-table-column>
            <el-table-column prop="age" label="年龄"></el-table-column>
            <el-table-column prop="fansCount" label="粉丝" sortable width="120">
                <template scope="scope">
                    {{ scope.row.fansCount ? scope.row.fansCount : '0' }}
                </template>
            </el-table-column>
            <el-table-column prop="carsCount" label="关注">
                <template scope="scope">
                    {{ scope.row.carsCount ? scope.row.carsCount : '0' }}
                </template>
            </el-table-column>
            <el-table-column prop="postCount" label="帖子" sortable width="120">
                <template scope="scope">
                    <el-button v-if="scope.row.postCount" size="small" @click="showVideo(scope.row)">{{
                        scope.row.postCount
                        }}
                    </el-button>
                    <span v-else>0</span>
                </template>
            </el-table-column>
            <el-table-column prop="likeCount" label="喜欢">
                <template scope="scope">
                    <el-button v-if="scope.row.likeCount" size="small" @click="showLike(scope.row)">{{
                        scope.row.likeCount
                        }}
                    </el-button>
                    <span v-else>0</span>
                </template>
            </el-table-column>
            <el-table-column label="操作" width="150" fixed="right">
                <template scope="scope">
                    <el-button size="small" @click="showForm(scope.row)">编辑</el-button>
                    <el-button :type="scope.row.userStatus == 0 ? 'danger' : 'warning'" size="small" @click="userDel(scope.row)">
                        {{ scope.row.userStatus == 0 ? '删除' : '恢复' }}
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

        <!--编辑马甲号-->
        <v-detail :userData="userData" v-model="isShowForm" v-on:refresh="fetchList"></v-detail>

        <!--用户发帖-->
        <v-video :userId="userId" v-model="isShowVideo" v-on:audio="playVideo" v-on:preview="showBarrage"></v-video>

        <!--用户喜欢-->
        <v-like :userId="userId" v-model="isShowLike" v-on:audio="playVideo" v-on:preview="showBarrage"></v-like>

        <!--播放弹窗-->
        <el-dialog title="视频播放" v-model="videoVisible" @close="videoClose()">
            <div style="text-align: center;" v-html="videoHtml"></div>
        </el-dialog>
    </section>
</template>

<script type="es6">
    import util from '../../../api/util'
    import { axiosGet, axiosDel, axiosPost} from '../../../api/api';
    import vDetail from './robotDetail.vue'
    import vVideo from './videoList.vue'
    import vLike from './likeList.vue'

    export default {
        components: {
            vDetail,
            vVideo,
            vLike
        },
        data() {
            return {
                total: 0, //表格列表数据总数
                page: 1, //当前页，默认为第一页
                tableLoading: false, //表格的loading符号
                tableList: [], //表格数据
                isShowForm: false,
                userData: {},
                userId: '', //用户id
                isShowVideo: false, //显示、隐藏帖子列表
                isShowLike: false, //显示、隐藏喜欢列表
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
                    size: 10
                };
                para.offset = (this.page - 1) * para.size;
                this.tableLoading = true;
                axiosGet('robotList', para).then((res) => {
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
            showForm (row){ //显示用户详情表单
                this.isShowForm = true;
                this.userData = row;
            },
            userDel: function (row) {
                this.tableLoading = true;
                let paras = {
                    uid: row.id,
                    status: Number(!row.userStatus)
                };
                axiosDel('robotDel', paras).then((res) => {
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
            showVideo (row){ //显示用户帖子列表
                this.isShowVideo = true;
                this.userId = row.id;
            },
            showLike (row){ //显示用户喜欢的帖子列表
                this.isShowLike = true;
                this.userId = row.id;
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
    .user-avatar {
        width: 100px;
        height: 100px;
        border-radius: 50%;
        margin-top: 10px;
    }
</style>
