<template>
    <el-dialog :title="title" :value="value" v-model="visible" @close="resetFormData">
        <el-form :model="formData" label-width="115px" :rules="formRules" ref="formData" >
            <el-form-item label="起止时间" required>
                <el-date-picker v-model="formData.time" type="datetimerange" :picker-options="pickerOptions"
                                placeholder="选择生效时间" align="center" @change="setRange">
                </el-date-picker>
            </el-form-item>
            <el-form-item label="ios开机图" required>
                <input type="file" name="file" id="iosFile"/>
                <div class="el-upload__tip" style="line-height: 20px;">
                    宽高要求：750*1624
                </div>
            </el-form-item>
            <el-form-item label="android开机图" required>
                <input type="file" name="file" id="androidFile"/>
                <div class="el-upload__tip" style="line-height: 20px;">
                    宽高要求：1080*2520
                </div>
            </el-form-item>
            <el-form-item label="外链" prop="link" style="margin-bottom: -20px;">
                <el-input type="text" v-model="formData.link"></el-input>
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
        name: 'vLaunchDetail',
        props: ['value', 'launchData'],
        data() {
            return {
                visible: false, //默认隐藏
                title: '新增开机页',
                formLoading: false,
                formRules: {
                    time: [
                        {type:'array', required: true, message: '请选择日期', trigger: 'change' }
                    ]
                },
                formData: {
                    id: '',
                    link: '',
                    time: [],
                    start: '',
                    end: ''
                },
                pickerOptions: { // 时间控件约束条件
                    /*disabledDate(time) {
                        return time.getTime() < Date.now() - 8.64e7;
                    }*/
                }
            }
        },
        computed: {
            detail(){ //返回详情
                let _self = this;
                if (!_self.value) { //不显示的时候不请求详细
                    return;
                }
                if (_self.launchData) {
                    _self.title = '编辑开机页';
                    _self.formData = {
                        id: _self.launchData.id,
                        link: _self.launchData.appLink,
                        time: [_self.launchData.startTime, _self.launchData.endTime],
                        start: _self.launchData.startTime,
                        end: _self.launchData.endTime
                    }
                }
            }
        },
        methods: {
            change() {
                this.visible = false;
            },
            formSubmit(){ //提交表单
                let _self = this;
                let iosFile = document.getElementById('iosFile');
                let andFile = document.getElementById('androidFile');
                let _api = 'launchBannerAdd'; // 默认是新增的api
                let paras = new FormData();
                if (_self.formData.id) { // 存在id为编辑操作
                    paras.append("id", _self.formData.id);
                    _api = 'launchBannerUpdate';
                } else { // 新增操作图片文件必须存在
                    if (iosFile.files.length == 0 || andFile.files.length == 0) {
                        _self.$message.warning('ios与安卓的开机图文件不能为空');
                        return;
                    }
                }
                if(iosFile.files[0]){
                    paras.append("iosImage", iosFile.files[0]);
                }
                if(andFile.files[0]){
                    paras.append("androidImage", andFile.files[0]);
                }
                paras.append("appLink", _self.formData.link);
                paras.append("startTime", _self.formData.start);
                paras.append("endTime", _self.formData.end);
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
                    }
                });
            },
            setRange(val){ //格式化日期控件值
                let _self = this;
                _self.formData.start = val.substring(0, 19);
                _self.formData.end = val.substring(22);
                _self.formData.time = [_self.formData.start, _self.formData.end];
            },
            resetFormData(){ //关闭表格弹窗，重置表格数据
                let _self = this;
                _self.formLoading = false;
                _self.formData = {
                    id: '',
                    link: '',
                    time: [],
                    start: '',
                    end: ''
                };
                let iosFile = document.getElementById('iosFile');
                let andFile = document.getElementById('androidFile');
                iosFile.value = '';
                andFile.value = '';
                _self.launchData = {};
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

<style>
    .el-date-range-picker{
        width: 515px !important;
    }
</style>
