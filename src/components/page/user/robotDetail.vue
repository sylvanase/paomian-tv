<template>
    <el-dialog title="马甲号编辑" :value="value" v-model="visible">
        <el-form :model="formData" label-width="80px" :rules="formRules" ref="formData" v-loading="showLoading">
            <el-form-item label="头像" prop="coverId">
                <el-upload style="width: 80%;" :disabled="avatarDisabled" class="avatar-uploader" ref="upload"
                           action="" :show-file-list="false" :on-change="avatarChange" :auto-upload="false">
                    <img v-if="formData.coverImgUrl" v-model="formData.coverId" :src="formData.coverImgUrl"
                         class="avatar">
                    <i v-else class="el-icon-plus avatar-uploader-icon"></i>
                </el-upload>
                <el-button :loading="avatarLoading" class="mb-10" type="primary" size="small" @click="submitUpload">
                    上传
                </el-button>
                <el-button type="danger" size="small" @click="resetCoverImg">删除</el-button>
            </el-form-item>
            <el-form-item label="昵称" prop="name">
                <el-input v-model.trim="formData.name" style="width: 200px;" auto-complete="off"></el-input>
            </el-form-item>
            <el-form-item label="地址" prop="address">
                <el-input v-model.trim="formData.address" auto-complete="off"></el-input>
            </el-form-item>
            <el-form-item label="手机号" prop="phone">
                <el-input style="width: 200px;" v-model.trim="formData.phone" auto-complete="off"></el-input>
            </el-form-item>
            <el-form-item label="性别" prop="sex">
                <el-select size="small" v-model="formData.sex" placeholder="请选择" style="width: 200px;">
                    <el-option label="男" value="0"></el-option>
                    <el-option label="女" value="1"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="出生日期">
                <el-col :span="11">
                    <el-date-picker type="date" placeholder="选择日期" v-model="formData.date"
                                    style="width: 100%;"></el-date-picker>
                </el-col>
            </el-form-item>
            <el-form-item label="个性签名" style="margin-bottom: 0;">
                <el-input type="textarea" v-model="formData.signature"></el-input>
            </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button size="small" @click.native="change">取消</el-button>
            <el-button size="small" type="primary" @click.native="formSubmit" :loading="formLoading">提交</el-button>
        </div>
    </el-dialog>
</template>

<script type="es6">
    import util from '../../../api/util'
    import { avatarUploadApi, axiosGet, axiosPost} from '../../../api/api';
    export default {
        name: 'vDetail',
        props: ['value', 'userData'],
        data() {
            return {
                visible: false, //默认隐藏
                showLoading: true,
                formLoading: false,
                formRules: {
                    name: [
                        {required: true, message: '请输入昵称', trigger: 'blur'},
                        {min: 1, max: 15, message: '长度在 1 到 15 个字符', trigger: 'blur'}
                    ],
                    phone:[
                        {min: 11, max: 11, message: '手机号必须为11位', trigger: 'blur'}
                    ]
                },
                avatarLoading: false,
                avatarDisabled: false,
                formData: {
                    id: '',
                    name: '',
                    coverId: '',
                    coverImgUrl: '',
                    address: '',
                    phone: '',
                    sex: '0',
                    signature: '',
                    date: ''
                }
            }
        },
        computed: {
            detail(){ //返回马甲号详情
                this.showLoading = true;
                this.formData = {
                    id: '',
                    name: '',
                    coverId: '',
                    coverImgUrl: '',
                    address: '',
                    phone: '',
                    sex: '0',
                    signature: '',
                    date: ''
                };
                if (this.userData.id) {
                    axiosGet('userDetail', {uid: this.userData.id}).then((res) => {
                        let { error, status, data } = res;
                        if (status !== 0) {
                            if (status == 403) { //返回403时，重新登录
                                sessionStorage.removeItem('user');
                                this.$router.push('/login');
                            } else {
                                this.$message.error(error);
                            }
                        } else {
                            this.showLoading = false;
                            this.formData = {
                                id: data.id,
                                name: data.username,
                                coverId: data.avatarUrl,
                                coverImgUrl: data.fullUrl,
                                address: data.address,
                                phone: data.phone,
                                sex: data.sex,
                                signature: data.signature,
                                date: data.birthday
                            }
                        }
                    });

                }
            }
        },
        methods: {
            change() {
                this.visible = false;
            },
            formSubmit(){ //提交表单
                this.$refs.formData.validate((valid) => {
                    if (valid) {
                        this.formLoading = true;
                        let paras = new FormData();
                        paras.append("avatar", this.formData.coverId);
                        paras.append("uid", this.formData.id);
                        paras.append("username", this.formData.name);
                        paras.append("phone", this.formData.phone);
                        paras.append("sex", this.formData.sex);
                        paras.append("signature", this.formData.signature);
                        paras.append("address", this.formData.address);
                        axiosPost('robotEdit', paras).then((res) => {
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
                                this.visible = false;
                                this.$emit('refresh');
                            }
                        });
                    }
                });

            },
            /*
             * 封面选择相关操作
             * */
            avatarChange(file){ //更改图片时,重置预览文件路径
                this.formData.coverImgUrl = file.url;
            },
            resetCoverImg(){ //删除封面
                this.formData.coverImgUrl = '';
                this.formData.coverId = '';
            },
            beforeAvatarUpload(file) { //上传前校验
                const isType = file.type.substring(0, 5);
                const isJPG = isType === 'image';
                const isLt2M = file.size / 1024 / 1024 <= 10;

                if (!isJPG) {
                    this.$message.warning('封面文件必须是图片类型!');
                }
                if (!isLt2M) {
                    this.$message.warning('上传图片大小不能超过 10MB!');
                }
                return isJPG && isLt2M;
            },
            submitUpload() { //上传图片
                let file = document.getElementsByName('file')[0].files;
                if (file.length == 0) { //file为空，提示并返回
                    this.$message.warning('请选择文件');
                    return;
                }
                var imgFile = document.getElementsByName('file')[0].files[0];
                if (!this.beforeAvatarUpload(imgFile)) {
                    return;
                }
                let para = new FormData();
                para.append("imageFile", imgFile);
                avatarUploadApi(para).then((res) => {
                    this.avatarDisabled = true;
                    this.avatarLoading = true;
                    let { error, status, data } = res;
                    if (status !== 0) {
                        if (status == 403) { //返回403时，重新登录
                            sessionStorage.removeItem('user');
                            this.$router.push('/login');
                        } else {
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
                this.formData.coverId = res.url;
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
