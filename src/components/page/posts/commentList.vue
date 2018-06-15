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
                    <el-select v-model="filters.attr" multiple @change="fetchList" placeholder="选择分类" style="width: 200px;">
                        <!-- <el-option label="全部分类" value=""></el-option> -->
                        <el-option v-for="item in attrList" :key="item.id" :label="item.text"
                                   :value="item.id">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="fetchList">查询</el-button>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="showForm()">新增</el-button>
                </el-form-item>
                <el-form-item>
                    <el-button type="info" @click.native="batchVisible = true">批量添加</el-button>
                </el-form-item>
            </el-form>
        </el-col>
        <!--表格-->
        <el-table v-loading="tableLoading" :data="tableList" stripe border :max-height="tableHeight"
                  style="width: 100%;margin-top: 10px;">
            <el-table-column prop="id" label="id" width="100"></el-table-column>
            <el-table-column prop="text" label="评论内容"></el-table-column>
            <el-table-column label="所属分类" prop="attrName">
                <!-- <template scope="props">
                    <template v-for="(item,index) in props.row.attrName">
                        {{ item.text }}{{ index < props.row.attrName.length - 1 ? '、' : '' }}
                    </template>
                </template> -->
            </el-table-column>
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

        <!--新建/编辑评论-->
        <el-dialog :title="formTitle" v-model="formVisible" @close="resetFormData">
            <el-form :model="formData" label-width="80px" :rules="formRules" ref="formData"
                     style="margin-bottom: -20px;">
                <el-form-item label="评论内容" prop="text">
                    <el-input type="textarea" :rows="2" v-model.trim="formData.text" maxlength="128"></el-input>
                </el-form-item>
                <el-form-item label="所属分类" prop="attrIds">
                    <template>
                        <el-select style="width: 50%;" v-model="formData.attrIds" multiple
                                   placeholder="选择评论所属分类">
                            <el-option v-for="item in attrList" :key="item.id" :label="item.text"
                                       :value="item.id">
                            </el-option>
                        </el-select>
                    </template>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button size="small" @click.native="formVisible = false">取消</el-button>
                <el-button size="small" type="primary" @click.native="formSubmit" :loading="formLoading">提交</el-button>
            </div>
        </el-dialog>

        <!--  批量导入评论  -->
        <el-dialog title="批量导入评论" v-model="batchVisible" size="tiny" @close="resetBatch">
            <el-form label-width="80px">
                <el-form-item label="表格文件" style="margin-bottom: -10px;">
                    <input type="file" id="comFile" name="excel">
                </el-form-item>
                <el-form-item label="" style="margin-bottom: -20px;text-align: right;">
                    <a href="../../../../static/导入评论.xlsx" target="_blank" title="">下载示例文件</a>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button size="small" @click.native="batchVisible = false">取消</el-button>
                <el-button size="small" type="primary" @click.native="batchSubmit" :loading="batchLoading">导入</el-button>
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
                filters:{
                    kw: '',
                    attr: []
                },
                total: 0, //表格列表数据总数
                page: 1, //当前页，默认为第一页
                tableHeight: '100%',
                tableLoading: false, //表格的loading符号
                tableList: [], //表格数据
                formTitle: '新增评论',
                formVisible: false,
                formLoading: false,
                formRules: {
                    text: [
                        {required: true, message: '请输入评论内容', trigger: 'blur'},
                        {min: 1, max: 128, message: '长度在 1 到 128 个字符', trigger: 'blur'}
                    ]
                },
                formData: {
                    id: '',
                    text: '',
                    api: 'commentAdd', // 默认调新增接口
                    attrIds: []
                },
                attrList: [],
                batchVisible: false, // 显示、隐藏导入表单弹窗
                batchLoading: false
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
                /*let paras = {
                    offset: 0,
                    size: 10,
                    attrIds: _self.filters.attr
                };*/
                let paras = new FormData();
                paras.append('offset', (_self.page - 1) * 10);
                paras.append('size', 10);
                paras.append('attrIds', _self.filters.attr);
                paras.append('keyWord', _self.filters.kw);
                if (!isNaN(_self.filters.kw)) { 
                    paras.append('id', _self.filters.kw);
                }
                _self.tableLoading = true;
                httpPost('commentList', paras, _self, function (res) {
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
                let _self = this;
                _self.formVisible = true;
                let attrArg = [];
                if (row) {
                    _self.formTitle = '编辑评论';
                    _self.formData = {
                        id: row.id,
                        text: row.text,
                        attrIds: row.attrIds,
                        api: 'commentEdit'
                    };
                }
            },
            formSubmit() { //提交表格
                let _self = this;
                _self.$refs['formData'].validate((valid) => {
                    if (valid) {
                        let paras = new FormData();
                        if (_self.formData.id) {
                            paras.append("id", _self.formData.id);
                        }
                        paras.append("text", _self.formData.text);
                        paras.append("attrIds", _self.formData.attrIds);
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
                    } else {
                        return false;
                    }
                });
            },
            resetFormData() { //关闭表格弹窗，重置表格数据
                let _self = this;
                this.formTitle = '新增评论';
                _self.formData = {
                    id: '',
                    text: '',
                    attrIds: [],
                    api: 'commentAdd'
                };
                _self.$refs['formData'].resetFields();
                _self.formLoading = false;
            },
            fetchAttrList() { // 获取评论属性
                let _self = this;
                let paras = {
                    offset: 0,
                    size: 999999,
                    isListQuery: 0
                };
                httpGet('commentAttrList', paras, _self, function (res) {
                    try {
                        let {data} = res;
                        _self.attrList = data.content;
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            handleDel(row) { //删除评论
                let _self = this;
                _self.$confirm('确认删除该评论吗?', '提示', {
                    type: 'warning'
                }).then(() => {
                    let paras = {
                        id: row.id
                    };
                    httpGet('commentListDel', paras, _self, function (res) {
                        try {
                            _self.$message.success('删除成功');
                            _self.fetchList();
                        } catch (error) {
                            util.jsErrNotify(error);
                        }
                    })
                });
            },
            batchSubmit(){ // 导入评论表格
                let _self = this,
                    file = document.getElementById('comFile').files[0];
                if(file.length == 0){
                    _self.$message.warning('请选择要上传的excel文件');
                }
                let paras = new FormData();
                paras.append("excelFile", file);
                _self.batchLoading = true;
                httpPost('commentExcelAdd', paras, _self, function (res) {
                    _self.batchLoading = false;
                    try {
                        _self.$message.success('导入成功');
                        _self.fetchList();
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                },function(res){
                    _self.batchLoading = false;
                    _self.$message.error(res.data.error);
                })
            },
            resetBatch(){ // 重置input
                let _self = this;
                document.getElementById('comFile').value = '';
                _self.batchLoading = false;
            },
            resetSearch() {
                this.filters.kw = '';
                this.fetchList();
            }
        },
        mounted() {
            this.fetchList();
            this.fetchAttrList();
        }
    }
</script>

<style>
</style>
