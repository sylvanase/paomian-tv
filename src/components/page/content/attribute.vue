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
            <el-table-column label="操作" width="250">
                <template scope="scope">
                    <el-button size="small" @click="showForm(scope.$index, scope.row)">编辑</el-button>
                    <el-button type="danger" size="small" @click="handleTableDel(scope.$index, scope.row)">删除
                    </el-button>
                    <el-button :type="scope.row.status == 1 ? 'danger' : 'success'" size="small"
                               @click="handleTableLine(scope.$index, scope.row)">
                        {{ scope.row.status == 1 ? '下线' : '上线' }}
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
        <el-dialog :title="formTitle" v-model="formVisible">
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
                    <el-upload style="width: 80%;" :disabled="avatarDisabled" class="avatar-uploader" ref="upload"
                               action="" :show-file-list="false" :on-change="avatarChange" :auto-upload="false"
                               :before-upload="beforeAvatarUpload">
                        <img v-if="formData.iconUrl" v-model="formData.iconId" :src="formData.iconUrl"
                             class="avatar">
                        <i v-else class="el-icon-plus avatar-uploader-icon"></i>
                    </el-upload>
                    <el-button :loading="avatarLoading" class="mb-10" type="primary" size="small" @click="submitUpload">
                        上传
                    </el-button>
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
    import { axiosGet, axiosDel, axiosPost} from '../../../api/api';

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
                avatarLoading: false,
                avatarDisabled: false
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
                    type: this.filters.type,
                    status: this.filters.status
                };
                para.offset = (this.page - 1) * para.size;
                this.tableLoading = true;
                axiosGet('contentAttrList', para).then((res) => {
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
            showForm (index, row){ //显示表单
                this.formVisible = true;
                if (index == -1) { //索引为-1时，新增操作
                    this.formTitle = '新增属性';
                    this.formData = {
                        id: '',
                        name: '',
                        type: '0',
                        iconUrl: '',
                        iconId: ''
                    };
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
                        this.formLoading = true;
                        let para = new FormData();
                        para.append("id", this.formData.id);
                        para.append("name", this.formData.name);
                        para.append("type", this.formData.type);
                        para.append("iconId", this.formData.iconId);
                        axiosPost('contentAttrEdit', para).then((res) => {
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
                    let para = {id: row.id, type: row.attributeTypeEnum};
                    axiosDel('contentAttrDel', para).then((res) => {
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
            },
            handleTableLine(index, row){
                let para = new FormData();
                para.append("id", row.id);
                para.append("status", Number(!row.status));
                para.append("type", row.attributeTypeEnum);
                axiosPost('contentAttrStatus', para).then((res) => {
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
             * 封面选择相关操作
             * */
            avatarChange(file){ //更改图片时,重置预览文件路径
                this.formData.iconUrl = file.url;
            },
            resetCoverImg(){ //删除封面
                this.formData.iconUrl = '';
                this.formData.iconId = '';
            },
            beforeAvatarUpload(file) { //上传前校验
                const isJPG = file.type === 'image/jpeg';
                const isLt2M = file.size / 1024 / 1024 <= 10;

                if (!isJPG) {
                    this.$message.error('封面文件必须是图片类型!');
                }
                if (!isLt2M) {
                    this.$message.error('上传图片大小不能超过 10MB!');
                }
                return isJPG && isLt2M;
            },
            submitUpload() { //上传图片
                let file = this.formData.iconUrl;
                if (!file) { //file为空，提示并返回
                    this.$message.error('请选择文件');
                    return;
                }
                var imgFile = document.getElementsByName('file')[0].files[0];
                let para = new FormData();
                para.append("imageFile", imgFile);
                axiosPost('imgUpload',para).then((res) => {
                    this.avatarDisabled = true;
                    this.avatarLoading = true;
                    let { error, status, data } = res;
                    if (status !== 0) {
                        if (status == 403) { //返回403时，重新登录
                            sessionStorage.removeItem('user');
                            this.$router.push('/login');
                        }else{
                            this.$message.error(error);
                        }
                    } else {
                        //上传图片成功回调
                        this.handleAvatarSuccess(data);
                    }
                });
            },
            handleAvatarSuccess(res) { //上传成功后操作
                this.$message.success('上传图片成功');
                this.avatarDisabled = false;
                this.avatarLoading = false;
                this.formData.iconId = res.id;
            }
        },
        mounted() {
            this.fetchList();
        }
    }

</script>

<style>
    /*
        封面选择部分
    */
    .avatar-uploader .el-upload {
        border: 1px dashed #d9d9d9;
        border-radius: 6px;
        cursor: pointer;
        position: relative;
        overflow: hidden;
        background-color: #fff;
        box-sizing: border-box;
        width: 360px;
        height: 180px;
        text-align: center;

    }

    .avatar-uploader .el-upload:hover {
        border-color: #20a0ff;
    }

    .avatar-uploader-icon {
        font-size: 28px;
        color: #8c939d;
        width: 178px;
        height: 178px;
        line-height: 178px;
        text-align: center;
    }

    .avatar {
        max-width: 100%;
        max-height: 100%;
        display: block;
        margin: 0 auto;
    }

</style>
