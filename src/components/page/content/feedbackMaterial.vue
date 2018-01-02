<template>
    <section>
        <!--顶部工具条-->
        <el-col :span="24" class="toolbar" style="padding-bottom: 0;">
            <el-form :inline="true" :model="filters">
                <el-form-item>
                    <el-input v-model="filters.kw" placeholder="请搜索反馈内容" icon="circle-close"
                              :on-icon-click="resetSearch"
                              @keyup.enter.native="fetchList"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="fetchList()">查询</el-button>
                </el-form-item>
            </el-form>
        </el-col>

        <!--表格-->
        <el-table v-loading="tableLoading" class="table-expand" :data="tableList" stripe border style="width: 100%;">
            <el-table-column prop="id" label="id"></el-table-column>
            <el-table-column prop="text" label="反馈内容"></el-table-column>
            <el-table-column prop="nick" label="昵称"></el-table-column>
            <el-table-column prop="uid" label="uid"></el-table-column>
            <el-table-column prop="phone" label="手机号"></el-table-column>
            <el-table-column prop="createTime" label="反馈时间" width="180"></el-table-column>
            <el-table-column label="操作">
                <template scope="scope">
                    <el-button :disabled="scope.row.isReply == 1 ? true: false" size="small"
                               @click="showForm(scope.row)">
                        {{scope.row.isReply == 1 ? '已回复': '回复'}}
                    </el-button>
                </template>
            </el-table-column>
        </el-table>

        <!--工具条-->
        <el-col :span="24" class="mt-10">
            <el-pagination style="float:right;" @current-change="handleCurrentChange"
                           :page-size="10" :current-page="page"
                           layout="total, prev, pager, next, jumper" :total="total">
            </el-pagination>
        </el-col>

        <!--回复反馈-->
        <el-dialog :title="formTitle" v-model="formVisible" @close="resetFormData">
            <el-form :model="formData" label-width="80px" :rules="formRules" ref="formData"
                     style="margin-bottom: -20px;">
                <el-form-item label="回复内容" prop="content">
                    <el-input type="textarea" maxlength="140" v-model.trim="formData.content"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button size="small" @click.native="formVisible = false">取消</el-button>
                <el-button size="small" type="primary" @click.native="formSubmit" :loading="formLoading">提交</el-button>
            </div>
        </el-dialog>
    </section>
</template>

<script type="es6">
    import util from '../../../api/util'
    import {httpGet, httpDel, httpPost} from '../../../api/api';

    export default {
        data() {
            return {
                filters: { //搜索筛选条件
                    kw: '',
                },
                total: 0, //表格列表数据总数
                page: 1, //当前页，默认为第一页
                tableLoading: false, //表格的loading符号
                tableList: [], //表格数据
                videoVisible: false,  //播放视频界面 显示、隐藏
                videoHtml: '',
                formTitle: '回复反馈',
                formVisible: false,//新增界面是否显示
                formLoading: false,
                formRules: {
                    content: [
                        {required: true, message: '请输入回复内容', trigger: 'blur'},
                        {min: 1, max: 140, message: '长度在 1 到 140 个字符', trigger: 'blur'}
                    ]
                },
                formData: {
                    id: '',
                    uid:'',
                    content: '亲爱的面团儿，您期待已久的泡面调料已为您准备好啦！请移步直接拍-加点料-调料架分类内验收享用哦~感谢您对泡面的关注与支持！'
                }
            }
        },
        methods: {
            handleCurrentChange(val) { //翻页
                this.page = val;
                this.fetchList();
            },
            fetchList() { //获取列表
                let _self = this;
                let paras = new FormData();
                paras.append('size', 10);
                paras.append('offset', (_self.page - 1) * 10);
                paras.append('text', _self.filters.kw);
                _self.tableLoading = true;
                httpPost('contentMaterialFeedbackList', paras, _self, function (res) {
                    _self.tableLoading = false;
                    try {
                        let {error, status, data} = res;
                        _self.total = data.totalElements;
                        _self.tableList = data.content.map(function (item) {
                            item.createTime = util.timestampFormat(item.createTime);
                            return item;
                        });
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            resetSearch() {
                this.filters.kw = '';
                this.fetchList();
            },
            showForm(row) { //显示表单
                this.formVisible = true;
                this.formTitle = '回复反馈："' + row.text + '"';
                this.formData.id = row.id;
                this.formData.uid = row.uid;
            },
            formSubmit() { //提交表格
                let _self = this;
                _self.$refs.formData.validate((valid) => {
                    if (valid) {
                        let paras = new FormData();
                        paras.append("id", this.formData.id);
                        paras.append("uid", this.formData.uid);
                        paras.append("content", this.formData.content);
                        _self.formLoading = true;
                        httpPost('contentFeedbackReply', paras, _self, function (res) {
                            _self.formLoading = false;
                            try {
                                _self.$message.success('提交成功');
                                _self.$refs['formData'].resetFields();
                                _self.formVisible = false;
                                _self.fetchList();
                            } catch (error) {
                                util.jsErrNotify(error);
                            }
                        })
                    }
                });
            },
            resetFormData() {
                let _self = this;
                _self.formTitle = '回复反馈';
                _self.formLoading = false;
                _self.formData = {
                    id: '',
                    uid: '',
                    content: '亲爱的面团儿，您期待已久的泡面调料已为您准备好啦！请移步直接拍-加点料-调料架分类内验收享用哦~感谢您对泡面的关注与支持！'
                };
                _self.$refs['formData'].resetFields();
            },
        },
        mounted() {
            this.fetchList();
        }
    }

</script>
