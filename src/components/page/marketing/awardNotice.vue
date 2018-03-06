<template>
    <section>
        <el-form :model="formData" label-width="115px" style="margin-top:20px;max-width: 700px;" :rules="formRules"
                 ref="formData">
            <el-form-item label="用户uid" prop="uid">
                <el-input type="textarea" :disabled="isEdit" placeholder="请输入用户uid" v-model="formData.uid"></el-input>
                <span>（多个用户请使用英文分号;进行分隔）</span>
            </el-form-item>
            <el-form-item label="所有用户">
                <el-switch v-model="formData.allUser" @change="clearUid"></el-switch>
                <span>（一天只能发送一次）</span>
            </el-form-item>
            <el-form-item label="消息标题" prop="title">
                <el-input type="text" placeholder="请输入消息标题" v-model="formData.title"></el-input>
            </el-form-item>
            <el-form-item label="消息正文" prop="desc">
                <el-input type="textarea" placeholder="请输入消息正文" v-model="formData.desc"></el-input>
            </el-form-item>
            <el-form-item label="跳转地址" prop="link">
                <el-input type="text" placeholder="请输入URL或app内部地址" v-model="formData.link"></el-input>
            </el-form-item>
            <el-form-item style="text-align:right;">
                <el-button size="small" type="danger" @click.native="resetForm">重置</el-button>
                <el-button size="small" type="primary" @click.native="formSubmit" :loading="formLoading">发送</el-button>
            </el-form-item>
        </el-form>
    </section>
</template>

<script type="es6">
    import util from '../../../api/util'
    import {httpGet, httpPost} from '../../../api/api';

    export default {
        data() {
            var checkUid = (rule, value, callback) => {
                let _self = this;
                if (!_self.formData.allUser) { // 没有勾选全部用户，uid不可为空
                    if (value == '') {
                        callback(new Error('请输入用户uid'));
                    }
                } else {
                    callback();
                }
            };
            return {
                formLoading: false,
                formRules: {
                    uid: [
                        {validator: checkUid, trigger: 'blur'}
                    ],
                    title: [
                        {required: true, message: '请输入消息标题', trigger: 'blur'},
                        {min: 2, max: 15, message: '长度在 2 到 15 个字符', trigger: 'blur'}
                    ],
                    desc: [
                        {required: true, message: '请输入消息正文', trigger: 'blur'},
                        {min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur'},
                    ]
                },
                formData: {
                    uid: '',
                    allUser: false,
                    title: '',
                    desc: '',
                    link: ''
                },
                isEdit: false

            }
        },
        methods: {
            formSubmit() { //提交表单
                let _self = this;
                let paras = new FormData();
                paras.append("uid", _self.formData.uid);
                paras.append("title", _self.formData.title);
                paras.append("body", _self.formData.desc);
                paras.append("link", _self.formData.link);
                paras.append("isSpecific", Number(!_self.formData.allUser));
                _self.$refs.formData.validate((valid) => {
                    if (valid) {
                        _self.formLoading = true;
                        httpPost('noticeSend', paras, _self, function (res) {
                            _self.formLoading = false;
                            try {
                                _self.$message.success('发送成功');
                                _self.resetForm();
                            } catch (error) {
                                util.jsErrNotify(error);
                            }
                        })
                    } else {
                    }
                });
            },
            resetForm() { //关闭表格弹窗，重置表格数据
                let _self = this;
                _self.formLoading = false;
                _self.formData = {
                    uid: '',
                    allUser: false,
                    title: '',
                    desc: '',
                    link: ''
                };
                _self.$refs['formData'].resetFields();
            },
            clearUid(query) { // 选择全部用户时，清除uid输入框内容并置为不可用
                let _self = this;
                _self.isEdit = query;
                if (query) { //
                    _self.formData.uid = '';
                }
            }
        }
    }

</script>
