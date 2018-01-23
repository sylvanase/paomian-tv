<template>
    <el-dialog title="评论库列表" :value="value" v-model="visible">
        <el-tabs v-model="activeName" @tab-click="changeTab" style="margin-top: -30px;">
            <el-tab-pane label="列表" name="list">
                <el-col :span="24" class="toolbar" style="margin-top: 0;">
                    <el-form :inline="true" :model="filters">
                        <el-form-item>
                            <el-input v-model="filters.kw" placeholder="ID/名称" icon="circle-close"
                                      :on-icon-click="resetSearch" @keyup.enter.native="fetchList"></el-input>
                        </el-form-item>
                        <el-form-item>
                            <el-select v-model="filters.type" @change="fetchList" placeholder="请选择">
                                <el-option label="按评论分类搜" value="1"></el-option>
                                <el-option label="按剧本搜" value="2"></el-option>
                                <el-option label="按片段搜" value="3"></el-option>
                                <el-option label="按音乐搜" value="4"></el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item>
                            <el-button type="primary" @click="fetchList()">查询</el-button>
                        </el-form-item>
                        <el-form-item>
                            <el-button type="primary" @click="submit()">提交</el-button>
                        </el-form-item>
                    </el-form>
                </el-col>
                <!--表格-->
                <el-table v-loading="tableLoading" class="tb-edit" :data="tableList" stripe border style="width: 100%;"
                          @selection-change="handleSelectionChange" highlight-current-row>
                    <el-table-column type="selection" width="55"></el-table-column>
                    <el-table-column prop="id" label="id" width="150"></el-table-column>
                    <el-table-column prop="text" label="评论内容(点击即可进行编辑操作)">
                        <template scope="scope">
                            <el-input size="small" minlength="1" v-model.trim="scope.row.text" placeholder="请输入内容"
                                      @change="handleEdit(scope.row)"></el-input>
                            <span>{{scope.row.text}}</span>
                        </template>
                    </el-table-column>
                </el-table>
                <!--工具条-->
                <el-col :span="24" class="mt-10" style="margin-bottom: 20px;">
                    <el-pagination style="float:right;" @current-change="handleCurrentChange"
                                   :page-size="10" :current-page="page"
                                   layout="total, prev, pager, next, jumper" :total="total">
                    </el-pagination>
                </el-col>
            </el-tab-pane>
            <el-tab-pane label="新增评论" name="add">
                <el-form :model="formData" label-width="80px" :rules="formRules" ref="formData"
                         style="margin-bottom: -20px;">
                    <el-form-item label="评论内容" prop="text">
                        <el-input type="textarea" :rows="2" v-model.trim="formData.text" maxlength="128"></el-input>
                    </el-form-item>
                    <el-form-item label="关联剧本" prop="playIds">
                        <template>
                            <el-select style="width: 50%;" filterable v-model="formData.playIds" multiple
                                       placeholder="选择关联剧本">
                                <el-option v-for="item in playList" :key="item.id" :label="item.name"
                                           :value="item.id">
                                </el-option>
                            </el-select>
                        </template>
                    </el-form-item>
                    <el-form-item label="关联片段" prop="materialIds">
                        <template>
                            <el-select style="width: 50%;" filterable v-model="formData.materialIds" multiple
                                       placeholder="选择关联片段">
                                <el-option v-for="item in materialList" :key="item.id" :label="item.name"
                                           :value="item.id">
                                </el-option>
                            </el-select>
                        </template>
                    </el-form-item>
                    <el-form-item label="关联音乐" prop="musicIds">
                        <template>
                            <el-select style="width: 50%;" filterable v-model="formData.musicIds" multiple
                                       placeholder="选择关联音乐">
                                <el-option v-for="item in musicList" :key="item.id" :label="item.name"
                                           :value="item.id">
                                </el-option>
                            </el-select>
                        </template>
                    </el-form-item>
                    <el-form-item>
                        <el-button size="small" type="primary" @click.native="addComment" :loading="formLoading">提交
                        </el-button>
                    </el-form-item>
                </el-form>
            </el-tab-pane>
        </el-tabs>
    </el-dialog>
</template>

