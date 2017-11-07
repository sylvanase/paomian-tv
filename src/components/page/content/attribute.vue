<template>
    <section>
        <!--顶部工具条-->
        <el-col :span="24" class="toolbar" style="padding-bottom: 0;">
            <el-form :inline="true" :model="filters">
                <el-form-item>
                    <el-select v-model="filters.type" @change="fetchList" placeholder="请选择" style="width: 150px;">
                        <el-option label="音乐属性" value="0"></el-option>
                        <el-option label="片段属性" value="1"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-select v-model="filters.status" @change="fetchList" placeholder="请选择" style="width: 100px;">
                        <el-option label="全部" value=""></el-option>
                        <el-option label="在线" value="1"></el-option>
                        <el-option label="离线" value="0"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="showForm('-1')">新增</el-button>
                </el-form-item>
            </el-form>
        </el-col>

        <!--表格-->
        <el-table v-loading="tableLoading" :data="tableList" stripe border style="width: 100%;">
            <el-table-column prop="id" label="id" width="100"></el-table-column>
            <el-table-column prop="name" label="属性名称"></el-table-column>
            <el-table-column prop="countNum" label="数量"></el-table-column>
            <el-table-column prop="status" label="状态" width="80">
                <template scope="scope">
                    <el-tag :type="scope.row.status == 1 ? 'success' : 'danger'"
                            close-transition>{{ scope.row.status == 1 ? '在线' : '离线' }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column label="操作" width="380">
                <template scope="scope">
                    <el-button size="small" @click="showForm(scope.$index, scope.row)">编辑</el-button>
                    <el-button type="danger" size="small" @click="handleTableDel(scope.$index, scope.row)">删除
                    </el-button>
                    <el-button :type="scope.row.status == 1 ? 'danger' : 'success'" size="small"
                               @click="handleTableLine(scope.$index, scope.row)">
                        {{ scope.row.status == 1 ? '下线' : '上线' }}
                    </el-button>
                    <template v-if="scope.row.status == 1">
                        <el-button type="success" size="small" @click="handleTableShift(scope.row,'up')">
                            上移
                        </el-button>
                        <el-button type="danger" size="small" @click="handleTableShift(scope.row,'down')">
                            下移
                        </el-button>
                        <el-button type="warning" size="small" @click="handleTableShift(scope.row,'top')">
                            置顶
                        </el-button>
                    </template>
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
                <el-form-item label="类型" prop="type" required>
                    <el-select v-model="formData.type" :disabled="formSelect" placeholder="请选择类型">
                        <el-option label="音乐属性" value="0"></el-option>
                        <el-option label="片段属性" value="1"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="属性名称" prop="name">
                    <el-input v-model.trim="formData.name" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="属性图标" prop="iconId" required style="margin-bottom: -20px;">
                    <div class="avatar-uploader" style="width: 80%;" @click="chooseFile">
                        <div class="el-upload el-upload--text">
                            <i v-show="avatarLoading" class="el-icon-loading avatar-uploader-icon"></i>
                            <i v-show="!formData.iconUrl && !avatarLoading"
                               class="el-icon-plus avatar-uploader-icon"></i>
                            <img v-show="formData.iconUrl && !avatarLoading" :src="formData.iconUrl" class="avatar">
                            <input type="file" id="cover" class="el-upload__input" @change="fileChange">
                        </div>
                    </div>
                    <el-button type="danger" size="small" @click="resetCoverImg">删除</el-button>
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
    import { httpGet, httpDel, httpPost } from '../../../api/api';

    export default {
        data() {
            return {
                filters: { //列表筛选条件
                    type: '0',
                    status: ''
                },
                total: 0, //表格列表数据总数
                page: 1, //当前页，默认为第一页
                tableLoading: false, //表格的loading符号
                tableList: [], //表格数据
                formTitle: '',
                formVisible: false,//新增界面是否显示
                formLoading: false,
                formSelect: false,
                formRules: {
                    name: [
                        {required: true, message: '请输入属性名称', trigger: 'blur'},
                        {min: 1, max: 32, message: '长度在 1 到 32 个字符', trigger: 'blur'}
                    ],
                    attributeTypeEnum: [
                        {required: true, message: '请选择属性', trigger: 'change'}
                    ]
                },
                //新增界面数据
                formData: {
                    id: '',
                    name: '',
                    type: '',
                    iconUrl: '',
                    iconId: ''
                },
                avatarLoading: false
            }
        },
        methods: {
            chooseFile(){ //触发选择文件
                let fileDom = document.getElementById('cover');
                fileDom.click();
            },
            fileChange(){ // 文件变更后操作
                let fileDom = document.getElementById('cover');
                let _self = this;
                if (fileDom.value) { // 如果文件不为空，进行校验和上传操作
                    const _verify = util.imgFileCheck(fileDom);
                    if (_verify) { //文件校验通过，进行上传操作
                        let paras = new FormData();
                        paras.append("imageFile", fileDom.files[0]);
                        _self.avatarLoading = true;
                        httpPost('imgUpload', paras, _self, function (res) {
                            _self.avatarLoading = false;
                            try {
                                let { error, status,data } = res;
                                _self.formData.iconId = data.id;
                                _self.formData.iconUrl = URL.createObjectURL(fileDom.files[0]);
                            } catch (error) {
                                util.jsErrNotify(error);
                            }
                        },function (res) { // 上传失败回调
                            _self.avatarLoading = false;
                            fileDom.value = '';
                            _self.$message.error('上传失败，请重新选择文件');
                        })
                    }
                }
            },
            resetCoverImg(){ //删除封面
                this.formData.iconUrl = '';
                this.formData.iconId = '';
                document.getElementById('cover').value = '';
            },
            handleCurrentChange(val) { //翻页
                this.page = val;
                this.fetchList();
            },
            //获取列表
            fetchList() {
                let _self = this;
                let paras = {
                    offset: 0,
                    size: 10,
                    type: _self.filters.type,
                    status: _self.filters.status
                };
                paras.offset = (_self.page - 1) * paras.size;
                _self.tableLoading = true;
                httpGet('contentAttrList', paras, _self, function (res) {
                    _self.tableLoading = false;
                    try {
                        let { error, status,data } = res;
                        _self.total = data.totalElements;
                        _self.tableList = data.content;
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            showForm (index, row){ //显示表单
                this.formVisible = true;
                if (index == -1) { //索引为-1时，新增操作
                    this.formTitle = '新增属性';
                    this.formSelect = false;
                } else {
                    this.formTitle = '编辑属性';
                    this.formSelect = true;
                    this.formData = {
                        id: row.id,
                        name: row.name,
                        type: row.attributeTypeEnum + '',
                        status: row.status,
                        iconUrl: row.iconUrl,
                        iconId: row.iconId
                    };
                }
            },
            formSubmit(){ //提交表格
                this.$refs.formData.validate((valid) => {
                    if (valid) {
                        let _self = this;
                        let paras = new FormData();
                        paras.append("id", _self.formData.id);
                        paras.append("name", _self.formData.name);
                        paras.append("type", _self.formData.type);
                        paras.append("iconId", _self.formData.iconId);
                        _self.formLoading = true;
                        if (_self.formData.iconId == '') {
                            _self.$message.warning('请选择属性图标');
                            return false;
                        }
                        httpPost('contentAttrEdit', paras, _self, function (res) {
                            _self.formLoading = false;
                            try {
                                let { error, status,data } = res;
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
            //删除表格数据
            handleTableDel: function (index, row) {
                this.$confirm('确认删除该记录吗?', '提示', {
                    type: 'warning'
                }).then(() => {
                    let _self = this;
                    let paras = {id: row.id, type: row.attributeTypeEnum};
                    _self.tableLoading = true;
                    httpDel('contentAttrDel', paras, _self, function (res) {
                        _self.tableLoading = false;
                        try {
                            let { error, status,data } = res;
                            _self.$message.success('删除成功');
                            _self.fetchList();
                        } catch (error) {
                            util.jsErrNotify(error);
                        }
                    })
                });
            },
            handleTableLine(index, row){
                let _self = this;
                let paras = new FormData();
                paras.append("id", row.id);
                paras.append("status", Number(!row.status));
                paras.append("type", row.attributeTypeEnum);
                httpPost('contentAttrStatus', paras, _self, function (res) {
                    try {
                        _self.$message.success('操作成功');
                        _self.fetchList();
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            handleTableShift(row, operate){
                let _self = this;
                let paras = new FormData();
                paras.append("id", row.id);
                paras.append("operate", operate);
                paras.append("type", row.attributeTypeEnum);
                paras.append("currRank", row.priority);
                httpPost('contentAttrShift', paras, _self, function (res) {
                    try {
                        _self.$message.success('操作成功');
                        _self.fetchList();
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            resetFormData(){ //关闭表格弹窗，重置表格数据
                let _self = this;
                _self.formData = {
                    id: '',
                    name: '',
                    type: '0',
                    iconUrl: '',
                    iconId: ''
                };
                document.getElementById('cover').value = '';
            }
        },
        mounted() {
            this.fetchList();
        }
    }

</script>

<style>

</style>
