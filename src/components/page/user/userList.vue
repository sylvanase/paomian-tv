<template>
    <section>
        <!--顶部工具条-->
        <el-col :span="24" class="toolbar" style="padding-bottom: 0;">
            <el-form :inline="true" :model="filters">
                <el-form-item>
                    <el-input v-model="filters.kw" placeholder="ID/昵称"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-select v-model="filters.sex" @change="fetchList" placeholder="请选择" style="width: 150px;">
                        <el-option label="全部性别" value=""></el-option>
                        <el-option label="男" value="0"></el-option>
                        <el-option label="女" value="1"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-input type="number" v-model="filters.phone" placeholder="手机号码"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-select v-model="filters.os" @change="fetchList" placeholder="请选择" style="width: 150px;">
                        <el-option label="全部系统" value=""></el-option>
                        <el-option label="android" value="0"></el-option>
                        <el-option label="iOS" value="1"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="fetchList">查询</el-button>
                </el-form-item>
            </el-form>
        </el-col>

        <!--表格-->
        <el-table v-loading="tableLoading" :data="tableList" stripe border style="width: 100%;">
            <el-table-column prop="id" label="uid" min-width="100" fixed></el-table-column>
            <el-table-column prop="avatarUrl" label="头像" width="136">
                <template scope="scope">
                    <img v-if="scope.row.avatarUrl !== ''" class="user-avatar" :src="scope.row.avatarUrl" alt="用户头像"/>
                    <img v-else class="user-avatar" src="../../../../static/img/TV.png" alt="用户头像"/>
                </template>
            </el-table-column>
            <el-table-column prop="username" min-width="150" label="昵称"></el-table-column>
            <el-table-column prop="createTime" label="注册时间" min-width="120"></el-table-column>
            <el-table-column prop="sex" label="性别" width="80">
                <template scope="scope">
                    {{ scope.row.sex === 0 ? '男' : '女' }}
                </template>
            </el-table-column>
            <!--<el-table-column prop="age" label="年龄"></el-table-column>-->
            <el-table-column prop="fansCount" label="粉丝">
                <template scope="scope">
                    <el-button v-if="scope.row.fansCount" size="small" @click="showFan(scope.row)">{{
                        scope.row.fansCount
                        }}
                    </el-button>
                    <span v-else>0</span>
                </template>
            </el-table-column>
            <el-table-column prop="carsCount" label="关注">
                <template scope="scope">
                    <el-button v-if="scope.row.carsCount" size="small" @click="showFollow(scope.row)">{{
                        scope.row.carsCount
                        }}
                    </el-button>
                    <span v-else>0</span>
                </template>
            </el-table-column>
            <el-table-column prop="postCount" label="帖子">
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
            <el-table-column prop="phone" label="手机" min-width="150"></el-table-column>
            <!--<el-table-column prop="QQ" label="QQ"></el-table-column>
            <el-table-column prop="wechat" label="微信"></el-table-column>
            <el-table-column prop="weibo" label="微博"></el-table-column>-->
            <el-table-column prop="os" label="设备" width="100">
                <template scope="scope">
                    {{ scope.row.registerDevice === 0 ? 'android' : 'ios' }}
                </template>
            </el-table-column>
            <!--<el-table-column prop="level" label="类型"></el-table-column>-->
            <el-table-column prop="userStatus" label="用户状态" width="100">
                <template scope="scope">
                    <el-tag :type="scope.row.userStatus == 0 ? 'success' : 'danger'"
                            close-transition>{{ scope.row.userStatus === 0 ? '正常' : '已删除' }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column label="操作" width="300" fixed="right">
                <template scope="scope">
                    <el-button size="small" @click="showForm(scope.row)">编辑</el-button>
                    <el-button v-if="scope.row.userStatus == 0" type="danger" size="small" @click="userDel(scope.row)">
                        删除
                    </el-button>
                    <!--<el-button type="warning" size="small" @click="pullBlacklist(scope.row)">黑名单</el-button>-->
                    <!--<el-button type="info" size="small" @click="followUser(scope.row)">关注</el-button>-->
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

        <!--用户详情-->
        <v-detail :userData="userData" v-model="isShowForm" v-on:refresh="fetchList"></v-detail>

        <!--用户粉丝-->
        <v-fan :userId="userId" v-model="isShowFan"></v-fan>

        <!--用户关注-->
        <v-follow :userId="userId" v-model="isShowFollow"></v-follow>

        <!--用户发帖-->
        <v-video :userId="userId" v-model="isShowVideo"></v-video>

        <!--用户喜欢-->
        <!--<v-fan :userId="userId" v-model="isShowLike"></v-fan>-->

    </section>
</template>

<script type="es6">
    import util from '../../../api/util'
    import { axiosGet, axiosDel, axiosPost} from '../../../api/api';
    import vDetail from './userDetail.vue'
    import vFan from './fansList.vue'
    import vFollow from './followList.vue'
    import vVideo from './videoList.vue'
    import vLike from './likeList.vue'

    export default {
        components: {
            vDetail,
            vFan,
            vFollow,
            vVideo,
            vLike
        },
        data() {
            return {
                filters: {
                    kw: '',
                    sex: '',
                    phone: '',
                    os: ''
                },
                total: 0, //表格列表数据总数
                page: 1, //当前页，默认为第一页
                tableLoading: false, //表格的loading符号
                tableList: [], //表格数据
                isShowForm: false,
                userData: {},
                userId: '', //用户id
                isShowFan: false, //显示、隐藏粉丝列表
                isShowFollow: false, //显示、隐藏关注列表
                isShowVideo: false, //显示、隐藏帖子列表
                isShowLike: false //显示、隐藏喜欢列表
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
                    username: '',
                    sex: this.filters.sex,
                    phone: this.filters.phone,
                    registerDevice: this.filters.os
                };
                if (isNaN(this.filters.kw)) { //输入不为数字，值传入kw
                    para.username = this.filters.kw;
                } else {
                    para.id = this.filters.kw;
                }
                para.offset = (this.page - 1) * para.size;
                this.tableLoading = true;
                axiosGet('userList', para).then((res) => {
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
            showFan (row){ //显示用户粉丝列表
                this.isShowFan = true;
                this.userId = row.id;
            },
            showFollow (row){ //显示用户关注列表
                this.isShowFollow = true;
                this.userId = row.id;
            },
            showVideo (row){ //显示用户帖子列表
                this.isShowVideo = true;
                this.userId = row.id;
                console.log(row.id);
            },
            showLike (row){ //显示用户喜欢的帖子列表
                this.isShowLike = true;
                this.userId = row.id;
            },
            //软删除用户
            userDel: function (row) {
                this.$confirm('确认删除该用户吗?', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.tableLoading = true;
                    let paras = new FormData();
                    paras.append("uid", row.id);
                    paras.append("status", 1);
                    axiosPost('userStatus', paras).then((res) => {
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
