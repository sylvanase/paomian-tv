<template>
    <section>
        <!--表格-->
        <el-table v-loading="tableLoading" :data="tableList" stripe border style="width: 100%;">
            <el-table-column prop="id" label="uid" width="200" fixed></el-table-column>
            <el-table-column prop="avatarUrl" label="头像" width="136">
                <template scope="scope">
                    <img v-if="scope.row.avatarUrl" class="user-avatar" :src="scope.row.avatarUrl" alt="用户头像"/>
                    <img v-else class="user-avatar" src="../../../../static/img/TV.png" alt="用户头像"/>
                </template>
            </el-table-column>
            <el-table-column prop="username" min-width="150" label="昵称"></el-table-column>
            <el-table-column prop="createTime" label="注册时间" min-width="120"></el-table-column>
            <el-table-column prop="sex" label="性别" width="80">
                <template scope="scope">
                    {{ scope.row.sex == 0 ? '男' : '女' }}
                </template>
            </el-table-column>
            <el-table-column prop="age" label="年龄" width="66"></el-table-column>
            <el-table-column prop="fansCount" label="粉丝" width="120">
                <template scope="scope">
                    {{ scope.row.fansCount ? scope.row.fansCount : '0' }}
                </template>
            </el-table-column>
            <el-table-column prop="carsCount" label="关注">
                <template scope="scope">
                    {{ scope.row.carsCount ? scope.row.carsCount : '0' }}
                </template>
            </el-table-column>
            <el-table-column prop="postCount" label="帖子" width="120">
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
            <el-table-column prop="address" label="地址" min-width="200"></el-table-column>
            <el-table-column label="QQ" width="90">
                <template scope="scope">
                    <el-tag :type="scope.row.qqBind ? 'success' : 'danger'"
                            close-transition>{{ scope.row.qqBind ? '已绑定' : '未绑定' }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column label="微信" width="90">
                <template scope="scope">
                    <el-tag :type="scope.row.wxBind ? 'success' : 'danger'"
                            close-transition>{{ scope.row.wxBind ? '已绑定' : '未绑定' }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column label="微博" width="90">
                <template scope="scope">
                    <el-tag :type="scope.row.wbBind ? 'success' : 'danger'"
                            close-transition>{{ scope.row.wbBind ? '已绑定' : '未绑定' }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column label="操作" fixed="right" width="170">
                <template scope="scope">
                    <el-button :disabled="!scope.row.postCount" type="info" size="small" @click="showVideo(scope.row)">
                        查看帖子
                    </el-button>
                    <el-button type="danger" size="small" @click="careUser(scope.row)">
                        取关
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

        <!--播放弹窗-->
        <el-dialog title="视频播放" v-model="videoVisible" @close="videoClose()">
            <div style="text-align: center;" v-html="videoHtml"></div>
        </el-dialog>

        <!--用户发帖-->
        <v-video :userId="userId" v-model="isShowVideo" v-on:audio="playVideo" v-on:preview="showBarrage"></v-video>

        <!--用户喜欢-->
        <v-like :userId="userId" v-model="isShowLike" v-on:audio="playVideo" v-on:preview="showBarrage"></v-like>


        <!-- 为帖子增加弹幕 -->
        <el-dialog title="弹幕列表" v-model="isShowBarrage">
            <el-col :span="24" class="toolbar" style="padding-bottom: 0;margin-top: -20px;">
                <el-form :inline="true" :model="barrage.filters">
                    <el-form-item>
                        <el-select v-model="barrage.filters.tag" @change="fetchBarrage" placeholder="请选择" style="width: 150px;">
                            <el-option label="全部标签" value=""></el-option>
                            <el-option v-for="item in barrage.tagList" :key="item.id" :label="item.name"
                                       :value="item.id">
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="submitBarrage()">提交</el-button>
                    </el-form-item>
                    <el-form-item>
                        <span>（点击弹幕内容，即可对其进行编辑操作）</span>
                    </el-form-item>
                </el-form>
            </el-col>
            <!--表格-->
            <el-table v-loading="tableLoading" class="tb-edit" :data="barrage.tableList" stripe border style="width: 100%;"
                      @selection-change="handleSelectionChange" highlight-current-row>
                <el-table-column type="selection" width="55"></el-table-column>
                <el-table-column prop="id" label="id" width="150"></el-table-column>
                <el-table-column prop="text" label="弹幕内容">
                    <template scope="scope">
                        <el-input size="small" minlength="1" v-model.trim="scope.row.text" placeholder="请输入内容" @change="handleEdit(scope.$index, scope.row)"></el-input> <span>{{scope.row.text}}</span>
                    </template>
                </el-table-column>
            </el-table>
            <!--工具条-->
            <el-col :span="24" class="mt-10" style="margin-bottom: 20px;">
                <el-pagination style="float:right;" @current-change="barragePageChange"
                               :page-size="10" :current-page="barrage.page"
                               layout="total, prev, pager, next, jumper" :total="barrage.total">
                </el-pagination>
            </el-col>

        </el-dialog>
    </section>
</template>

<script type="es6">
    import util from '../../../api/util'
    import { axiosGet, axiosPost} from '../../../api/api';
    import vVideo from './videoList.vue'
    import vLike from './likeList.vue'

    export default {
        components: {
            vVideo,
            vLike

        },
        data() {
            return {
                total: 0, //表格列表数据总数
                page: 1, //当前页，默认为第一页
                tableLoading: false, //表格的loading符号
                tableList: [], //表格数据
                userId: '',
                isShowLike: false, //显示、隐藏喜欢列表
                isShowVideo: false, //显示、隐藏帖子列表
                isShowBarrage: false, //显示、隐藏弹幕列表
                videoVisible: false,  //播放视频界面 显示、隐藏
                videoHtml: '',
                barrage: {
                    vpId: '', //视频id
                    tagList:[],
                    total: 0, //表格列表数据总数
                    page: 1, //当前页，默认为第一页
                    tableLoading: false, //表格的loading符号
                    tableList: [], //表格数据
                    filters: { //搜索筛选条件
                        tag: ''
                    },
                    multipleBarrageIds: [] //添加的弹幕id集合
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
                    size: 10
                };
                para.offset = (this.page - 1) * para.size;
                this.tableLoading = true;
                axiosGet('userCareOperate', para).then((res) => {
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
            showVideo (row){ //显示用户帖子列表
                this.isShowVideo = true;
                this.userId = row.id;
            },
            playVideo(row){ //播放视频
                this.videoVisible = true;
                this.videoHtml = '<video style="max-width: 100%;max-height:350px;" controls="controls" autoplay="autoplay">'
                    + '<source src="' + row.videoUrl + '" type="video/mp4">对不起，您的浏览器不支持video标签，无法播放视频。</video>';
            },
            videoClose(){
                this.videoHtml = '';
            },
            showBarrage (row){ //显示弹幕列表
                this.isShowBarrage = true;
                this.fetchBarrage();
                this.barrageTag();
                this.barrage.vpId = row.id;
            },
            showLike (row){ //显示用户喜欢的帖子列表
                this.isShowLike = true;
                this.userId = row.id;
            },
            //运营取关用户
            careUser: function (row) {
                this.tableLoading = true;
                let paras = new FormData();
                paras.append("uid", row.id);
                paras.append("status", Number(!row.userCare));
                axiosPost('userCare', paras).then((res) => {
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
            /*
             * 处理弹幕开始
             * */
            barragePageChange(val) { //翻页
                this.barrage.page = val;
                this.fetchBarrage();
            },
            fetchBarrage() {    //获取弹幕列表
                let para = {
                    offset: 0,
                    size: 10,
                    tagId: this.barrage.filters.tag
                };
                para.offset = (this.barrage.page - 1) * para.size;
                this.barrage.tableLoading = true;
                axiosGet('barrageList', para).then((res) => {
                    let { error, status,data } = res;
                    if (status !== 0) {
                        if (status == 403) { //返回403时，重新登录
                            sessionStorage.removeItem('user');
                            this.$router.push('/login');
                        } else {
                            this.$message.error(error);
                        }
                    } else {
                        this.barrage.tableList = data.content;
                        this.barrage.total = data.totalElements;
                        this.barrage.tableLoading = false;
                    }
                });
            },
            submitBarrage(){ //提交所选弹幕
                let paras = new FormData();
                paras.append("vpId", this.barrage.vpId);
                paras.append("barrageIds", this.barrage.multipleBarrageIds.join(','));
                axiosPost('postsBarrageAdd', paras).then((res) => {
                    let { error, status } = res;
                    if (status !== 0) {
                        if (status == 403) { //返回403时，重新登录
                            sessionStorage.removeItem('user');
                            this.$router.push('/login');
                        } else {
                            this.$message.error(error);
                        }
                    } else {
                        this.$message.success('增加弹幕成功');
                    }
                });
            },
            barrageTag(){ //加载弹幕标签
                axiosGet('barrageTag', '').then((res) => {
                    let { error, status,data } = res;
                    if (status !== 0) {
                        if (status == 403) { //返回403时，重新登录
                            sessionStorage.removeItem('user');
                            this.$router.push('/login');
                        } else {
                            this.$message.error(error);
                        }
                    } else {
                        this.barrage.tagList = data;
                    }
                });
            },
            handleSelectionChange(val) { //选择弹幕更改时
                //val为对象数组
                this.barrage.multipleBarrageIds = []; //先清空数组
                if (val.length !== 0) {
                    for (var i = 0; i < val.length; i++) {
                        this.barrage.multipleBarrageIds.push(val[i].id);
                    }
                }
            },
            handleEdit(index, row) {
                let para = new FormData();
                para.append("id", row.id);
                para.append("text", row.text);
                axiosPost('barrageEdit', para).then((res) => {
                    let { error, status } = res;
                    if (status !== 0) {
                        if (status == 403) { //返回403时，重新登录
                            sessionStorage.removeItem('user');
                            this.$router.push('/login');
                        }else{
                            this.$message.error(error);
                        }
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
    .tb-edit .el-input {
        display: none
    }
    .tb-edit .current-row .el-input {
        display: block
    }
    .tb-edit .current-row .el-input+span {
        display: none
    }
    .user-avatar {
        width: 100px;
        height: 100px;
        border-radius: 50%;
        margin-top: 10px;
    }
</style>
