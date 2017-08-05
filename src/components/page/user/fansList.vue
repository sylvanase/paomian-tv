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
            <el-table-column prop="createTime" label="被关注时间" min-width="120"></el-table-column>
            <el-table-column prop="sex" label="性别" width="100">
                <template scope="scope">
                    {{ scope.row.sex === 0 ? '男' : '女' }}
                </template>
            </el-table-column>
            <!--<el-table-column prop="age" label="好友关系">
                <template scope="scope">
                    {{ scope.row.sex === 0 ? '男' : '女' }}
                </template>
            </el-table-column>-->
            <!--<el-table-column prop="age" label="年龄"></el-table-column>-->
            <!--<el-table-column prop="fans" label="粉丝">
                <template scope="scope">
                    <el-button v-if="scope.row.fans != 0" size="small" @click="showFan(scope.row)">{{ scope.row.fans
                        }}
                    </el-button>
                    <span v-else>0</span>
                </template>
            </el-table-column>
            <el-table-column prop="fans" label="关注">
                <template scope="scope">
                    <el-button v-if="scope.row.fans != 0" size="small" @click="showFollow(scope.row)">{{ scope.row.fans
                        }}
                    </el-button>
                    <span v-else>0</span>
                </template>
            </el-table-column>
            <el-table-column prop="fans" label="帖子">
                <template scope="scope">
                    <el-button v-if="scope.row.fans != 0" size="small" @click="showVideo(scope.row)">{{ scope.row.fans
                        }}
                    </el-button>
                    <span v-else>0</span>
                </template>
            </el-table-column>-->
            <el-table-column prop="address" label="地址" min-width="200"></el-table-column>
            <el-table-column prop="phone" label="手机" min-width="150"></el-table-column>
            <!--<el-table-column prop="QQ" label="QQ"></el-table-column>
            <el-table-column prop="wechat" label="微信"></el-table-column>
            <el-table-column prop="weibo" label="微博"></el-table-column>-->
            <el-table-column label="操作" width="300" fixed="right">
                <template scope="scope">
                    <el-button type="info" size="small" @click="follow(scope.row)">关注</el-button>
                    <!--<el-button type="danger" size="small" @click="handleFans(scope.row)">移除</el-button>-->
                    <!--<el-button type="warning" size="small" @click="pullBlacklist(scope.row)">黑名单</el-button>-->
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
    </el-dialog>
</template>

<script type="es6">
    import util from '../../../api/util'
    import { axiosGet, axiosDel} from '../../../api/api';
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
            follow(row){ //关注该粉丝
                this.$message.error('功能尚未开发');
            },
            handleFans(row){ //移除粉丝
                let para = {
                    uid: this.userId,
                    followerId: row.id
                };
                axiosDel('userFanDel', para).then((res) => {
                    let { error, status,data } = res;
                    if (status !== 0) {
                        if (status == 403) { //返回403时，重新登录
                            sessionStorage.removeItem('user');
                            this.$router.push('/login');
                        } else {
                            this.$message.error(error);
                        }
                    } else {
                        this.fetchList();
                    }
                });
            },
            pullBlacklist(row){ //拉黑
                this.$message.error('功能尚未开发');
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
