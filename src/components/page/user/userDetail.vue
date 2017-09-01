<template>
    <el-dialog title="用户详情" :value="value" v-model="visible">
        <el-form :model="formData" label-width="80px" :rules="formRules" ref="formData" v-loading="showLoading">
            <el-form-item label="用户头像" prop="coverId">
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
            <el-form-item label="uid">
                {{ formData.id }}
            </el-form-item>
            <el-form-item label="注册时间">
                {{ formData.time }}
            </el-form-item>
            <el-form-item label="昵称" prop="name">
                <el-input disabled="true" v-model.trim="formData.name" style="width: 200px;" auto-complete="off"></el-input>
            </el-form-item>
            <el-form-item label="地址">
                <el-select v-model="formData.regionId" @change="fetchCity" style="width: 200px;margin-right: 10px;"
                           filterable placeholder="请选择地区">
                    <el-option label="无" value="0"></el-option>
                    <el-option v-for="item in regionList" :key="item.regionId" :label="item.regionName"
                               :value="item.regionId"></el-option>
                </el-select>
                <el-select v-model="formData.cityId" style="width: 200px;" filterable placeholder="请选择城市">
                    <el-option label="无" value="0"></el-option>
                    <el-option v-for="item in cityList" :key="item.cityId" :label="item.cityName"
                               :value="item.cityId"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="手机号" prop="phone">
                <el-input style="width: 200px;" v-model.trim="formData.phone" auto-complete="off"></el-input>
                <el-button class="ml-10" size="small" @click.native="phoneUpdate">更换</el-button>
            </el-form-item>
            <el-form-item label="QQ">
                <template v-if="formData.qq">
                    <el-tag type="success" style="margin-right: 10px;" >已绑定</el-tag>
                    <el-button type="danger" :plain="true" class="ml-10" size="small" @click.native="unbindThird('0')">
                        解绑
                    </el-button>
                </template>
                <template v-else>
                    <el-tag :type="danger">未绑定</el-tag>
                </template>
            </el-form-item>
            <el-form-item label="微信" prop="wechat">
                <template v-if="formData.wechat">
                    <el-tag type="success" style="margin-right: 10px;" >已绑定</el-tag>
                    <el-button type="danger" :plain="true" class="ml-10" size="small" @click.native="unbindThird('1')">
                        解绑
                    </el-button>
                </template>
                <template v-else>
                    <el-tag :type="danger" close-transition>未绑定</el-tag>
                </template>
            </el-form-item>
            <el-form-item label="微博" style="margin-bottom: -20px;">
                <template v-if="formData.weibo">
                    <el-tag type="success" style="margin-right: 10px;" >已绑定</el-tag>
                    <el-button type="danger" :plain="true" class="ml-10" size="small" @click.native="unbindThird('2')">
                        解绑
                    </el-button>
                </template>
                <template v-else>
                    <el-tag :type="danger" close-transition>未绑定</el-tag>
                </template>
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
    import { avatarUploadApi, axiosGet, axiosPost, axiosDel} from '../../../api/api';
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
                        {required: true, message: '请输入用户昵称', trigger: 'blur'},
                        {min: 1, max: 32, message: '长度在 1 到 32 个字符', trigger: 'blur'}
                    ]
                },
                avatarLoading: false,
                avatarDisabled: false,
                formData: {
                    id: '',
                    name: '',
                    coverId: '',
                    coverImgUrl: '',
                    time: '',
                    regionId: '',
                    cityId: '',
                    os: '',
                    imei: '',
                    phone: '',
                    qq: '',
                    wechat: '',
                    weibo: ''
                },
                regionList: [],
                cityList: []
            }
        },
        computed: {
            detail(){ //返回用户详情
                this.showLoading = true;
                this.formData = {
                    id: '',
                    name: '',
                    coverId: '',
                    coverImgUrl: '',
                    time: '',
                    regionId: '',
                    cityId: '',
                    os: '',
                    imei: '',
                    phone: '',
                    qq: '',
                    wechat: '',
                    weibo: ''
                };
                this.fetchRegion();
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
                            this.fetchCity(data.regionId);
                            this.formData = {
                                id: data.id,
                                name: data.username,
                                coverId: data.avatarUrl,
                                coverImgUrl: data.fullUrl,
                                time: util.timestampFormat(data.createTime),
                                regionId: data.countryId + '',
                                cityId: data.cityId + '',
                                os: '',
                                imei: '',
                                phone: data.phone,
                                qq: data.qqBind,
                                wechat: data.wxBind,
                                weibo: data.wbBind
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
            fetchRegion() { //获取省列表
                axiosGet('regionList').then((res) => {
                    let { error, status, data } = res;
                    if (status !== 0) {
                        if (status == 403) { //返回403时，重新登录
                            sessionStorage.removeItem('user');
                            this.$router.push('/login');
                        } else {
                            this.$message.error(error);
                        }
                    } else {
                        this.regionList = data;
                    }
                });
            },
            fetchCity(id){ //根据省id获取城市列表
                if (id) {
                    axiosGet('cityList', {regionId: id}).then((res) => {
                        let { error, status, data } = res;
                        if (status !== 0) {
                            if (status == 403) { //返回403时，重新登录
                                sessionStorage.removeItem('user');
                                this.$router.push('/login');
                            } else {
                                this.$message.error(error);
                            }
                        } else {
                            this.formData.cityId = '0';
                            this.cityList = data;
                        }
                    });
                }
            },
            formSubmit(){ //提交表单
                this.formLoading = true;
                let paras = new FormData();
                paras.append("avatar", this.formData.coverId);
                paras.append("uid", this.formData.id);
                paras.append("username", this.formData.name);
                paras.append("regionId", this.formData.regionId);
                paras.append("cityId", this.formData.cityId);
                axiosPost('userEdit', paras).then((res) => {
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
            },
            phoneUpdate(){ //更换手机号
                let para = {
                    uid: this.userData.id,
                    mobile: this.formData.phone
                };
                axiosPost('userPhoneUpdate', para).then((res) => {
                    let { error, status } = res;
                    if (status !== 0) {
                        if (status == 403) { //返回403时，重新登录
                            sessionStorage.removeItem('user');
                            this.$router.push('/login');
                        } else {
                            this.$message.error(error);
                        }
                    } else {
                        this.$message.success('更换成功');
                    }
                });
            },
            unbindThird(type){ //第三方账号解绑
                this.$confirm('确认解绑吗?', '提示', {
                    type: 'warning'
                }).then(() => {
                    let para = {
                        uid: this.userData.id,
                        snsType: type
                    };
                    axiosDel('userUnbind', para).then((res) => {
                        let { error, status } = res;
                        if (status !== 0) {
                            if (status == 403) { //返回403时，重新登录
                                sessionStorage.removeItem('user');
                                this.$router.push('/login');
                            } else {
                                this.$message.error(error);
                            }
                        } else {
                            this.$message.success('解绑成功');
                            if (type == 0) {
                                this.formData.qq = '';
                            } else if (type == 1) {
                                this.formData.wechat = '';
                            } else if (type == 2) {
                                this.formData.weibo = '';
                            }
                        }
                    });
                });
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
