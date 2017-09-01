<template>
    <section>
        <!--顶部工具条-->
        <el-col :span="24" class="toolbar" style="padding-bottom: 0;">
            <el-form :inline="true">
                <el-form-item>
                    <el-button type="primary" @click="showForm('-1')">新增</el-button>
                </el-form-item>
            </el-form>
        </el-col>

        <!--表格-->
        <el-table v-loading="tableLoading" :data="tableList" stripe border style="width: 100%;">
            <el-table-column prop="id" label="id" width="100"></el-table-column>
            <el-table-column prop="name" label="标签名称"></el-table-column>
            <el-table-column prop="createTime" label="创建时间"></el-table-column>
            <el-table-column label="操作" width="150">
                <template scope="scope">
                    <el-button size="small" @click="showForm(scope.$index, scope.row)">编辑</el-button>
                    <el-button type="danger" size="small" @click="handleTableDel(scope.$index, scope.row)">删除
                    </el-button>
                </template>
            </el-table-column>
        </el-table>

        <!--工具条-->
        <el-col :span="24" class="mt-10">
            <el-pagination style="float:right;" @current-change="handleCurrentChange"
                           :page-size="10" :current-page="page"
                           layout="total, prev, pager, next, jumper" :total="total">
            </el-pagination>
        </el-col>

        <!--新建/编辑标签-->
        <el-dialog :title="formTitle" v-model="formVisible">
            <el-form :model="formData" label-width="80px" :rules="formRules" ref="formData" style="margin-bottom: -20px;">
                <el-form-item label="标签名称" prop="name">
                    <el-input v-model.trim="formData.name" auto-complete="off"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button size="small" @click.native="formVisible = false">取消</el-button>
                <el-button size="small" type="primary" @click.native="formSubmit" :loading="formLoading">提交</el-button>
            </div>
        </el-dialog>
    </section>
</template>

<script type="es6">
    import util from '../../../api/util'
    import { tableListApi, tableDelApi, tableEditApi} from '../../../api/api';

    export default {
        data() {
            return {
                api: 'tag',
                total: 0, //表格列表数据总数
                page: 1, //当前页，默认为第一页
                tableLoading: false, //表格的loading符号
                tableList: [], //表格数据
                formTitle: '',
                formVisible: false,//新增界面是否显示
                formLoading: false,
                formRules: {
                    name: [
                        {required: true, message: '请输入标签名称', trigger: 'blur'},
                        {min: 1, max: 64, message: '长度在 1 到 64 个字符', trigger: 'blur'}
                    ]
                },
                //表单数据
                formData: {
                    id: '',
                    name: ''
                }
            }
        },
        methods: {
            handleCurrentChange(val) { //翻页
                this.page = val;
                this.fetchList();
            },
            //获取列表
            fetchList() {
                let para = {
                    offset: 0,
                    size: 10,
                    id: '',
                    kw: ''
                };
                para.offset = (this.page - 1) * para.size;
                this.tableLoading = true;
                tableListApi(this.api, para).then((res) => {
                    let { error, status,data } = res;
                    if (status !== 0) {
                        if (status == 403) { //返回403时，重新登录
                            sessionStorage.removeItem('user');
                            this.$router.push('/login');
                        }else{
                            this.$message.error(error);
                        }
                    } else {
                        this.total = data.totalElements;
                        this.tableList = data.content.map(function (item) {
                            item.createTime = util.timestampFormat(item.createTime);
                            return item;
                        });
                        this.tableLoading = false;
                    }
                });
            },
            showForm (index, row){ //显示表单
                this.formVisible = true;
                if (index == -1) { //索引为-1时，新增操作
                    this.formTitle = '新增标签';
                    this.formData = {
                        id: '',
                        name: ''
                    };
                } else {
                    this.formTitle = '编辑标签';
                    this.formData = Object.assign({}, row);
                }
            },
            formSubmit(){ //提交表格
                this.$refs.formData.validate((valid) => {
                    if (valid) {
                        this.formLoading = true;
                        let para = new FormData();
                        para.append("id", this.formData.id);
                        para.append("name", this.formData.name);
                        tableEditApi(this.api, para).then((res) => {
                            this.formLoading = false;
                            let { error, status } = res;
                            if (status !== 0) {
                                if (status == 403) { //返回403时，重新登录
                                    sessionStorage.removeItem('user');
                                    this.$router.push('/login');
                                } else {
                                    this.$message.error(error);
                                }
                            } else {
                                this.$message.success('提交成功');
                                this.$refs['formData'].resetFields();
                                this.formVisible = false;
                                this.fetchList();
                            }
                        });
                    }
                });
            },
            //删除表格数据
            handleTableDel: function (index, row) {
                this.$confirm('确认删除该记录吗?', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.tableLoading = true;
                    let para = {id: row.id};
                    tableDelApi(this.api, para).then((res) => {
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

<style scoped>

</style>
