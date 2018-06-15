<template>
    <el-dialog :title="formTitle" :value="value" v-model="visible" @close="resetFormData">
        <el-form :model="formData" label-width="120px" :rules="formRules" ref="formData">
            <el-form-item label="剧本名称" prop="name">
                <el-input v-model.trim="formData.name" auto-complete="off"></el-input>
            </el-form-item>
            <el-form-item required label="ios最低版本号" prop="iosMinVersion">
                <el-input v-model.trim.number="formData.iosMinVersion" auto-complete="off"></el-input>
            </el-form-item>
            <el-form-item required label="安卓最低版本号" prop="andMinVersion">
                <el-input v-model.trim.number="formData.andMinVersion" auto-complete="off"></el-input>
            </el-form-item>
            <el-form-item label="剧本玩法">
                <el-select v-model="formData.playType" placeholder="请选择" style="width: 50%;">
                    <el-option label="对手戏" value="0"></el-option>
                    <el-option label="蒙太奇" value="1"></el-option>
                    <el-option label="表演型" value="2"></el-option>
                    <el-option label="漫画-表演型" value="3"></el-option>
                    <el-option label="漫画-对手戏" value="4"></el-option>
                </el-select>
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
            <el-form-item label="剧本描述" prop="description">
                <el-input type="textarea" v-model.trim="formData.description"></el-input>
            </el-form-item>
            <el-form-item label="预览视频" required>
                <template>
                    <el-select style="width: 50%;" v-model="formData.previewId" filterable remote
                               loading-text="搜索中" placeholder="输入关键词搜索视频" :remote-method="handleSource"
                               :loading="searchSource.loading" clearable>
                        <el-option v-for="item in searchSource.list" :key="item.id" :label="item.name"
                                   :value="item.id">
                        </el-option>
                    </el-select>
                </template>
            </el-form-item>
            <el-form-item label="视频封面" required>
                <div class="avatar-uploader" style="width: 80%;" @click="chooseFile">
                    <div class="el-upload el-upload--text">
                        <i v-show="avatarLoading" class="el-icon-loading avatar-uploader-icon"></i>
                        <i v-show="!formData.coverImgUrl && !avatarLoading"
                           class="el-icon-plus avatar-uploader-icon"></i>
                        <img v-show="formData.coverImgUrl && !avatarLoading" :src="formData.coverImgUrl"
                             class="avatar">
                        <input type="file" id="cover" class="el-upload__input" @change="fileChange">
                    </div>
                </div>
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
            <el-form-item label="剧本标签" prop="tagIds">
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
            <el-form-item label="剧本属性" prop="attrIds">
                <template>
                    <el-select style="width: 50%;" v-model="formData.playAttrIds" multiple filterable remote
                               loading-text="搜索中" placeholder="输入关键词搜索属性" :remote-method="handleAttr"
                               :loading="searchAttr.loading">
                        <el-option v-for="item in searchAttr.list" :key="item.id" :label="item.name"
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
        props: ['value', 'playData'],
        data() {
            let checkNum = (rule, value, callback) => {
                if(value === ''){
                    callback(new Error('请输入版本号'));
                } else {
                    if(!Number.isInteger(value)){
                        callback(new Error('版本号必须为整数'));
                    } else {
                        callback();
                    }
                } 
            };
            return {
                visible: false, //默认隐藏
                showLoading: false,
                formTitle: '新增剧本',
                formLoading: false,
                formRules: {
                    name: [
                        {required: true, message: '请输入剧本名称', trigger: 'blur'},
                        {min: 1, max: 32, message: '长度在 1 到 32 个字符', trigger: 'blur'}
                    ],
                    description: [
                        {required: true, message: '请输入剧本描述', trigger: 'blur'},
                        {min: 1, max: 64, message: '长度在 1 到 64 个字符', trigger: 'blur'}
                    ],
                    iosMinVersion: [
                        {validator:checkNum,trigger:'blur'}
                    ],
                    andMinVersion: [
                        {validator:checkNum,trigger:'blur'}
                    ]
                },
                formData: {
                    id: '',
                    name: '',
                    coverImgUrl: '', //封面url
                    coverId: '',
                    description: '',
                    previewId: '', //预览视频资源id及name
                    previewName: '',
                    movieIds: [], //电影id及名称
                    movieNames: [],
                    tagIds: [], //标签id及名称
                    tagNames: [],
                    playAttrIds: [], //属性id及名称
                    playAttrNames: [],
                    keyword: [],
                    playType: '0',
                    iosMinVersion: '0',
                    andMinVersion: '0',
                    status: 0
                },
                inputVisible: false, //隐藏、显示关键字输入框
                inputValue: '',
                avatarLoading: false,
                searchMovie: { //搜索相关电影
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
                searchAttr: { //搜索属性
                    loading: false,
                    list: []
                }
            }
        },
        computed: {
            detail() { //返回详情
                let _self = this;
                if(!_self.value){ // 弹窗不显示，不进行请求
                    return false;
                }
                if (_self.playData.id && _self.visible) {
                    _self.formTitle = '编辑剧本';
                    httpGet('contentPlayDetail', {id: _self.playData.id}, _self, function (res) {
                        try {
                            let {error, status, data} = res;
                            _self.formData = Object.assign({}, data);
                            _self.formData.playType = data.playType + '';
                            if (data.keyword != '') {
                                _self.formData.keyword = data.keyword.split(' ');
                            } else {
                                _self.formData.keyword = [];
                            }
                            _self.searchMovie.list = [];
                            _self.searchSource.list = [];
                            _self.searchTag.list = [];
                            _self.searchAttr.list = [];
                            //生成下拉框已选项 电影、视频、标签、属性
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

                            if (_self.formData.previewId) {
                                _self.searchSource.list.push({
                                    name: _self.formData.previewName,
                                    id: _self.formData.previewId
                                });
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
                            if (_self.formData.playAttrIds.length > 0) {
                                let array = _self.formData.playAttrIds;
                                let arrayName = _self.formData.playAttrNames;
                                for (var k = 0, length = array.length; k < length; k++) {
                                    _self.searchAttr.list.push({
                                        name: arrayName[k],
                                        id: array[k]
                                    });
                                }
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
                        _self.formLoading = true;
                        let para = new FormData();
                        para.append("id", _self.formData.id);
                        para.append("name", _self.formData.name);
                        para.append("coverId", _self.formData.coverId);
                        para.append("description", _self.formData.description);
                        para.append("previewId", _self.formData.previewId);
                        para.append("movieIds", _self.formData.movieIds.join(','));
                        para.append("tagIds", _self.formData.tagIds.join(','));
                        para.append("playAttrIds", _self.formData.playAttrIds.join(','));
                        para.append("playType", _self.formData.playType);
                        para.append("kw", _self.formData.keyword.join(' '));
                        para.append("iosMinVersion", _self.formData.iosMinVersion);
                        para.append("andMinVersion", _self.formData.andMinVersion);
                        para.append("status", _self.formData.status);
                        httpPost('contentPlayEdit', para, _self, function (res) {
                            _self.formLoading = false;
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
                _self.searchMovie.loading = true;
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
            handleSource(query) { //搜索视频资源
                let _self = this;
                _self.searchSource.loading = true;
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
                _self.searchTag.loading = true;
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
            handleAttr(query) { //搜索属性
                let _self = this;
                let para = {
                    offset: 0,
                    size: 30,
                    type: '2',
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
            chooseFile() { //触发选择文件
                let fileDom = document.getElementById('cover');
                fileDom.click();
            },
            fileChange() { // 文件变更后操作
                let fileDom = document.getElementById('cover');
                let _self = this;
                if (fileDom.value) { // 如果文件不为空，进行校验和上传操作
                    const _verify = util.imgFileCheck(fileDom);
                    if (_verify) { //文件校验通过，进行上传操作
                        let paras = new FormData();
                        paras.append("imageFile", fileDom.files[0]);
                        _self.avatarLoading = true;
                        httpPost('imgUpload', paras, _self, function (res) {
                            _self.avatarLoading = false;
                            try {
                                let {error, status, data} = res;
                                _self.formData.coverId = data.id;
                                _self.formData.coverImgUrl = URL.createObjectURL(fileDom.files[0]);
                            } catch (error) {
                                util.jsErrNotify(error);
                            }
                        }, function (res) { // 上传失败回调
                            _self.avatarLoading = false;
                            fileDom.value = '';
                            _self.$message.error('上传失败，请重新选择文件');
                        })
                    }
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
                _self.formTitle = '新增剧本';
                _self.formData = {
                    id: '',
                    name: '',
                    coverImgUrl: '', //封面url
                    coverId: '',
                    description: '',
                    previewId: '', //预览视频资源id及name
                    previewName: '',
                    movieIds: [], //电影id及名称
                    movieNames: [],
                    tagIds: [], //标签id及名称
                    tagNames: [],
                    playAttrIds: [], //属性id及名称
                    playAttrNames: [],
                    keyword: [],
                    playType: '0',
                    status: 0
                };
                _self.searchMovie.list = [];
                _self.searchSource.list = [];
                _self.searchTag.list = [];
                _self.searchAttr.list = [];
                document.getElementById('cover').value = '';
                _self.playData = {};
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
