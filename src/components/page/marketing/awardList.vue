<template>
    <section>
        <el-tabs v-model="activeName" @tab-click="changeTab">
            <el-tab-pane label="发奖记录" name="list">
                <el-col :span="24" class="toolbar">
                    <el-form :inline="true" :model="filters">
                        <el-form-item>
                            <el-input v-model="filters.kw" style="width:220px;" placeholder="请输入用户ID" icon="circle-close"
                                      :on-icon-click="resetSearch" @keyup.enter.native="fetchList"></el-input>
                        </el-form-item>
                        <el-form-item>
                            <el-button type="primary" @click="fetchList()">查询</el-button>
                        </el-form-item>
                    </el-form>
                </el-col>
                <!--表格-->
                <el-table v-loading="tableLoading" :data="tableList" :max-height="tableHeight" stripe border
                          style="width: 100%;margin-top:10px;">
                    <el-table-column prop="uid" label="uid"></el-table-column>
                    <el-table-column prop="username" label="用户昵称"></el-table-column>
                    <el-table-column prop="amount" label="发奖金额(元)"></el-table-column>
                    <el-table-column prop="createTime" label="发奖时间"></el-table-column>
                    <el-table-column prop="managerName" label="发奖管理员"></el-table-column>
                </el-table>

                <!--分页-->
                <el-col :span="24" class="mt-10">
                    <el-pagination style="float:right;" @current-change="handleCurrentChange"
                                   :page-size="10" :current-page="page"
                                   layout="total, prev, pager, next, jumper" :total="total">
                    </el-pagination>
                </el-col>
            </el-tab-pane>
            <el-tab-pane label="发奖管理" name="add">
                <el-form :model="formData" label-width="120px" style="margin-top:20px;max-width: 600px;"
                         :rules="formRules"
                         ref="formData">
                    <el-form-item label="用户uid" prop="uid">
                        <el-input type="text" placeholder="请输入用户uid" v-model="formData.uid"></el-input>
                    </el-form-item>
                    <el-form-item label="发奖金额（元）" prop="amount">
                        <el-input type="text" placeholder="请输入发奖金额" v-model="formData.amount"></el-input>
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
                        <el-button size="small" type="primary" @click.native="formSubmit" :loading="formLoading">发送
                        </el-button>
                    </el-form-item>
                </el-form>
            </el-tab-pane>
        </el-tabs>

    </section>
</template>

<script type="es6">
    import util from '../../../api/util'
    import {httpGet, httpPost} from '../../../api/api';

    export default {
        data() {
            return {
                activeName: 'list',
                filters: { //搜索筛选条件
                    kw: ''
                },
                total: 0, //表格列表数据总数
                page: 1, //当前页，默认为第一页
                tableHeight: '100%',
                tableLoading: false, //表格的loading符号
                tableList: [], //表格数据
                formLoading: false,
                formRules: {
                    uid: [
                        {required: true, message: '请输入用户uid', trigger: 'blur'}
                    ],
                    amount: [
                        {required: true, message: '请输入发奖金额', trigger: 'blur'}
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
                    amount: '',
                    title: '',
                    desc: '',
                    link: ''
                }
            }
        },
        methods: {
            changeTab(tab) { // 切换tab
                const _self = this;
                let _name = tab.name;
                if (_name == 'list') {
                    _self.fetchList();
                } else {
                    _self.resetForm(); // 重置新增表单
                }
            },
            handleCurrentChange(val) { //翻页
                this.page = val;
                this.fetchList();
            },
            resetSearch() {
                this.filters.kw = '';
                this.fetchList();
            },
            fetchList() {    //获取列表
                let _self = this;
                _self.tableHeight = document.getElementById('container').clientHeight - 50 - 42 - 15;
                let paras = {
                    offset: 0,
                    size: 10,
                    id: _self.filters.kw
                };
                paras.offset = (_self.page - 1) * paras.size;
                _self.tableLoading = true;
                httpGet('awardList', paras, _self, function (res) {
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
            formSubmit() { //提交表单
                let _self = this;
                let paras = new FormData();
                paras.append("uid", _self.formData.uid);
                paras.append("title", _self.formData.title);
                paras.append("body", _self.formData.desc);
                paras.append("link", _self.formData.link);
                paras.append("amount", _self.formData.amount);
                _self.$refs.formData.validate((valid) => {
                    if (valid) {
                        _self.formLoading = true;
                        httpPost('awardSend', paras, _self, function (res) {
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
            resetForm() { //重置表格数据
                let _self = this;
                _self.formLoading = false;
                _self.formData = {
                    uid: '',
                    amount: '',
                    title: '',
                    desc: '',
                    link: ''
                };
                _self.$refs['formData'].resetFields();
            }
        },
        mounted() {
            this.fetchList();
        }
    }

</script>
