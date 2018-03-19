<template>
    <section>
        <el-tabs v-model="activeName" @tab-click="changeTab">
            <el-tab-pane label="位置管理" name="list">
                <!--表格-->
                <el-table v-loading="place.loading" :data="place.list" stripe border
                          style="width: 100%;margin-top:10px;">
                    <el-table-column prop="id" label="id"></el-table-column>
                    <el-table-column prop="desc" label="广告位位置"></el-table-column>
                    <el-table-column label="操作">
                        <template scope="scope">
                            <!-- 1 为已启用 -->
                            <el-button :type="scope.row.status == 1 ? 'danger':'success'" size="small"
                                       @click="adOpen(scope.row)">
                                {{ scope.row.status == 1 ? '关闭':'启用' }}
                            </el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </el-tab-pane>
            <el-tab-pane label="内容管理" name="add">
                <el-col :span="24" class="toolbar">
                    <el-form :inline="true">
                        <el-form-item>
                            <el-button type="primary" @click="showForm()">添加</el-button>
                        </el-form-item>
                    </el-form>
                </el-col>
                <!--表格-->
                <el-table v-loading="tableLoading" :data="tableList" :max-height="tableHeight" stripe border
                          style="width: 100%;margin-top:10px;">
                    <el-table-column prop="id" label="id"></el-table-column>
                    <el-table-column prop="imageUrl" label="封面" width="200">
                        <template scope="scope">
                            <img v-if="scope.row.imageUrl !== ''"
                                 style="width: 100%;vertical-align: middle;margin: 5px 0;"
                                 :src="scope.row.imageUrl" alt=""/>
                            <span v-else>图片路径缺失</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作">
                        <template scope="scope">
                            <el-button type="danger" size="small" @click="adContentDel(scope.row)">
                                删除
                            </el-button>
                        </template>
                    </el-table-column>
                </el-table>

                <!--分页-->
                <el-col :span="24" class="mt-10">
                    <el-pagination style="float:right;" @current-change="handleCurrentChange"
                                   :page-size="10" :current-page="page"
                                   layout="total, prev, pager, next, jumper" :total="total">
                    </el-pagination>
                </el-col>
            </el-tab-pane>
        </el-tabs>

        <!-- 添加广告-->
        <el-dialog title="添加视频内容" v-model="formVisible" @close="resetFormData">
            <el-form :model="formData" label-width="80px" :rules="formRules" ref="formData"
                     style="margin-bottom: -20px;">
                <el-form-item label="视频id" prop="id">
                    <el-input placeholder="请输入帖子id" v-model.trim="formData.id" auto-complete="off"></el-input>
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
    import {httpGet, httpPost} from '../../../api/api';

    export default {
        data() {
            return {
                activeName: 'list',
                place: { // 广告位列表
                    loading: false,
                    list: []
                },
                total: 0, //表格列表数据总数
                page: 1, //当前页，默认为第一页
                tableHeight: '100%',
                tableLoading: false, //表格的loading符号
                tableList: [], //表格数据
                formVisible: false,
                formLoading: false,
                formRules: {
                    id: [
                        {required: true, message: '请输入帖子id', trigger: 'blur'}
                    ]
                },
                formData: {
                    id: ''
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
                    _self.contentList(); // 获取广告位内容列表
                }
            },
            handleCurrentChange(val) { //翻页
                this.page = val;
                this.contentList();
            },
            fetchList() {    //获取广告位列表
                let _self = this;
                _self.place.loading = true;
                httpGet('adList', '', _self, function (res) {
                    _self.place.loading = false;
                    try {
                        let {error, status, data} = res;
                        _self.place.list = data.content;
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            contentList() {    //获取广告位列表
                let _self = this;
                _self.tableHeight = document.getElementById('container').clientHeight - 50 - 42 - 15;
                let paras = {
                    offset: 0,
                    size: 10
                };
                paras.offset = (_self.page - 1) * paras.size;
                _self.tableLoading = true;
                httpGet('adContentList', paras, _self, function (res) {
                    _self.tableLoading = false;
                    try {
                        let {error, status, data} = res;
                        _self.total = data.totalElements;
                        _self.tableList = data.content;
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            showForm() { //显示表单
                this.formVisible = true;
            },
            formSubmit() { //提交表格
                let _self = this;
                _self.$refs.formData.validate((valid) => {
                    if (valid) {
                        let paras = {
                            id: _self.formData.id
                        };
                        _self.formLoading = true;
                        httpGet('adContentAdd', paras, _self, function (res) {
                            _self.formLoading = false;
                            try {
                                _self.$message.success('提交成功');
                                _self.$refs['formData'].resetFields();
                                _self.formVisible = false;
                                _self.contentList();
                            } catch (error) {
                                util.jsErrNotify(error);
                            }
                        })
                    }
                });
            },
            resetFormData() {
                let _self = this;
                _self.formLoading = false;
                _self.formData = {
                    id: ''
                };
                _self.$refs['formData'].resetFields();
            },
            adContentDel(row) { // 删除广告内容
                let _self = this;
                _self.$confirm('是否确认移除该视频?', '提示', {
                    type: 'warning'
                }).then(() => {
                    let _self = this;
                    let paras = {id: row.id};
                    _self.tableLoading = true;
                    httpGet('adContentDel', paras, _self, function (res) {
                        _self.tableLoading = false;
                        try {
                            let {error, status, data} = res;
                            _self.$message.success('删除成功');
                            _self.contentList();
                        } catch (error) {
                            util.jsErrNotify(error);
                        }
                    })
                });
            },
            adOpen(row) {
                let _self = this;
                let paras = {
                    id: row.id,
                    operate: Number(!row.status)
                };
                httpGet('adOpen', paras, _self, function (res) {
                    try {
                        let {error, status, data} = res;
                        _self.$message.success('操作成功');
                        row.status = Number(!row.status);
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            }
        },
        mounted() {
            this.fetchList();
        }
    }

</script>
