<template>
    <el-dialog :title="formTitle" :value="value" v-model="visible" @close="resetFormData">
        <el-form :model="formData" label-width="80px" :rules="formRules" ref="formData">
            <el-form-item label="类型" prop="type" required>
                <el-select v-model="formData.type" :disabled="formSelect" placeholder="请选择类型">
                    <el-option label="音乐属性" value="0"></el-option>
                    <el-option label="片段属性" value="1"></el-option>
                    <el-option label="剧本属性" value="2"></el-option>
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
            <el-button size="small" @click.native="change">取消</el-button>
            <el-button size="small" type="primary" @click.native="formSubmit" :loading="formLoading">提交</el-button>
        </div>
    </el-dialog>
</template>

<script type="es6">
    import util from '../../../api/util'
    import { httpGet, httpPost} from '../../../api/api';
    export default {
        name: 'vDetail',
        props: ['value', 'attrData'],
        data() {
            return {
                visible: false, //默认隐藏
                showLoading: false,
                formTitle: '新增属性',
                formLoading: false,
                formSelect: false, // 为false时是可编辑
                formRules: {
                    name: [
                        {required: true, message: '请输入属性名称', trigger: 'blur'},
                        {min: 1, max: 32, message: '长度在 1 到 32 个字符', trigger: 'blur'}
                    ],
                    attributeTypeEnum: [
                        {required: true, message: '请选择属性', trigger: 'change'}
                    ]
                },
                formData: {
                    id: '',
                    name: '',
                    type: '0',
                    iconUrl: '',
                    iconId: ''
                },
                avatarLoading: false
            }
        },
        computed: {
            detail(){ //返回详情
                if(!this.value){ // 弹窗不显示，不进行请求
                    return false;
                }
                if (this.attrData.id) {
                    this.formTitle = '编辑属性';
                    this.formSelect = true;
                    this.formData = {
                        id: this.attrData.id,
                        name: this.attrData.name,
                        type: this.attrData.attributeTypeEnum + '',
                        status: this.attrData.status,
                        iconUrl: this.attrData.iconUrl,
                        iconId: this.attrData.iconId
                    };
                }
            }
        },
        methods: {
            formSubmit(){ //提交表单
                let _self = this;
                _self.$refs.formData.validate((valid) => {
                    if (valid) {
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
                                _self.visible = false;
                                _self.$emit('refresh');
                            } catch (error) {
                                util.jsErrNotify(error);
                            }
                        })
                    }
                });
            },
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
            change() {
                this.visible = false;
            },
            resetFormData(){ //关闭表格弹窗，重置表格数据
                let _self = this;
                _self.formLoading = false;
                _self.formTitle = '新增属性';
                _self.formSelect = false;
                _self.formData = {
                    id: '',
                    name: '',
                    type: '0',
                    iconUrl: '',
                    iconId: ''
                };
                _self.$refs['formData'].resetFields();
                document.getElementById('cover').value = '';
                _self.attrData = {};
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
