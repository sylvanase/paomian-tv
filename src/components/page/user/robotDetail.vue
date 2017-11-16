<template>
    <el-dialog title="马甲号编辑" :value="value" v-model="visible" @close="resetFormData">
        <el-form :model="formData" label-width="80px" :rules="formRules" ref="formData" v-loading="showLoading">
            <el-form-item label="头像" prop="coverId">
                <div class="avatar-uploader" style="width: 80%;" @click="chooseFile">
                    <div class="el-upload el-upload--text">
                        <i v-show="avatarLoading"class="el-icon-loading avatar-uploader-icon"></i>
                        <i v-show="!formData.coverImgUrl && !avatarLoading" class="el-icon-plus avatar-uploader-icon"></i>
                        <img v-show="formData.coverImgUrl && !avatarLoading" :src="formData.coverImgUrl" class="avatar">
                        <input type="file" id="cover" class="el-upload__input" @change="fileChange">
                    </div>
                </div>
                <el-button type="danger" size="small" @click="resetCoverImg">删除</el-button>
            </el-form-item>
            <el-form-item label="昵称" prop="name">
                <el-input v-model.trim="formData.name" style="width: 200px;" auto-complete="off"></el-input>
            </el-form-item>
            <el-form-item label="地址">
                <el-select v-model="formData.regionId" @change="fetchCity" style="width: 200px;margin-right: 10px;"
                           filterable placeholder="请选择地区">
                    <el-option label="无" value="0"></el-option>
                    <el-option v-for="item in regionList" :key="item.regionId" :label="item.regionName"
                               :value="item.regionId+''"></el-option>
                </el-select>
                <el-select v-model="formData.cityId" style="width: 200px;" filterable placeholder="请选择城市">
                    <el-option label="无" value="0"></el-option>
                    <el-option v-for="item in cityList" :key="item.cityId" :label="item.cityName"
                               :value="item.cityId+''"></el-option>
                </el-select>
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
                                    style="width: 100%;" @change="formatBirth"></el-date-picker>
                </el-col>
            </el-form-item>
            <el-form-item label="个性签名" prop="signature" style="margin-bottom: -20px;">
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
    import { httpGet, httpPost } from '../../../api/api';
    export default {
        name: 'vDetail',
        props: ['value', 'userData'],
        data() {
            return {
                visible: false, //默认隐藏
                showLoading: false,
                formLoading: false,
                formRules: {
                    name: [
                        {required: true, message: '请输入昵称', trigger: 'blur'},
                        {min: 1, max: 15, message: '长度在 1 到 15 个字符', trigger: 'blur'}
                    ],
                    phone: [
                        {required: true, message: '请输入手机号', trigger: 'blur'},
                        {min: 11, max: 11, message: '手机号必须为11位', trigger: 'blur'}
                    ],
                    signature:[
                        {min: 0, max: 60, message: '签名不得超过60个字符', trigger: 'blur'}
                    ]
                },
                avatarLoading: false,
                formData: {
                    id: '',
                    name: '',
                    coverId: '',
                    coverImgUrl: '',
                    regionId: '',
                    cityId: '',
                    phone: '',
                    sex: '0',
                    signature: '',
                    date: '',
                    count: 0
                },
                regionList: [],
                cityList: []
            }
        },
        computed: {
            detail(){ //返回马甲号详情
                let _self = this;
                _self.fetchRegion();
                if (_self.userData.id) {
                    _self.showLoading = true;
                    httpGet('userDetail', {uid: _self.userData.id}, _self, function (res) {
                        _self.showLoading = false;
                        try {
                            let { error, status,data } = res;
                            _self.formData = {
                                id: data.id,
                                name: data.username,
                                coverId: data.avatarUrl,
                                coverImgUrl: data.fullUrl,
                                regionId: data.countryId + '',
                                cityId: data.cityId + '',
                                phone: data.phone,
                                sex: data.sex + '',
                                signature: data.signature,
                                date: data.birthday ? data.birthday : '',
                                count: 0
                            }
                        } catch (error) {
                            util.jsErrNotify(error);
                        }
                    })
                }
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
                        httpPost('avatarUpload', paras, _self, function (res) {
                            _self.avatarLoading = false;
                            try {
                                let { error, status,data } = res;
                                _self.formData.coverId = data.url;
                                _self.formData.coverImgUrl = URL.createObjectURL(fileDom.files[0]);
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
            change() {
                this.visible = false;
            },
            resetFormData(){ //关闭表格弹窗，重置表格数据
                let _self = this;
                _self.formLoading = false;
                _self.showLoading = false;
                _self.formData = {
                    id: '',
                    name: '',
                    coverId: '',
                    coverImgUrl: '',
                    regionId: '',
                    cityId: '',
                    phone: '',
                    sex: '0',
                    signature: '',
                    date: '',
                    count: 0
                };
                document.getElementById('cover').value = '';
                _self.userData = {};
            },
            fetchRegion() { //获取省列表
                let _self = this;
                httpGet('regionList', '', _self, function (res) {
                    try {
                        let { error, status,data } = res;
                        _self.regionList = data;
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            fetchCity(id){ //根据省id获取城市列表
                let _self = this;
                _self.formData.count = _self.formData.count + 1;
                if (id) {
                    httpGet('cityList', {regionId: id}, _self, function (res) {
                        try {
                            let { error, status,data } = res;
                            _self.cityList = data;
                            if(_self.formData.count > 1){
                                _self.formData.cityId = '0';
                            }
                        } catch (error) {
                            util.jsErrNotify(error);
                        }
                    })
                }
            },
            formSubmit(){ //提交表单
                this.$refs.formData.validate((valid) => {
                    if (valid) {
                        let _self = this;
                        _self.formLoading = true;
                        let paras = new FormData();
                        paras.append("avatar", _self.formData.coverId);
                        paras.append("uid", _self.formData.id);
                        paras.append("username", _self.formData.name);
                        paras.append("phone", _self.formData.phone);
                        paras.append("sex", _self.formData.sex);
                        paras.append("signature", _self.formData.signature);
                        paras.append("regionId", _self.formData.regionId);
                        paras.append("cityId", _self.formData.cityId);
                        paras.append("birthday", _self.formData.date ? _self.formData.date:'');
                        httpPost('robotEdit', paras, _self, function (res) {
                            _self.formLoading = false;
                            try {
                                let { error, status,data } = res;
                                _self.$message.success('提交成功');
                                _self.visible = false;
                                _self.$emit('refresh');
                            } catch (error) {
                                util.jsErrNotify(error);
                            }
                        })


                    }
                });
            },
            resetCoverImg(){ //删除封面
                this.formData.coverImgUrl = '';
                this.formData.coverId = '';
                document.getElementById('cover').value = '';
            },
            formatBirth(val){ //格式化日期控件值
                this.formData.date = val;
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

</style>
