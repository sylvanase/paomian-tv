<template>
    <el-dialog title="评论库列表" :value="value" v-model="visible" @close="resetFormData">
        <el-tabs v-model="activeName" @tab-click="changeTab" style="margin-top: -30px;">
            <el-tab-pane label="通用评论" name="list">
                <el-row :gutter="20" style="margin-top: 0;">
                    <el-col v-if="relationData.play !== null" :span="12">
                        关联剧本：{{ relationData.play }}
                    </el-col>
                    <el-col v-if="relationData.music !== null" :span="12">
                        关联音乐：{{ relationData.music }}
                    </el-col>
                    <el-col v-if="relationData.materials.length > 0" :span="24">
                        关联片段：{{ relationData.materials.join(' , ') }}
                    </el-col>
                </el-row>
                <el-col :span="24" class="toolbar">
                    <el-form :inline="true" :model="filters">
                        <el-form-item>
                            <el-button type="primary" @click="submit()">提交</el-button>
                        </el-form-item>
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
                                <el-option label="非通用评论" value="5"></el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item>
                            <el-button type="primary" @click="fetchList()">查询</el-button>
                        </el-form-item>
                    </el-form>
                </el-col>
                <!--表格-->
                <el-table v-loading="tableLoading" class="tb-edit" :data="tableList" stripe border style="width: 100%;"
                          @selection-change="handleSelectionChange" highlight-current-row>
                    <el-table-column type="selection" width="55"></el-table-column>
                    <el-table-column prop="id" label="id" width="150"></el-table-column>
                    <el-table-column prop="text" label="评论内容(点击进行编辑操作)">
                        <template scope="scope">
                            <el-input size="small" minlength="1" v-model.trim="scope.row.text" placeholder="请输入内容"
                                      @change="handleEdit(scope.row)" v-on:focus="handleFocus(scope.row)"
                                      v-on:blur="handleBlur(scope.row)"></el-input>
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
                         style="margin-top:20px;margin-bottom: -20px;">
                    <el-form-item label="评论内容" prop="text">
                        <el-input type="textarea" :rows="2" v-model.trim="formData.text" maxlength="128"></el-input>
                    </el-form-item>
                    <el-form-item label="关联剧本" prop="playIds">
                        <template>
                            <el-select style="width: 50%;" filterable :remote-method="fetchPlayList"
                                       :loading="playloading" remote v-model="formData.playIds" multiple
                                       placeholder="搜索关联剧本">
                                <el-option v-for="item in playList" :key="item.id" :label="item.name"
                                           :value="item.id">
                                </el-option>
                            </el-select>
                        </template>
                    </el-form-item>
                    <el-form-item label="关联片段" prop="materialIds">
                        <template>
                            <el-select style="width: 50%;" filterable :remote-method="fetchMaterialList"
                                       :loading="materialloading" remote v-model="formData.materialIds" multiple
                                       placeholder="搜索关联片段">
                                <el-option v-for="item in materialList" :key="item.id" :label="item.name"
                                           :value="item.id">
                                </el-option>
                            </el-select>
                        </template>
                    </el-form-item>
                    <el-form-item label="关联音乐" prop="musicIds">
                        <template>
                            <el-select style="width: 50%;" filterable :remote-method="fetchMusicList"
                                       :loading="musicloading" remote v-model="formData.musicIds" multiple
                                       placeholder="搜索关联音乐">
                                <el-option v-for="item in musicList" :key="item.id" :label="item.name"
                                           :value="item.id">
                                </el-option>
                            </el-select>
                        </template>
                    </el-form-item>
                    <el-form-item label="所属分类" prop="attrIds">
                        <template>
                            <el-select style="width: 50%;" v-model="formData.attrIds" multiple
                                       placeholder="选择评论所属分类">
                                <el-option v-for="item in attrList" :key="item.id" :label="item.text"
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
                relationData: {
                    play: '',
                    music: '',
                    materials: []
                }, // 关联关系
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
                    musicIds: [],
                    attrIds: []
                },
                playloading: false,
                playList: [],
                materialloading: false,
                materialList: [],
                musicloading: false,
                musicList: [],
                oldRowText: '',
                initNum: 0,
                attrList: []
            }
        },
        computed: {
            detail() { //返回详情
                let _self = this;
                if (!_self.value) { //不显示的时候不请求详细
                    return;
                }
                if (_self.initNum == 0) {
                    _self.tableList = [];
                    _self.filters = {
                        type: '1',
                        kw: ''
                    };
                    _self.total = 0;
                    _self.page = 1;
                    _self.multipleCommentIds = [];
                    _self.fetchList();
                    _self.initNum = 1;
                    _self.fetchRelation();
                }
            }
        },
        methods: {
            changeTab(tab) {
                const _self = this;
                let _name = tab.name;
                if (_name == 'list') {
                    _self.fetchList();
                } else {
                    if (_self.playList.length == 0) {
                        _self.fetchPlayList();
                    }
                    if (_self.materialList.length == 0) {
                        _self.fetchMaterialList();
                    }
                    if (_self.musicList.length == 0) {
                        _self.fetchMusicList();
                    }
                    _self.fetchAttrList();
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
                    searchType: _self.filters.type,
                    keyWord : '',
                    id:''
                };

                if(_self.filters.type == '5'){ // 如果类型为5的话，查询所有非通用类型评论
                    _self.filters.kw = '';
                }

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
            fetchRelation() { // 获取帖子关系
                let _self = this;
                httpGet('postsCommentRelation', {id: _self.postsData.id}, _self, function (res) {
                    _self.tableLoading = false;
                    try {
                        let {error, status, data} = res;
                        _self.relationData.play = data.relatedPlay;
                        _self.relationData.music = data.relatedMusic;
                        _self.relationData.materials = data.relatedMaterials;
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
                        _self.visible = false;
                        _self.$emit('refresh');
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
            handleFocus(row) { // 存储row的原始数据
                this.oldRowText = row.text;
            },
            handleBlur(row) { // 如果text的值为空，恢复原始值
                if (row.text == '') {
                    row.text = this.oldRowText;
                    this.handleEdit(row);
                }
            },
            fetchPlayList(query) { // 获取剧本数据
                let _self = this;
                _self.playloading = true;
                let paras = {
                    offset: 0,
                    size: 30,
                    id: '',
                    kw: ''
                };
                if (isNaN(query)) { //输入不为数字，值传入kw
                    paras.kw = query;
                } else {
                    paras.id = query;
                }
                httpGet('contentPlayList', paras, _self, function (res) {
                    _self.playloading = false;
                    try {
                        let {data} = res;
                        _self.playList = data.content;
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            fetchMaterialList(query) { // 获取片段数据
                let _self = this;
                _self.materialloading = true;
                let paras = {
                    offset: 0,
                    size: 30,
                    id: '',
                    kw: ''
                };
                if (isNaN(query)) { //输入不为数字，值传入kw
                    paras.kw = query;
                } else {
                    paras.id = query;
                }
                httpGet('contentMaterialList', paras, _self, function (res) {
                    _self.materialloading = false;
                    try {
                        let {data} = res;
                        _self.materialList = data.content;
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            fetchMusicList(query) { // 获取音乐数据
                let _self = this;
                _self.musicloading = true;
                let paras = {
                    offset: 0,
                    size: 30,
                    id: '',
                    kw: ''
                };
                if (isNaN(query)) { //输入不为数字，值传入kw
                    paras.kw = query;
                } else {
                    paras.id = query;
                }
                httpGet('contentMusicList', paras, _self, function (res) {
                    _self.musicloading = false;
                    try {
                        let {data} = res;
                        _self.musicList = data.content;
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            fetchAttrList() { // 获取评论属性
                let _self = this;
                let paras = {
                    offset: 0,
                    size: 999999
                };
                httpGet('commentAttrList', paras, _self, function (res) {
                    try {
                        let {data} = res;
                        _self.attrList = data.content;
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
                    text: '',
                    attrIds: []
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
                        paras.append("attrIds", _self.formData.attrIds);
                        paras.append("vpId", _self.postsData.id);
                        paras.append("vpUid", _self.postsData.uid);
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
            },
            resetFormData() { //关闭表格弹窗，重置表格数据
                let _self = this;
                _self.formLoading = false;
                _self.showLoading = false;
                _self.formData = {
                    text: '',
                    playIds: [],
                    materialIds: [],
                    musicIds: [],
                    attrIds:[]
                };
                _self.playloading = false;
                _self.playList = [];
                _self.materialloading = false;
                _self.materialList = [];
                _self.musicloading = false;
                _self.musicList = [];
                _self.attrList = [];
                _self.oldRowText = '';
                _self.initNum = 0;
                _self.$refs['formData'].resetFields();
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
