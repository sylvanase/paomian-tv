<template>
    <el-dialog title="用户粉丝列表" :value="value" size="large" v-model="visible">
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
            <el-table-column prop="sex" label="性别" width="100">
                <template scope="scope">
                    {{ scope.row.sex === 0 ? '男' : '女' }}
                </template>
            </el-table-column>
            <el-table-column prop="age" label="年龄"></el-table-column>
            <el-table-column prop="createTime" label="被关注时间" min-width="120"></el-table-column>
            <el-table-column label="好友关系" width="100">
                <template scope="scope">
                    {{ scope.row.friendsCare === 0 ? '单项关注' : '互相关注' }}
                </template>
            </el-table-column>
            <el-table-column prop="fansCount" label="粉丝"></el-table-column>
            <el-table-column prop="carsCount" label="关注"></el-table-column>
            <el-table-column prop="postCount" label="帖子"></el-table-column>
            <el-table-column prop="address" label="地址" min-width="200"></el-table-column>
            <el-table-column prop="phone" label="手机" min-width="150"></el-table-column>
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
            <el-table-column label="操作" width="200" fixed="right">
                <template scope="scope">
                    <el-button size="small" @click="userDetail(scope.row)">查看</el-button>
                    <el-button :type="scope.row.userStatus == 0 ? 'danger' : 'warning'" size="small"
                               @click="userDel(scope.row)">
                        {{ scope.row.userStatus === 0 ? '删除' : '恢复' }}
                    </el-button>
                    <el-button :type="scope.row.userCare == 1 ? 'danger' : 'info'" size="small"
                               @click="careUser(scope.row)">
                        {{ scope.row.userCare === 1 ? '取关' : '关注' }}
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
        <!--分页-->
        <el-col :span="24" class="mt-10" style="margin-bottom: 20px;">
            <el-pagination style="float:right;" @current-change="handleCurrentChange"
                           :page-size="10" :current-page="page"
                           layout="total, prev, pager, next, jumper" :total="total">
            </el-pagination>
        </el-col>
    </el-dialog>
</template>

<script type="es6">
    import util from '../../../api/util'
    import { axiosGet, axiosDel, axiosPost} from '../../../api/api';
    export default {
        name: 'vFan',
        props: ['value', 'userId'],
        data() {
            return {
                visible: false, //默认隐藏
                total: 0, //表格列表数据总数
                page: 1, //当前页，默认为第一页
                tableLoading: true,
                tableList: []
            }
        },
        computed: {
            detail(){
                if(!this.value){ //不显示的时候不请求详细
                    return;
                }
                this.tableLoading = true;
                this.tableList = [];
                if (this.userId) {
                    this.fetchList();
                }
            }
        },
        methods: {
            change() {
                this.visible = false;
            },
            fetchList() {    //获取列表
                let para = {
                    offset: 0,
                    size: 10,
                    uid: this.userId
                };
                para.offset = (this.page - 1) * para.size;
                this.tableLoading = true;
                axiosGet('userFansList', para).then((res) => {
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
            handleCurrentChange(val) { //翻页
                this.page = val;
                this.fetchList();
            },
            //软删除用户
            userDel: function (row) {
                if (row.userStatus == 1) { //原来是删除状态，现执行恢复操作
                    this.tableLoading = true;
                    let paras = new FormData();
                    paras.append("uid", row.id);
                    paras.append("status", 0);
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
                            this.$message.success('恢复成功');
                            this.fetchList();
                        }
                    });
                } else { //删除用户
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
            //运营关注用户
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
            userDetail(row){ //查看用户详情
                this.$emit('preview', row);
            }
        },
        watch: {
            detail(val){ //监测详情变化
                console.log(val);
            },
            value(val) {
                this.visible = val;
            },
            visible(val) {
                this.$emit('input', val);
            }
        },
        mounted() {
            if (this.value) {
                this.visible = true;
            }
        }
    }

</script>
