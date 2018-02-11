<template>
    <el-dialog title="用户详情" :value="value" v-model="visible" @close="resetFormData">
        <el-form :model="formData" label-width="80px" ref="formData" v-loading="showLoading">
            <el-form-item label="用户头像" prop="coverId">
                <div class="avatar-uploader" style="width: 80%;" @click="chooseFile">
                    <div class="el-upload el-upload--text">
                        <i v-show="avatarLoading" class="el-icon-loading avatar-uploader-icon"></i>
                        <i v-show="!formData.coverImgUrl && !avatarLoading"
                           class="el-icon-plus avatar-uploader-icon"></i>
                        <img v-show="formData.coverImgUrl && !avatarLoading" :src="formData.coverImgUrl"
                             class="avatar">
                        <input type="file" id="cover" class="el-upload__input" @change="fileChange">
                    </div>
                </div>
                <el-button type="danger" size="small" @click="resetCoverImg">删除</el-button>
            </el-form-item>
            <el-form-item label="uid">
                {{ formData.id }}
            </el-form-item>
            <el-form-item label="注册时间">
                {{ formData.time }}
            </el-form-item>
            <el-form-item label="昵称" prop="name">
                <el-input disabled="true" v-model.trim="formData.name" style="width: 200px;"
                          auto-complete="off"></el-input>
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
            <el-form-item label="用户分类" prop="catIds">
                <template>
                    <el-select style="width: 50%;" filterable v-model="formData.catIds" multiple
                               placeholder="选择用户分类">
                        <el-option v-for="item in catList" :key="item.id" :label="item.name"
                                   :value="item.id">
                        </el-option>
                    </el-select>
                </template>
            </el-form-item>
            <template v-if="formData.imei.length > 0" v-for="item in formData.imei">
                <el-form-item label="设备类型">
                    <span>{{ item.name }}</span>
                </el-form-item>
                <el-form-item label="设备号">
                    <span>{{ item.uuid }}</span>
                </el-form-item>
            </template>
            <el-form-item label="手机号" prop="phone">
                <el-input style="width: 200px;" v-model.trim="formData.phone" auto-complete="off"></el-input>
                <el-button class="ml-10" size="small" @click.native="phoneUpdate">更换</el-button>
                <el-button class="ml-10" size="small" @click.native="phoneUnbind">解绑</el-button>
            </el-form-item>
            <el-form-item label="QQ">
                <template v-if="formData.qq">
                    <el-tag type="success" style="margin-right: 10px;">已绑定</el-tag>
                    <el-button type="danger" :plain="true" class="ml-10" size="small"
                               @click.native="unbindThird('0')">
                        解绑
                    </el-button>
                </template>
                <template v-else>
                    <el-tag :type="danger">未绑定</el-tag>
                </template>
            </el-form-item>
            <el-form-item label="微信" prop="wechat">
                <template v-if="formData.wechat">
                    <el-tag type="success" style="margin-right: 10px;">已绑定</el-tag>
                    <el-button type="danger" :plain="true" class="ml-10" size="small"
                               @click.native="unbindThird('1')">
                        解绑
                    </el-button>
                </template>
                <template v-else>
                    <el-tag :type="danger" close-transition>未绑定</el-tag>
                </template>
            </el-form-item>
            <el-form-item label="微博" style="margin-bottom: -20px;">
                <template v-if="formData.weibo">
                    <el-tag type="success" style="margin-right: 10px;">已绑定</el-tag>
                    <el-button type="danger" :plain="true" class="ml-10" size="small"
                               @click.native="unbindThird('2')">
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
    import {httpGet, httpPost, httpDel} from '../../../api/api';

    export default {
        name: 'vDetail',
        props: ['value', 'userId', 'category'],
        data() {
            return {
                visible: false, //默认隐藏
                showLoading: false,
                formLoading: false,
                avatarLoading: false,
                formData: {
                    id: '',
                    name: '',
                    coverId: '',
                    coverImgUrl: '',
                    time: '',
                    regionId: '0',
                    cityId: '0',
                    os: '',
                    imei: [],
                    phone: '',
                    qq: '',
                    wechat: '',
                    weibo: '',
                    count: 0,
                    catIds: []
                },
                catList: [],
                regionList: [],
                cityList: []
            }
        },
        computed: {
            detail() { // 返回用户详情
                let _self = this;
                if(!_self.visible){
                    return false;
                }
                _self.fetchRegion();
                _self.catList = _self.category;
                if (_self.userId) {
                    httpGet('userDetail', {uid: _self.userId}, _self, function (res) {
                        _self.showLoading = false;
                        try {
                            let {data} = res;
                            _self.formData = {
                                id: data.id,
                                name: data.username,
                                coverId: data.avatarUrl,
                                coverImgUrl: data.fullUrl,
                                time: util.timestampFormat(data.createTime),
                                regionId: data.countryId + '',
                                cityId: data.cityId + '',
                                os: '',
                                imei: data.userDevicePoList,
                                phone: data.phone,
                                qq: data.qqBind,
                                wechat: data.wxBind,
                                weibo: data.wbBind,
                                count: 0,
                                catIds: data.userAttrIds
                            };
                        } catch (error) {
                            util.jsErrNotify(error);
                        }
                    })
                }
            }
        },
        methods: {
            chooseFile() { //触发选择文件
                let fileDom = document.getElementById('cover');
                fileDom.click();
            },
            fileChange() { // 文件变更后操作
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
                                let {error, status, data} = res;
                                _self.formData.coverId = data.url;
                                _self.formData.coverImgUrl = URL.createObjectURL(fileDom.files[0]);
                            } catch (error) {
                                util.jsErrNotify(error);
                            }
                        }, function (res) { // 上传失败回调
                            _self.avatarLoading = false;
                            fileDom.value = '';
                            _self.$message.error('上传失败，请重新选择文件');
                        })
                    }
                }
            },
            resetCoverImg() { //删除封面
                this.formData.coverImgUrl = '';
                this.formData.coverId = '';
                document.getElementById('cover').value = '';
            },
            phoneUpdate() { //更换手机号
                let _self = this;
                let paras = new FormData();
                paras.append("uid", _self.userId);
                paras.append("mobile", _self.formData.phone);
                httpPost('userPhoneUpdate', paras, _self, function (res) {
                    try {
                        _self.$message.success('更换成功');
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            phoneUnbind() { //用户手机解锁
                this.$confirm('确认将该用户手机解绑吗?', '提示', {
                    type: 'warning'
                }).then(() => {
                    let _self = this;
                    let paras = {
                        uid: _self.userId,
                        mobile: _self.formData.phone
                    };
                    httpGet('userMobileUnbind', paras, _self, function (res) {
                        try {
                            _self.$message.success('解绑成功');
                            _self.formData.phone = '';
                        } catch (error) {
                            util.jsErrNotify(error);
                        }
                    })
                });
            },
            unbindThird(type) { //第三方账号解绑
                this.$confirm('确认解绑吗?', '提示', {
                    type: 'warning'
                }).then(() => {
                    let _self = this;
                    let paras = {
                        uid: _self.userId,
                        snsType: type
                    };
                    httpDel('userUnbind', paras, _self, function (res) {
                        try {
                            _self.$message.success('解绑成功');
                            if (type == 0) {
                                _self.formData.qq = '';
                            } else if (type == 1) {
                                _self.formData.wechat = '';
                            } else if (type == 2) {
                                _self.formData.weibo = '';
                            }
                        } catch (error) {
                            util.jsErrNotify(error);
                        }
                    })
                });
            },
            change() {
                this.visible = false;
            },
            resetFormData() { //关闭表格弹窗，重置表格数据
                let _self = this;
                _self.formLoading = false;
                _self.showLoading = false;
                _self.formData = {
                    id: '',
                    name: '',
                    coverId: '',
                    coverImgUrl: '',
                    time: '',
                    regionId: '0',
                    cityId: '0',
                    os: '',
                    imei: [],
                    phone: '',
                    qq: '',
                    wechat: '',
                    weibo: '',
                    count: 0,
                    catIds: []
                };
                document.getElementById('cover').value = '';
                _self.userId = '';
            },
            fetchRegion() { //获取省列表
                let _self = this;
                httpGet('regionList', '', _self, function (res) {
                    try {
                        let {error, status, data} = res;
                        _self.regionList = data;
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            fetchCity(id) { //根据省id获取城市列表
                let _self = this;
                _self.formData.count = _self.formData.count + 1;
                if (id) {
                    httpGet('cityList', {regionId: id}, _self, function (res) {
                        try {
                            let {error, status, data} = res;
                            _self.cityList = data;
                            if (_self.formData.count > 1) {
                                _self.formData.cityId = '0';
                            }
                        } catch (error) {
                            util.jsErrNotify(error);
                        }
                    })
                }
            },
            formSubmit() { //提交表单
                let _self = this;
                let paras = new FormData();
                paras.append("avatar", _self.formData.coverId);
                paras.append("uid", _self.formData.id);
                paras.append("username", _self.formData.name);
                paras.append("regionId", _self.formData.regionId);
                paras.append("cityId", _self.formData.cityId);
                paras.append("userAttrIds", _self.formData.catIds);
                _self.formLoading = true;
                httpPost('userEdit', paras, _self, function (res) {
                    _self.formLoading = false;
                    try {
                        let {error, status, data} = res;
                        _self.$message.success('提交成功');
                        _self.visible = false;
                        _self.$emit('refresh');
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            resetCoverImg() { //删除封面
                this.formData.coverImgUrl = '';
                this.formData.coverId = '';
                document.getElementById('cover').value = '';
            },
        },
        watch: {
            detail(val) { //监测详情变化
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
