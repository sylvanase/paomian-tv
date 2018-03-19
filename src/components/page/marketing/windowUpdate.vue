<template>
    <el-dialog title="重设起止时间" :value="value" v-model="visible" @close="resetFormData">
        <el-form :model="formData" label-width="115px" :rules="formRules" ref="formData">
            <el-form-item label="起止时间" required prop="time" style="margin-bottom:-20px;">
                <el-date-picker v-model="formData.time" type="datetimerange" :picker-options="pickerOptions"
                                placeholder="选择生效时间" align="center" @change="setRange">
                </el-date-picker>
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
        name: 'vWindowUpdate',
        props: ['value', 'windowData'],
        data() {
            return {
                visible: false, //默认隐藏
                formLoading: false,
                formRules: {
                    time: [
                        {type: 'array', required: true, message: '请选择日期', trigger: 'change'}
                    ]
                },
                formData: {
                    time: [],
                    start: '',
                    end: ''
                }
            }
        },
        computed: {
            detail() { //返回详情
                let _self = this;
                if (!_self.value) { //不显示的时候不请求详细
                    return;
                }
            }
        },
        methods: {
            change() {
                this.visible = false;
            },
            formSubmit() { //提交表单
                let _self = this;
                let _api = 'windowBannerUpdate';
                let paras = new FormData();
                paras.append("id", _self.windowData.id);
                paras.append("startTime", _self.formData.start);
                paras.append("endTime", _self.formData.end);
                _self.$refs.formData.validate((valid) => {
                    if (valid) {
                        _self.formLoading = true;
                        httpPost(_api, paras, _self, function (res) {
                            _self.formLoading = false;
                            try {
                                _self.$refs['formData'].resetFields();
                                _self.$message.success('成功');
                                _self.visible = false;
                                _self.$emit('refresh');
                            } catch (error) {
                                util.jsErrNotify(error);
                            }
                        })

                    }
                });
            },
            setRange(val) { //格式化日期控件值
                let _self = this;
                _self.formData.start = val.substring(0, 19);
                _self.formData.end = val.substring(22);
                _self.formData.time = [_self.formData.start, _self.formData.end];
            },
            resetFormData() { //关闭表格弹窗，重置表格数据
                let _self = this;
                _self.formLoading = false;
                _self.formData = {
                    time: [],
                    start: '',
                    end: ''
                };
                _self.windowData = {};
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

<style>
    .el-date-range-picker {
        width: 515px !important;
    }
</style>
