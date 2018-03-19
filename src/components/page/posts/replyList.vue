<template>
    <el-dialog :title="title" :value="value" v-model="visible" @close="resetFormData">
        <!-- 回复列表 -->
        <div class="reply-container" :style="{ maxHeight: maxHeight + 'px' }">
            <ul v-loading="tableLoading">
                <li v-for="item in tableList">
                    <el-row :gutter="15">
                        <el-col :span="3">
                            <img v-if="item.avatarUrl" :src="item.avatarUrl" alt="头像">
                            <img v-else src="../../../../static/img/TV.png" alt="用户头像"/>
                        </el-col>
                        <el-col :span="17">
                            <div v-if="item.replyName != commentData.username">
                                <span class="name">{{ item.username }}</span> 回复 <span
                                class="name">{{ item.replyName }}</span>
                                <span class="time">{{ item.createTime }}</span>
                            </div>
                            <div v-else>
                                <span class="name">{{ item.username }}</span>
                                <span class="time">{{ item.createTime }}</span>
                            </div>
                            <div class="reply-text">
                                {{ item.text }}
                            </div>
                        </el-col>
                        <el-col :span="4">
                            <el-button type="info" size="small" @click="handleReply(item)">回复</el-button>
                        </el-col>
                    </el-row>
                </li>
            </ul>
        </div>
        <!--分页-->
        <el-col :span="24" class="mt-10" style="margin-bottom: 20px;">
            <el-pagination style="float:right;" @current-change="handleCurrentChange"
                           :page-size="10" :current-page="page"
                           layout="total, prev, pager, next, jumper" :total="total">
            </el-pagination>
        </el-col>
        <div class="mt-10" style="clear: both;">
            <el-form :model="formData" label-width="80px" :rules="formRules" ref="formData"
                     style="margin-bottom: -20px;">
                <el-form-item label="评论内容" prop="text">
                    <el-input type="textarea" :rows="2" maxlength="128" :placeholder="formData.placeholder"
                              v-model="formData.text"></el-input>
                </el-form-item>
                <el-form-item style="margin-bottom: 0;">
                    <el-button size="small" @click.native="cleanReply">清空</el-button>
                    <el-button size="small" type="primary" @click.native="onSubmit" :loading="formLoading">提交
                    </el-button>
                </el-form-item>
            </el-form>

        </div>
    </el-dialog>
</template>

<script type="es6">
    import util from '../../../api/util'
    import {httpGet, httpDel, httpPost} from '../../../api/api';

    export default {
        name: 'vReply',
        props: ['value', 'commentData'],
        data() {
            return {
                title: '',
                visible: false, //默认隐藏
                total: 0, //表格列表数据总数
                page: 1, //当前页，默认为第一页
                maxHeight: '',
                tableLoading: true,
                tableList: [],
                formData: {
                    placeholder: '请输入内容',
                    id: '',
                    uid: '',
                    vpId: '',
                    vpUid: '',
                    replyUid: '',
                    text: '',
                    innerId: '',
                    innerUid: ''
                },
                formRules: {
                    text: [
                        {required: true, message: '请输入评论内容', trigger: 'blur'},
                        {min: 1, max: 128, message: '长度在 1 到 128 个字符', trigger: 'blur'}
                    ]
                },
                formLoading: false
            }
        },
        computed: {
            detail() {
                if (!this.value) { //不显示的时候不请求详细
                    return;
                }
                this.tableLoading = true;
                this.tableList = [];
                if (this.commentData) {
                    this.title = '评论人："' + this.commentData.username + '"的评论列表';
                    this.fetchList();
                    this.formData.id = this.commentData.id;
                    this.formData.uid = this.commentData.uid;
                    this.formData.vpId = this.commentData.vpId;
                    this.formData.vpUid = this.commentData.vpUid;
                    this.formData.replyUid = this.commentData.uid; // 默认回复自己
                }
            }
        },
        methods: {
            change() {
                this.visible = false;
            },
            fetchList() {    //获取列表
                let _self = this;
                _self.maxHeight = document.body.clientHeight * 0.8 - 57 - 32 - 170 - 50;
                let paras = {
                    offset: 0,
                    size: 10,
                    id: _self.commentData.id
                };
                paras.offset = (_self.page - 1) * paras.size;
                _self.tableLoading = true;
                httpGet('commentRobotReplyList', paras, _self, function (res) {
                    _self.tableLoading = false;
                    try {
                        let {error, status, data} = res;
                        _self.total = data.totalElements;
                        _self.tableList = data.content.map(function (item) { //格式化显示时间
                            item.createTime = util.timestampFormat(item.createTime);
                            return item;
                        });
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })

            },
            handleCurrentChange(val) { //翻页
                this.page = val;
                this.fetchList();
            },
            handleReply(row) { //指定回复人
                let _self = this;
                _self.formData.placeholder = '回复用户：' + row.username;
                _self.formData.replyUid = row.uid;
                _self.formData.text = '';
                _self.formData.innerId = row.id;
                _self.formData.innerUid = row.uid;
            },
            cleanReply() { // 清空回复内容
                let _self = this;
                _self.formData.replyUid = _self.commentData.uid; // 默认回复自己
                _self.formData.placeholder = '请输入内容';
                _self.formData.text = '';
                _self.formData.innerId = '';
                _self.formData.innerUid = '';
            },
            resetFormData() { //关闭表格弹窗，重置表格数据
                this.formData = {
                    placeholder: '请输入内容',
                    id: '',
                    uid: '',
                    vpId: '',
                    vpUid: '',
                    replyUid: '',
                    text: '',
                    innerId: '',
                    innerUid: ''
                };
                this.$refs['formData'].resetFields();
            },
            onSubmit() {
                let _self = this;
                let paras = {
                    id: _self.formData.id,
                    uid: _self.formData.uid,
                    vpId: _self.formData.vpId,
                    vpUid: _self.formData.vpUid,
                    replyUid: _self.formData.replyUid,
                    text: _self.formData.text
                };
                if (_self.formData.innerId) {
                    paras.innerId = _self.formData.innerId;
                    paras.innerUid = _self.formData.innerUid;
                }
                _self.$refs['formData'].validate((valid) => {
                    if (valid) {
                        _self.formLoading = true;
                        httpGet('commentRobotReplyAdd', paras, _self, function (res) {
                            _self.formLoading = false;
                            try {
                                _self.$message.success('回复成功');
                                _self.fetchList();
                                _self.cleanReply();
                            } catch (error) {
                                util.jsErrNotify(error);
                            }
                        })
                    } else {
                        return false;
                    }
                });
            }
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
    .reply-container {
        overflow: auto;
    }

    .reply-container ul li {
        border-bottom: 1px solid #eee;
        color: #333;
        padding: 5px 10px;
    }

    .reply-container li img {
        width: 50px;
        height: 50px;
        border: 1px solid #eee;
        border-radius: 50%;
    }

    .reply-container li .name {
        color: #eb7350;
        margin-right: 10px;
    }

    .reply-container li .reply-text {
        padding: 10px 0;
    }

    .reply-container li .time {
        margin-left: 20px;
    }

</style>
