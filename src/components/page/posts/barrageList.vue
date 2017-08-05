<template>
    <section>
        <!--顶部工具条-->
        <el-col :span="24" class="toolbar" style="padding-bottom: 0;">
            <el-form :inline="true" :model="filters">
                <el-form-item>
                    <el-button type="primary" @click="showForm('-1')">新增</el-button>
                </el-form-item>
            </el-form>
        </el-col>

        <!--表格-->
        <el-table v-loading="tableLoading" :data="tableList" stripe border style="width: 100%;">
            <el-table-column prop="id" label="id" min-width="80"></el-table-column>
            <el-table-column prop="text" label="弹幕内容" min-width="150"></el-table-column>
            <el-table-column label="所属标签">
                <template scope="props">
                    <template v-for="(item,index) in props.row.tagPoList">
                        {{ item.name }}{{ index < props.row.tagPoList.length - 1 ? '、' : '' }}
                    </template>
                </template>
            </el-table-column>

            <el-table-column label="操作" width="100" >
                <template scope="scope">
                    <!--<el-button size="small" @click="showForm(scope.row)">编辑</el-button>
                    <el-button v-if="scope.row.isDel == 0" type="danger" size="small" @click="topicDel(scope.row)">删除
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
        <!--<v-detail :postsData="postsData" v-model="isShowForm" v-on:refresh="fetchList"></v-detail>-->


    </section>
</template>

<script type="es6">
    import util from '../../../api/util'
    import { axiosGet, axiosDel, axiosPost} from '../../../api/api';
    //import vDetail from './postsDetail.vue'

    export default {
        components: {
            //vDetail
        },
        data() {
            return {
                total: 0, //表格列表数据总数
                page: 1, //当前页，默认为第一页
                tableLoading: false, //表格的loading符号
                tableList: [], //表格数据
                isShowForm: false, //显示、隐藏编辑页
                postsData: {},
                postsId: '' //帖子id
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
                        this.total = data.totalElements;
                        this.tableList = data.content;
                        this.tableLoading = false;
                    }
                });
            },
            showForm (row){ //显示详情表单
                this.isShowForm = true;
                this.postsData = row;
            }
        },
        mounted() {
            this.fetchList();
        }
    }
</script>

<style>
</style>
