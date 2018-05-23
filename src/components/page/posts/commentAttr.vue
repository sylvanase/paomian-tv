<template>
    <section>
        <!--顶部工具条-->
        <el-col :span="24" class="toolbar">
            <el-form :inline="true" :model="filters">
                <el-form-item>
                    <el-input v-model="filters.kw" placeholder="ID/关键字" icon="circle-close"
                              :on-icon-click="resetSearch" @keyup.enter.native="fetchList"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="showForm()">新增</el-button>
                </el-form-item>
            </el-form>
        </el-col>
        <!--表格-->
        <el-table v-loading="tableLoading" :data="tableList" stripe border :max-height="tableHeight"
                  style="width: 100%;margin-top: 10px;">
            <el-table-column prop="id" label="id"></el-table-column>
            <el-table-column prop="text" label="分类名称"></el-table-column>
            <el-table-column prop="count" label="数量"></el-table-column>
            <el-table-column label="操作" width="180">
                <template scope="scope">
                    <el-button size="small" @click="showForm(scope.row)">编辑</el-button>
                    <el-button type="danger" size="small" @click="handleDel(scope.row)">删除</el-button>
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

        <!--新建/编辑-->
        <el-dialog :title="formTitle" v-model="formVisible" @close="resetFormData">
            <el-form :model="formData" label-width="80px" :rules="formRules" ref="formData"
                     style="margin-bottom: -20px;">
                <el-form-item label="分类名称" prop="name">
                    <el-input v-model.trim="formData.name"></el-input>
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
    import {httpGet, httpPost} from '../../../api/api';

    export default {
        data() {
            return {
                filters: {
                    kw: '',
                    id: ''
                },
                total: 0, //表格列表数据总数
                page: 1, //当前页，默认为第一页
                tableHeight: '100%',
                tableLoading: false, //表格的loading符号
                tableList: [], //表格数据
                formTitle: '新增评论分类',
                formVisible: false,
                formLoading: false,
                formRules: {
                    name: [
                        {required: true, message: '请输入评论分类名称', trigger: 'blur'},
                        {min: 1, max: 32, message: '长度在 1 到 32 个字符', trigger: 'blur'}
                    ]
                },
                formData: {
                    id: '',
                    name: '',
                    api: 'commentAttrAdd' // 默认新增接口
                }
            }
        },
        methods: {
            handleCurrentChange(val) { //翻页
                this.page = val;
                this.fetchList();
            },
            fetchList() {    //获取列表
                let _self = this;
                _self.tableHeight = document.getElementById('container').clientHeight - 77 - 42 - 15;
                let paras = {
                    offset: 0,
                    size: 10,
                    keyWord: '',
                    id: ''
                };
                if (isNaN(_self.filters.kw)) { //输入不为数字，值传入kw
                    paras.keyWord = _self.filters.kw;
                } else {
                    paras.id = _self.filters.kw;
                }
                paras.offset = (_self.page - 1) * paras.size;
                _self.tableLoading = true;
                httpGet('commentAttrList', paras, _self, function (res) {
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
            resetSearch() {
                this.filters.kw = '';
                this.fetchList();
            },
            showForm(row) { //显示表单
                this.formVisible = true;
                if (row) {
                    this.formTitle = '编辑评论分类';
                    this.formData = {
                        id: row.id,
                        name: row.text,
                        api: 'commentAttrEdit'
                    };
                }
            },
            resetFormData() { //关闭表格弹窗，重置表格数据
                let _self = this;
                _self.formData = {
                    id: '',
                    name: '',
                    api: 'commentAttrAdd'
                };
                _self.formTitle = '新增评论分类';
                _self.$refs['formData'].resetFields();
                _self.formLoading = false;
            },
            formSubmit() { //提交表格
                let _self = this;
                _self.$refs['formData'].validate((valid) => {
                    if (valid) {
                        let paras = {
                            text: _self.formData.name
                        };
                        if (_self.formData.id) { // 编辑状态，需要传递id
                            paras.id = _self.formData.id;
                        }
                        _self.formLoading = true;
                        httpGet(_self.formData.api, paras, _self, function (res) {
                            _self.formLoading = false;
                            try {
                                let {error, status, data} = res;
                                _self.$message.success('提交成功');
                                _self.$refs['formData'].resetFields();
                                _self.formVisible = false;
                                _self.fetchList();
                            } catch (error) {
                                util.jsErrNotify(error);
                            }
                        })
                    } else {
                        return false;
                    }
                });

            },
            handleDel(row) { //删除评论属性
                let _self = this;
                _self.$confirm('确认删除该评论分类吗?', '提示', {
                    type: 'warning'
                }).then(() => {
                    let paras = {
                        id: row.id
                    };
                    httpGet('commentAttrDel', paras, _self, function (res) {
                        try {
                            _self.$message.success('删除成功');
                            _self.fetchList();
                        } catch (error) {
                            util.jsErrNotify(error);
                        }
                    })
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