<script type="es6">
    import util from '../../../api/util'
    import {httpGet, httpPost} from '../../../api/api';

    export default {
        name: 'vCommentAdd',
        props: ['value', 'postsData'],
        data() {
            return {
                visible: false, //默认隐藏
                showLoading: false,
                activeName: 'list',
                tableLoading: false, //表格的loading符号
                tableList: [], //表格数据
                filters: { //搜索筛选条件
                    type: '1',
                    kw: ''
                },
                total: 0, //表格列表数据总数
                page: 1, //当前页，默认为第一页
                multipleCommentIds: [], //添加的评论id集合
                formLoading: false,
                formRules: {
                    text: [
                        {required: true, message: '请输入评论内容', trigger: 'blur'},
                        {min: 1, max: 128, message: '长度在 1 到 128 个字符', trigger: 'blur'}
                    ]
                },
                formData: {
                    text: '',
                    playIds: [],
                    materialIds: [],
                    musicIds: []
                },
                playList: [],
                materialList: [],
                musicList: []
            }
        },
        computed: {
            detail() { //返回详情
                if (!this.value) { //不显示的时候不请求详细
                    return;
                }
                this.tableLoading = true;
                this.tableList = [];
                this.fetchList();
                this.fetchPlayList();
                this.fetchMaterialList();
                this.fetchMusicList();
            }
        },
        methods: {
            changeTab(tab) {
                const _self = this;
                let _name = tab.name;
                if (_name == 'list') {
                    _self.fetchList();
                } else {
                    _self.resetForm(); // 重置新增评论表单
                }
            },
            handleCurrentChange(val) { //翻页
                this.page = val;
                this.fetchList();
            },
            change() {
                this.visible = false;
            },
            resetSearch() {
                this.filters.kw = '';
                this.fetchList();
            },
            fetchList() {    //获取评论库列表
                let _self = this;
                let paras = {
                    offset: 0,
                    size: 10,
                    searchType: _self.filters.type
                };
                if (isNaN(_self.filters.kw)) { //输入不为数字，值传入kw
                    paras.keyWord = _self.filters.kw;
                } else {
                    paras.id = _self.filters.kw;
                }
                paras.offset = (_self.page - 1) * paras.size;
                _self.tableLoading = true;
                httpGet('commentListSearch', paras, _self, function (res) {
                    _self.tableLoading = false;
                    try {
                        let {error, status, data} = res;
                        _self.tableList = data.content;
                        _self.total = data.totalElements;
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            submit() { //提交所选评论
                let _self = this;
                let paras = new FormData();
                paras.append("vpId", _self.postsData.id);
                paras.append("barrageIds", _self.multipleCommentIds.join(','));
                httpPost('postsBarrageAdd', paras, _self, function (res) {
                    try {
                        _self.$message.success('增加评论成功');
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            handleSelectionChange(val) { //选择评论更改时
                //val为对象数组
                this.multipleCommentIds = []; //先清空数组
                if (val.length !== 0) {
                    for (var i = 0; i < val.length; i++) {
                        this.multipleCommentIds.push(val[i].id);
                    }
                }
            },
            handleEdit(row) { // 编辑评论
                let _self = this;
                let paras = new FormData();
                paras.append("id", row.id);
                paras.append("text", row.text);
                httpPost('commentEdit', paras, _self, function (res) {
                    try {

                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            fetchPlayList() { // 获取剧本数据
                let _self = this;
                let para = {
                    offset: 0,
                    size: 9999
                };
                httpGet('contentPlayList', para, _self, function (res) {
                    try {
                        let {data} = res;
                        _self.playList = data.content;
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            fetchMaterialList() { // 获取片段数据
                let _self = this;
                let para = {
                    offset: 0,
                    size: 9999
                };
                httpGet('contentMaterialList', para, _self, function (res) {
                    try {
                        let {data} = res;
                        _self.materialList = data.content;
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            fetchMusicList() { // 获取音乐数据
                let _self = this;
                let para = {
                    offset: 0,
                    size: 9999
                };
                httpGet('contentMusicList', para, _self, function (res) {
                    try {
                        let {data} = res;
                        _self.musicList = data.content;
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            resetForm() {
                this.formData = {
                    playIds: [],
                    materialIds: [],
                    musicIds: [],
                    text: ''
                };
                this.$refs['formData'].resetFields();
            },
            addComment() {  // 新增评论
                let _self = this;
                _self.$refs['formData'].validate((valid) => {
                    if (valid) {
                        let paras = new FormData();
                        paras.append("text", _self.formData.text);
                        paras.append("playIds", _self.formData.playIds);
                        paras.append("materialIds", _self.formData.materialIds);
                        paras.append("musicIds", _self.formData.musicIds);
                        _self.formLoading = true;
                        httpPost('commentAdd', paras, _self, function (res) {
                            _self.formLoading = false;
                            try {
                                _self.$message.success('提交成功');
                                _self.$refs['formData'].resetFields();
                                _self.resetForm();
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
    .tb-edit .el-input {
        display: none
    }

    .tb-edit .current-row .el-input {
        display: block
    }

    .tb-edit .current-row .el-input + span {
        display: none
    }
</style>
