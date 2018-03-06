<template>
    <el-dialog :title="title" :value="value" v-model="visible" @close="resetFormData">
        <el-form :model="formData" label-width="115px" :rules="formRules" ref="formData">
            <el-form-item label="渠道名称" prop="name">
                <el-input type="text" v-model="formData.name"></el-input>
            </el-form-item>
            <el-form-item label="广告标识" prop="channel">
                <el-input type="text" v-model="formData.channel"></el-input>
            </el-form-item>
            <el-form-item label="安装包" required>
                <input type="file" name="file" id="apkFile"/>
            </el-form-item>
            <el-form-item label="备注" prop="remark" style="margin-bottom: -20px;">
                <el-input type="text" v-model="formData.remark"></el-input>
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
    import {httpGet, httpPost} from '../../../api/api';

    export default {
        name: 'vDetail',
        props: ['value', 'linkData'],
        data() {
            var checkStr = (rule, value, callback) => {
                var reg = /^[0-9a-zA-Z]+$/;
                if (!reg.test(value)) {
                    callback(new Error('标识仅支持输入字母和数字'));
                } else {
                    callback();
                }
            };
            return {
                visible: false, //默认隐藏
                title: '新增推广链接',
                formLoading: false,
                formRules: {
                    name: [
                        {required: true, message: '请输入渠道名称', trigger: 'blur'},
                        {min: 1, max: 16, message: '长度在 1 到 16 个字符', trigger: 'blur'}
                    ],
                    channel: [
                        {required: true, message: '请输入广告标识', trigger: 'blur'},
                        {min: 1, max: 16, message: '长度在 1 到 16 个字符', trigger: 'blur'},
                        {validator: checkStr, trigger: 'blur'}
                    ],
                    remark: [
                        {min: 1, max: 16, message: '长度在 1 到 32 个字符', trigger: 'blur'},
                    ]
                },
                formData: {
                    id: '',
                    name: '',
                    channel: '',
                    remark: ''
                }

            }
        },
        computed: {
            detail() { //返回详情
                let _self = this;
                if (!_self.value) { //不显示的时候不请求详细
                    return;
                }
                if (_self.linkData) {
                    _self.title = '编辑推广链接';
                    let _data = _self.linkData;
                    _self.formData = {
                        id: _data.id,
                        name: _data.name,
                        channel: _data.channel,
                        remark: _data.remark
                    }
                }
            }
        },
        methods: {
            change() {
                this.visible = false;
            },
            formSubmit() { //提交表单
                let _self = this;
                let file = document.getElementById('apkFile');
                let _api = 'linkAdd'; // 默认是新增的api
                let paras = new FormData();
                if (_self.formData.id) { // 存在id为编辑操作
                    paras.append("id", _self.formData.id);
                    _api = 'linkEdit';
                } else { // 新增操作图片文件必须存在
                    if (file.files.length == 0) {
                        _self.$message.warning('请选择安装包文件');
                        return;
                    }
                }

                if (file.files[0]) { // 选择上传文件，校验后缀名
                    let _fileName = file.files[0].name;
                    let _fileType = _fileName.substring(_fileName.length - 3, _fileName.length);
                    if(_fileType.toLowerCase() != 'apk'){
                        _self.$message.warning('请选择apk格式的文件');
                        return;
                    }
                    paras.append("apkFile", file.files[0]);
                }
                paras.append("name", _self.formData.name);
                paras.append("channel", _self.formData.channel);
                paras.append("remark", _self.formData.remark);
                _self.$refs.formData.validate((valid) => {
                    if (valid) {
                        _self.formLoading = true;
                        httpPost(_api, paras, _self, function (res) {
                            _self.formLoading = false;
                            try {
                                _self.$message.success('提交成功');
                                _self.visible = false;
                                _self.$emit('refresh');
                            } catch (error) {
                                util.jsErrNotify(error);
                            }
                        })
                    } else {
                        console.log('验证失败');
                    }
                });
            },
            resetFormData() { //关闭表格弹窗，重置表格数据
                let _self = this;
                _self.formLoading = false;
                _self.formData = {
                    id: '',
                    name: '',
                    channel: '',
                    remark: ''
                };
                let file = document.getElementById('apkFile');
                file.value = '';
                _self.linkData = {};
            }
        },
        watch: {
            detail(val) { //监测详情变化
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
