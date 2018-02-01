<template>
    <el-dialog :title="formTitle" :value="value" v-model="visible" @close="resetFormData">
        <el-form :model="formData" label-width="80px" :rules="formRules" ref="formData">
            <el-form-item label="资源名称" prop="name">
                <el-input v-model.trim="formData.name" auto-complete="off"></el-input>
            </el-form-item>
            <el-form-item label="视频文件" prop="videoObj" required style="margin-bottom: -20px;">
                <input type="file" name="file" id="videoFile" @change="changeFile"/>
                <el-button style="margin-left: 10px;" size="small" type="success" @click="submitUploadKs">上传到服务器
                </el-button>
                <el-progress style="width: 70%;" :percentage="fileUpload.percentage"></el-progress>
                <div>(编辑状态若未选择新视频上传，视为使用原视频文件)</div>
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
    import { httpGet, httpPost} from '../../../api/api';
    import  Ks3 from '../../../../static/js/ksyun/ks3jssdk.js'

    export default {
        name: 'vDetail',
        props: ['value', 'resData'],
        data() {
            return {
                visible: false, //默认隐藏
                showLoading: false,
                formTitle: '新增视频资源',
                formLoading: false,
                formRules: {
                    name: [
                        {required: true, message: '请输入资源名称', trigger: 'blur'},
                        {min: 1, max: 32, message: '长度在 1 到 32 个字符', trigger: 'blur'}
                    ]
                },
                formData: {
                    id: '',
                    name: '',
                    videoObj: ''
                },
                fileUpload: {
                    percentage: 0,
                    name: ''
                }
            }
        },
        computed: {
            detail(){ //返回详情
                let _self = this;
                if(!_self.value){ // 弹窗不显示，不进行请求
                    return false;
                }
                if (_self.resData.id) {
                    _self.formTitle = '编辑视频资源';
                    this.formData = {
                        id: _self.resData.id,
                        name: _self.resData.name,
                        videoObj: _self.resData.objectKey
                    };
                }
            }
        },
        methods: {
            formSubmit(){ //提交表单
                let _self = this;
                _self.$refs.formData.validate((valid) => {
                    if (valid) {
                        if (_self.formData.videoObj == '' && _self.formData.id == '') {
                            _self.$message.warning('请选择视频文件');
                            return;
                        }
                        let paras = new FormData(),
                            api = 'videoUpload';
                        paras.append("objectKey", _self.formData.videoObj);
                        paras.append("name", _self.formData.name);
                        if (_self.formData.id !== '') { //id不为空，提交参数增加id，且更改接口地址
                            paras.append("id", _self.formData.id);
                            api = 'contentSourceEdit';
                        }
                        _self.formLoading = true;
                        httpPost(api, paras, _self, function (res) {
                            _self.formLoading = false;
                            try {
                                _self.$message.success('提交成功');
                                _self.$refs['formData'].resetFields();
                                _self.visible = false;
                                _self.$emit('refresh');
                            } catch (error) {
                                util.jsErrNotify(error);
                            }
                        })
                    }
                });
            },
            changeFile(){ //更改视频文件，名称、上传进度、videoObj 重置
                let file = document.getElementById('videoFile').files[0];
                this.fileUpload.percentage = 0;
                this.formData.videoObj = '';
                let reg = /\.\w+$/;
                if (file) {
                    let str = file.name;
                    this.formData.name = str.replace(reg, '');
                } else {
                    this.formData.name = '';
                }
            },
            submitUploadKs(){ //文件上传至金山
                let file = document.getElementById('videoFile').files[0];
                let _self = this;
                if (!file) { //未选择文件
                    _self.$message({
                        message: '请先选择文件',
                        type: 'error'
                    });
                    return;
                }

                const isMp4 = file.type === 'video/mp4';
                if (!isMp4) {
                    _self.$message.error('只可以上传mp4格式');
                    return;
                }
                let paras = {
                    contentType: file.type,
                    fileName: file.name
                };
                httpGet('videoSign', paras, _self, function (res) {
                    try {
                        let { error, status,data } = res;
                        Ks3.Ks3.config.baseUrl = data.url;
                        Ks3.Ks3.config.AK = data.formParam.KSSAccessKeyId;
                        Ks3.Ks3.config.bucket = data.bucketName;
                        Ks3.Ks3.putObject({
                            Key: data.formParam.key,
                            File: file,
                            ACL: 'public-read',
                            ProgressListener: progressFunction, //上传进程
                            Signature: data.formParam.signature
                        }, function (err) {
                            if (err) { //上传失败
                                _self.$message({
                                    message: JSON.stringify(err),
                                    type: 'error'
                                });
                                _self.fileUpload.percentage = 0;
                            } else { //上传成功回调
                                _self.formData.videoObj = data.formParam.key;
                            }
                        });
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
                function progressFunction(e) {
                    if (e.lengthComputable) {
                        let percent = parseInt((e.loaded / e.total) * 100);
                        _self.fileUpload.percentage = percent;
                    }
                }
            },
            change() {
                this.visible = false;
            },
            resetFormData(){ //关闭表格弹窗，重置表格数据
                let _self = this;
                _self.formData = {
                    id: '',
                    name: '',
                    videoObj: ''
                };
                _self.fileUpload.percentage = 0;
                _self.$refs['formData'].resetFields();
                _self.formTitle = '新增视频资源';
                document.getElementById('videoFile').value = '';
                _self.resData = {};
            }
        },
        watch: {
            detail(val){ //监测详情变化
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
