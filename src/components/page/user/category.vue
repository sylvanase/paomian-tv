<template>
    <section>
        <!--顶部工具条-->
        <el-col :span="24" class="toolbar" style="padding-bottom: 0;">
            <el-form :inline="true" :model="filters">
                <el-form-item>
                    <el-button type="primary" @click="showForm()">新增</el-button>
                </el-form-item>
            </el-form>
        </el-col>

        <!--表格-->
        <el-table v-loading="tableLoading" :data="tableList" stripe border :max-height="tableHeight"
                  style="width: 100%;">
            <el-table-column prop="id" label="id" width="100"></el-table-column>
            <el-table-column prop="name" label="分类名称"></el-table-column>
            <el-table-column prop="countNum" label="数量"></el-table-column>
            <el-table-column label="操作" width="250">
                <template scope="scope">
                    <el-button size="small" @click="showForm(scope.row)">编辑</el-button>
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

        <!--新建/编辑-->
        <el-dialog :title="formTitle" v-model="formVisible" @close="resetFormData">
            <el-form :model="formData" label-width="80px" :rules="formRules" ref="formData">
                <el-form-item label="分类名称" prop="text" style="margin-bottom: -20px;">
                    <el-input v-model.trim="formData.text" auto-complete="off"></el-input>
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
    import {httpGet, httpDel, httpPost} from '../../../api/api';

    export default {
        data() {
            return {
                filters: { //列表筛选条件
                    type: '0'
                },
                total: 0, //表格列表数据总数
                page: 1, //当前页，默认为第一页
                tableHeight: '100%',
                tableLoading: false, //表格的loading符号
                tableList: [], //表格数据
                formTitle: '新增用户分类',
                formVisible: false,//新增界面是否显示
                formLoading: false,
                formSelect: false,
                formRules: {
                    text: [
                        {required: true, message: '请输入分类名称', trigger: 'blur'},
                        {min: 1, max: 32, message: '长度在 1 到 32 个字符', trigger: 'blur'}
                    ]
                },
                //新增界面数据
                formData: {
                    id: '',
                    text: '',
                    api: 'userCatAdd' // 默认走编辑接口
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
                let _self = this;
                _self.tableHeight = document.getElementById('container').clientHeight - 77 - 42 - 15;
                let paras = {
                    offset: 0,
                    size: 10
                };
                paras.offset = (_self.page - 1) * paras.size;
                _self.tableLoading = true;
                httpGet('userCategory', paras, _self, function (res) {
                    _self.tableLoading = false;
                    try {
                        let {error, status, data} = res;
                        _self.total = data.totalElements;
                        _self.tableList = data.content;
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            showForm(row) { //显示表单
                this.formVisible = true;
                self.$message.warning('等待接口');
                return;
                if (row) {
                    this.formTitle = '编辑用户分类';
                    this.formSelect = true;
                    this.formData = {
                        id: row.id,
                        text: row.text,
                        api: 'userCatEdit'
                    };
                }
            },
            formSubmit() { //提交表格
                let _self = this;
                _self.$refs.formData.validate((valid) => {
                    if (valid) {
                        let paras = {
                            text: _self.formData.text
                        };
                        if (_self.formData.id) { // 编辑状态，需要传递id
                            paras.id = _self.formData.id;
                        }
                        _self.formLoading = true;
                        httpPost(_self.formData.api, paras, _self, function (res) {
                            _self.formLoading = false;
                            try {
                                _self.$message.success('提交成功');
                                _self.$refs['formData'].resetFields();
                                _self.formVisible = false;
                                _self.fetchList();
                            } catch (error) {
                                util.jsErrNotify(error);
                            }
                        })
                    }
                });
            },
            resetFormData() { // 重置表单数据、验证等
                let _self = this;
                _self.formLoading = false;
                _self.formTitle = '新增用户分类';
                _self.formData = {
                    id: '',
                    text: '',
                    api: 'userCatAdd'
                };
                _self.formSelect = false;
                _self.$refs['formData'].resetFields();
            },
            //删除表格数据
            handleTableDel: function (index, row) {
                let _self = this;
                self.$message.warning('等待接口');
                return;
                let paras = {id: row.id};
                _self.tableLoading = true;
                httpDel('userCatDel', paras, _self, function (res) {
                    _self.tableLoading = false;
                    try {
                        let {error, status, data} = res;
                        _self.$message.success('删除成功');
                        _self.fetchList();
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            }
        },
        mounted() {
            this.fetchList();
        }
    }

</script>
