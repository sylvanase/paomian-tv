<template>
    <el-dialog :title="formTitle" :value="value" v-model="visible" @close="resetFormData">
        <el-form :model="formData" label-width="80px" :rules="formRules" ref="formData">
            <el-form-item label="片段名称" prop="name">
                <el-input v-model.trim="formData.name" auto-complete="off"></el-input>
            </el-form-item>
            <el-form-item label="相关电影" prop="movieIds">
                <template>
                    <el-select style="width: 50%;" v-model="formData.movieIds" multiple filterable remote
                               loading-text="搜索中" placeholder="输入关键词搜索电影" :remote-method="handleMovie"
                               :loading="searchMovie.loading">
                        <el-option v-for="item in searchMovie.list" :key="item.id" :label="item.name"
                                   :value="item.id">
                        </el-option>
                    </el-select>
                </template>
            </el-form-item>
            <el-form-item label="片段属性" prop="attributeIds">
                <template>
                    <el-select style="width: 50%;" v-model="formData.attributeIds" multiple filterable remote
                               loading-text="搜索中" placeholder="输入关键词搜索属性" :remote-method="handleAttr"
                               :loading="searchAttr.loading">
                        <el-option v-for="item in searchAttr.list" :key="item.id" :label="item.name"
                                   :value="item.id">
                        </el-option>
                    </el-select>
                </template>
            </el-form-item>
            <el-form-item label="片段分类" prop="categoryIds">
                <template>
                    <el-select style="width: 50%;" v-model="formData.categoryIds" multiple filterable remote
                               loading-text="搜索中" placeholder="输入关键词搜索分类" :remote-method="handleCat"
                               :loading="searchCat.loading">
                        <el-option v-for="item in searchCat.list" :key="item.id" :label="item.name"
                                   :value="item.id">
                        </el-option>
                    </el-select>
                </template>
            </el-form-item>
            <el-form-item label="片段类型" prop="showType" required>
                <el-select v-model="formData.showType" placeholder="请选择" style="width: 100px;" @change="handleType">
                    <el-option label="横竖屏" value="0"></el-option>
                    <el-option label="横屏" value="1"></el-option>
                    <el-option label="竖屏" value="2"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="横屏片段" prop="horiVideoId">
                <template>
                    <el-select style="width: 50%;" clearable v-model="formData.horiVideoId" filterable remote
                               loading-text="搜索中" placeholder="输入关键词搜索视频资源" :remote-method="handleSource"
                               :loading="searchSource.loading" :disabled="horDisable" @change="horiChange">
                        <el-option v-for="item in searchSource.list" :key="item.id" :label="item.name"
                                   :value="item.id">
                        </el-option>
                    </el-select>
                </template>
            </el-form-item>
            <el-form-item label="竖屏片段" prop="vertVideoId">
                <template>
                    <el-select style="width: 50%;" clearable v-model="formData.vertVideoId" filterable remote
                               loading-text="搜索中" placeholder="输入关键词搜索视频资源" :remote-method="handleSource"
                               :loading="searchSource.loading" :disabled="vertDisable">
                        <el-option v-for="item in searchSource.list" :key="item.id" :label="item.name"
                                   :value="item.id">
                        </el-option>
                    </el-select>
                </template>
            </el-form-item>
            <el-form-item label="关键字" prop="keyword">
                <el-tag style="margin-right: 10px;" :key="word" v-for="word in formData.keyword" :closable="true"
                        :close-transition="false"
                        @close="closeWord(word)">
                    {{word}}
                </el-tag>
                <el-input style="width: 100px;" class="input-new-tag" v-if="inputVisible" v-model="inputValue"
                          ref="saveTagInput"
                          @keyup.enter.native="handleConfirmWord" @blur="handleConfirmWord">
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInputWord">添加</el-button>
            </el-form-item>
            <el-form-item label="片段标签" prop="tagIds" style="margin-bottom: -20px;">
                <template>
                    <el-select style="width: 50%;" v-model="formData.tagIds" multiple filterable remote
                               loading-text="搜索中" placeholder="输入关键词搜索标签" :remote-method="handleTag"
                               :loading="searchTag.loading">
                        <el-option v-for="item in searchTag.list" :key="item.id" :label="item.name"
                                   :value="item.id">
                        </el-option>
                    </el-select>
                </template>
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
        name: 'vDetail',
        props: ['value', 'matData'],
        data() {
            return {
                visible: false, //默认隐藏
                showLoading: false,
                formTitle: '新增片段',
                formLoading: false,
                formRules: {
                    name: [
                        {required: true, message: '请输入片段名称', trigger: 'blur'},
                        {min: 1, max: 32, message: '长度在 1 到 32 个字符', trigger: 'blur'}
                    ]
                },
                formData: {
                    id: '',
                    name: '',
                    movieIds: [], //电影id及名称
                    movieNames: [],
                    attributeIds: [], //属性id及名称
                    attributeNames: [],
                    categoryIds: [], //分类id及名称
                    categoryNames: [],
                    showType: '0', //默认为横竖屏
                    horiVideoId: '', //横屏
                    horiVideoName: '',
                    vertVideoId: '',
                    vertVideoName: '',
                    tagIds: [], //标签id及名称
                    tagNames: [],
                    keyword: []
                },
                inputVisible: false, //隐藏、显示关键字输入框
                inputValue: '',
                searchMovie: { //搜索相关电影
                    loading: false,
                    list: []
                },
                searchAttr: { //搜索属性
                    loading: false,
                    list: []
                },
                searchCat: { //搜索分类
                    loading: false,
                    list: []
                },
                searchSource: { //搜索资源
                    loading: false,
                    list: []
                },
                searchTag: { //搜索标签
                    loading: false,
                    list: []
                },
                horDisable: false, //横屏
                vertDisable: false //竖屏
            }
        },
        computed: {
            detail(val) { //返回详情
                let _self = this;
                if (!_self.value) { // 弹窗不显示，不进行请求
                    return false;
                }
                if (_self.matData.id) {
                    _self.formTitle = '编辑片段';
                    httpGet('contentMaterialDetail', {id: _self.matData.id}, _self, function (res) {
                        try {
                            let {error, status, data} = res;
                            _self.formData = Object.assign({}, data);
                            if (data.keyword != '') {
                                _self.formData.keyword = data.keyword.split(' ');
                            } else {
                                _self.formData.keyword = [];
                            }
                            _self.searchMovie.list = [];
                            _self.searchAttr.list = [];
                            _self.searchCat.list = [];
                            _self.searchSource.list = [];
                            _self.searchTag.list = []; //先清空选项
                            //生成下拉框已选项 电影、属性、分类、标签
                            if (_self.formData.movieIds.length > 0) {
                                let array = _self.formData.movieIds;
                                let arrayName = _self.formData.movieNames;
                                for (var k = 0, length = array.length; k < length; k++) {
                                    _self.searchMovie.list.push({
                                        name: arrayName[k],
                                        id: array[k]
                                    });
                                }
                            }
                            if (_self.formData.attributeIds.length > 0) {
                                let array = _self.formData.attributeIds;
                                let arrayName = _self.formData.attributeNames;
                                for (var k = 0, length = array.length; k < length; k++) {
                                    _self.searchAttr.list.push({
                                        name: arrayName[k],
                                        id: array[k]
                                    });
                                }
                            }
                            if (_self.formData.categoryIds.length > 0) {
                                let array = _self.formData.categoryIds;
                                let arrayName = _self.formData.categoryNames;
                                for (var k = 0, length = array.length; k < length; k++) {
                                    _self.searchCat.list.push({
                                        name: arrayName[k],
                                        id: array[k]
                                    });
                                }
                            }
                            if (_self.formData.tagIds.length > 0) {
                                let array = _self.formData.tagIds;
                                let arrayName = _self.formData.tagNames;
                                for (var k = 0, length = array.length; k < length; k++) {
                                    _self.searchTag.list.push({
                                        name: arrayName[k],
                                        id: array[k]
                                    });
                                }
                            }
                            _self.formData.showType = data.showType + '';
                            if (_self.formData.horiVideoId == 0) {
                                _self.formData.horiVideoId = '';
                            }
                            if (_self.formData.vertVideoId == 0) {
                                _self.formData.vertVideoId = '';
                            }
                        } catch (error) {
                            util.jsErrNotify(error);
                        }
                    })
                }
            }
        },
        methods: {
            formSubmit() { //提交表单
                let _self = this;
                _self.$refs.formData.validate((valid) => {
                    if (valid) {
                        if (_self.formData.showType == 0) {
                            if (_self.formData.horiVideoId == '' || _self.formData.vertVideoId == '') {
                                _self.$message({
                                    message: '片段类型为横竖屏，横屏片段、竖屏片段不能为空',
                                    type: 'warning'
                                });
                                return;
                            }
                        } else if (_self.formData.showType == 1) {
                            if (_self.formData.horiVideoId == '') {
                                _self.$message({
                                    message: '片段类型为横屏，横屏片段不能为空',
                                    type: 'warning'
                                });
                                return;
                            }
                        } else if (_self.formData.showType == 2) {
                            if (_self.formData.vertVideoId == '') {
                                _self.$message({
                                    message: '片段类型为竖屏，竖屏片段内容不能为空',
                                    type: 'warning'
                                });
                                return;
                            }
                        }
                        _self.formLoading = true;
                        let para = new FormData();
                        para.append("id", _self.formData.id);
                        para.append("name", _self.formData.name);
                        para.append("showType", _self.formData.showType);
                        para.append("horiVideoId", _self.formData.horiVideoId);
                        para.append("vertVideoId", _self.formData.vertVideoId);
                        para.append("movieIds", _self.formData.movieIds.join(','));
                        para.append("attributeIds", _self.formData.attributeIds.join(','));
                        para.append("categoryIds", _self.formData.categoryIds.join(','));
                        para.append("tagIds", _self.formData.tagIds.join(','));
                        para.append("kw", _self.formData.keyword.join(' '));
                        httpPost('contentMaterialEdit', para, _self, function (res) {
                            try {
                                _self.$message.success('提交成功');
                                _self.$refs['formData'].resetFields();
                                _self.visible = false;
                                _self.$emit('refresh');
                            } catch (error) {
                                util.jsErrNotify(error);
                            }
                        })
                    }
                });
            },
            handleMovie(query) { //搜索相关电影操作
                let _self = this;
                let para = {
                    offset: 0,
                    size: 30,
                    id: '',
                    kw: ''
                };
                if (isNaN(query)) { //输入不为数字，值传入kw
                    para.kw = query;
                } else {
                    para.id = query;
                }
                _self.searchMovie.loading = true;
                httpGet('contentMovieList', para, _self, function (res) {
                    _self.searchMovie.loading = false;
                    try {
                        let {error, status, data} = res;
                        _self.searchMovie.list = data.content;
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            handleAttr(query) { //搜索属性
                let _self = this;
                let para = {
                    offset: 0,
                    size: 30,
                    type: '1',
                    id: '',
                    kw: ''
                };
                if (isNaN(query)) { //输入不为数字，值传入kw
                    para.kw = query;
                } else {
                    para.id = query;
                }
                _self.searchAttr.loading = true;
                httpGet('contentAttrList', para, _self, function (res) {
                    _self.searchAttr.loading = false;
                    try {
                        let {error, status, data} = res;
                        _self.searchAttr.list = data.content;
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            handleCat(query) { //搜索分类
                let _self = this;
                let para = {
                    offset: 0,
                    size: 30,
                    type: '1',
                    id: '',
                    kw: ''
                };
                if (isNaN(query)) { //输入不为数字，值传入kw
                    para.kw = query;
                } else {
                    para.id = query;
                }
                _self.searchCat.loading = true;
                httpGet('contentCatList', para, _self, function (res) {
                    _self.searchCat.loading = false;
                    try {
                        let {error, status, data} = res;
                        _self.searchCat.list = data.content;
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            handleSource(query) { //搜索视频资源
                let _self = this;
                let para = {
                    offset: 0,
                    size: 30,
                    id: '',
                    kw: ''
                };
                if (isNaN(query)) { //输入不为数字，值传入kw
                    para.kw = query;
                } else {
                    para.id = query;
                }
                _self.searchSource.loading = true;
                httpGet('contentSourceList', para, _self, function (res) {
                    _self.searchSource.loading = false;
                    try {
                        let {error, status, data} = res;
                        _self.searchSource.list = data.content;
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            handleTag(query) { //搜索标签
                let _self = this;
                let para = {
                    offset: 0,
                    size: 30,
                    id: '',
                    kw: ''
                };
                if (isNaN(query)) { //输入不为数字，值传入kw
                    para.kw = query;
                } else {
                    para.id = query;
                }
                _self.searchTag.loading = true;
                httpGet('contentTagList', para, _self, function (res) {
                    _self.searchTag.loading = false;
                    try {
                        let {error, status, data} = res;
                        _self.searchTag.list = data.content;
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            handleType() { //更改片段类型，重置横竖屏内容
                if (this.formData.showType == '0') { //横竖屏
                    this.horDisable = false;
                    this.vertDisable = false;
                } else if (this.formData.showType == '1') { //横屏类型，竖屏不可用

                    this.horDisable = false;
                    this.vertDisable = true;
                } else if (this.formData.showType == '2') { //竖屏类型，横屏不可用
                    this.horDisable = true;
                    this.vertDisable = false;
                }
            },
            horiChange(val) { // 新增时，更换横屏片段资源时，将名称自动填到片段名称中
                if(val == ''){
                    return false;
                }
                if (this.formData.id == '') {
                    let obj = {};
                    obj = this.searchSource.list.find((item) => {
                        return item.id === val;
                    });
                    this.formData.name = obj.name;
                }
            },
            /*
             * 关键字相关操作
             * */
            closeWord(tag) { //删除关键字
                let word = this.formData.keyword;
                word.splice(word.indexOf(tag), 1);
            },
            showInputWord() { //显示关键字输入框
                this.inputVisible = true;
                this.$nextTick(_ => {
                    this.$refs.saveTagInput.$refs.input.focus();
                });
            },
            handleConfirmWord() { //确认输入的关键字
                let inputValue = this.inputValue;
                let word = this.formData.keyword;
                if (inputValue) {
                    word.push(inputValue);
                }
                this.inputVisible = false;
                this.inputValue = '';
            },
            change() {
                this.visible = false;
            },
            resetFormData() { //关闭表格弹窗，重置表格数据
                let _self = this;
                _self.formLoading = false;
                _self.formTitle = '新增片段';
                _self.formData = {
                    id: '',
                    name: '',
                    movieIds: [], //电影id及名称
                    movieNames: [],
                    attributeIds: [], //属性id及名称
                    attributeNames: [],
                    categoryIds: [], //分类id及名称
                    categoryNames: [],
                    showType: '0', //默认为横竖屏
                    horiVideoId: '', //横屏
                    horiVideoName: '',
                    vertVideoId: '',
                    vertVideoName: '',
                    tagIds: [], //标签id及名称
                    tagNames: [],
                    keyword: []
                };
                _self.horDisable = false;
                _self.vertDisable = false;
                _self.searchMovie.list = [];
                _self.searchAttr.list = [];
                _self.searchCat.list = [];
                _self.searchSource.list = [];
                _self.searchTag.list = [];
                _self.$refs['formData'].resetFields();
                _self.matData = {};
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
