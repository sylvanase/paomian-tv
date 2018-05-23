<template>
    <el-dialog title="点赞" :value="value" v-model="visible" @close="resetFormData" size="tiny">
        <el-form :model="likeData" label-width="80px" :rules="likeRules" ref="likeData"
                 style="margin-bottom: -20px;">
            <el-form-item label="数量" prop="num" style="margin-bottom: -20px;">
                <el-input-number placeholder="请输入点赞数" step="1" :min="0" 
                                 v-model="likeData.num" @keyup.enter.native="formSubmit"></el-input-number>
            </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button size="small" @click.native="change">取消</el-button>
            <el-button size="small" type="primary" @click.native="formSubmit" :loading="likeData.loading">提交
            </el-button>
        </div>
    </el-dialog>
</template>
<script type="es6">
    import util from '../../../api/util'
    import {httpGet, httpPost} from '../../../api/api';

    export default {
        name: 'vLikeAdd',
        props: ['value', 'postsId'],
        data() {
            let validateLike = (rule, value, callback) => {
                if (value === '') {
                    callback(new Error('请输入赞数量'));
                } else {
                    if (value > 100) {
                        callback(new Error('数量不能超过1000!'));
                    }
                }
            };
            return {
                visible: false, //默认隐藏
                likeData: { // 点赞
                    loading: false,
                    num: 0,
                    id: ''
                },
                likeRules: {
                    num: [
                        {validator: validateLike, trigger: 'blur'},
                    ]
                },
            }
        },
        computed: {
            detail() { //返回详情
                let _self = this;
                if (!_self.value) { //不显示的时候不请求详细
                    return;
                }
                _self.likeData.id = _self.postsId; // 需要点赞的帖子id
            }
        },
        methods: {
            change() {
                this.visible = false;
            },
            formSubmit() { //提交表单
                let _self = this;
                let paras = new FormData();
                paras.append("vpId", _self.likeData.id);
                paras.append("num", _self.likeData.num);
                httpPost('postsLike', paras, _self, function (res) {
                    try {
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
                _self.$message.success('已发送点赞请求');
                _self.visible = false;
            },

            resetFormData() { //关闭表格弹窗，重置表格数据
                let _self = this;
                _self.likeData.id = '';
                _self.likeData.num = 0;
                _self.likeData.loading = false;
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
