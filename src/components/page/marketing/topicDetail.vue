<template>
    <el-dialog :title="title" :value="value" v-model="visible" @close="resetFormData">
        <el-form :model="formData" label-width="115px" :rules="formRules" ref="formData" >
            <el-form-item label="起止时间" prop="time">
                <el-date-picker v-model="formData.time" type="datetimerange" :picker-options="pickerOptions"
                                placeholder="选择生效时间" align="center" @change="setRange">
                </el-date-picker>
            </el-form-item>
            <el-form-item label="banner图" required>
                <input type="file" name="file" id="topicFile"/>
                <div class="el-upload__tip" style="line-height: 20px;">
                    宽高要求：750*330
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
        name: 'vTopicDetail',
        props: ['value', 'topicData'],
        data() {
            return {
                visible: false, //默认隐藏
                title: '新增话题banner',
                formLoading: false,
                formRules: {
                    /*time: [
                        {type:'array', required: true, message: '请选择日期', trigger: 'change' }
                    ],*/
                    link: [
                        {required: true, message: '请输入外链地址', trigger: 'blur'},
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
                if (_self.topicData) {
                    _self.title = '编辑话题banner';
                    _self.formData = {
                        id: _self.topicData.id,
                        link: _self.topicData.appLink,
                        time: [_self.topicData.startTime, _self.topicData.endTime],
                        start: _self.topicData.startTime,
                        end: _self.topicData.endTime
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
                let imgFile = document.getElementById('topicFile');
                let _api = 'topicBannerAdd';
                let paras = new FormData();
                if (_self.formData.id) { // 存在id为编辑操作
                    paras.append("id", _self.formData.id);
                    _api = 'topicBannerUpdate';
                } else { // 新增操作图片文件必须存在
                    if (imgFile.files.length == 0) {
                        _self.$message.warning('banner图不能为空');
                        return;
                    }
                }
                if(imgFile.files[0]){
                    paras.append("file", imgFile.files[0]);
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
                let imgFile = document.getElementById('topicFile');
                imgFile.value = '';
                _self.topicData = {};
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
