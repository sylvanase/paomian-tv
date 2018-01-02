<template>
    <el-dialog :title="formTitle" :value="value" v-model="visible" @close="resetFormData">
        <el-form :model="formData" label-width="80px" :rules="formRules" ref="formData">
            <el-form-item label="音乐名称" prop="name">
                <el-input v-model.trim="formData.name" auto-complete="off"></el-input>
            </el-form-item>
            <el-form-item label="音乐封面" prop="coverId">
                <div class="avatar-uploader" style="width: 80%;" @click="chooseFile">
                    <div class="el-upload el-upload--text">
                        <i v-show="avatarLoading" class="el-icon-loading avatar-uploader-icon"></i>
                        <i v-show="!formData.coverImgUrl && !avatarLoading"
                           class="el-icon-plus avatar-uploader-icon"></i>
                        <img v-show="formData.coverImgUrl && !avatarLoading" :src="formData.coverImgUrl" class="avatar">
                        <input type="file" id="cover" class="el-upload__input" @change="fileChange">
                    </div>
                </div>
                <el-button type="danger" size="small" @click="resetCoverImg">删除</el-button>
            </el-form-item>
            <el-form-item label="音乐文件" prop="musicId" required>
                <div>
                    <div slot="tip" class="el-upload__tip" style="line-height: 20px;">
                        已选音乐id：<span class="mr-10" v-model="formData.musicId">{{ formData.musicId }}</span>
                        <br/>
                        <a :href="formData.musicUrl" target="_blank">{{ formData.musicUrl }}</a>
                    </div>
                    <input type="file" name="file" id="musicFile" @change="changeFile"/>
                    <el-button style="margin-left: 10px;" size="small" type="success" @click="submitUploadKs">上传到服务器
                    </el-button>
                    <el-progress style="width: 70%;" :percentage="fileUpload.percentage"></el-progress>
                </div>
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
            <el-form-item label="音乐属性" prop="attributeIds">
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
            <el-form-item label="音乐分类" prop="categoryIds">
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
            <el-form-item label="出处" prop="originalSource">
                <el-input v-model.trim="formData.originalSource" auto-complete="off"></el-input>
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
            <el-form-item label="音乐标签" prop="tagIds">
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
    import { httpGet, httpPost} from '../../../api/api';
    import  Ks3 from '../../../../static/js/ksyun/ks3jssdk.js'

    export default {
        name: 'vDetail',
        props: ['value', 'musData'],
        data() {
            return {
                visible: false, //默认隐藏
                showLoading: false,
                formTitle: '新增音乐',
                formLoading: false,
                formRules: {
                    name: [
                        {required: true, message: '请输入音乐名称', trigger: 'blur'},
                        {min: 1, max: 32, message: '长度在 1 到 32 个字符', trigger: 'blur'}
                    ],
                    originalSource: [
                        {min: 1, max: 32, message: '长度在 1 到 32 个字符', trigger: 'blur'}
                    ]
                },
                formData: {
                    id: '',
                    name: '',
                    coverImgUrl: '', //封面url
                    coverId: '',
                    musicId: '', //音乐id
                    musicUrl: '',
                    originalSource: '', //出处
                    movieIds: [], //电影id及名称
                    movieNames: [],
                    attributeIds: [], //属性id及名称
                    attributeNames: [],
                    categoryIds: [], //分类id及名称
                    categoryNames: [],
                    tagIds: [], //标签id及名称
                    tagNames: [],
                    keyword: []
                },
                inputVisible: false, //隐藏、显示关键字输入框
                inputValue: '',
                avatarLoading: false,
                avatarDisabled: false,
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
                searchTag: { //搜索标签
                    loading: false,
                    list: []
                },
                fileUpload: {
                    percentage: 0,
                    name: ''
                }
            }
        },
        computed: {
            detail(){ //返回详情
                let _self = this;
                if (_self.musData.id) {
                    _self.formTitle = '编辑音乐';
                    httpGet('contentMusicDetail', {id: _self.musData.id}, _self, function (res) {
                        try {
                            let { error, status,data } = res;
                            _self.formData.coverImgUrl = '';
                            _self.formData = Object.assign({}, data);
                            if (data.keyword != '') {
                                _self.formData.keyword = data.keyword.split(' ');
                            } else {
                                _self.formData.keyword = [];
                            }
                            _self.searchMovie.list = [];
                            _self.searchAttr.list = [];
                            _self.searchCat.list = [];
                            _self.searchTag.list = [];
                            //生成下拉框已选项 电影、属性、分类
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
                        } catch (error) {
                            util.jsErrNotify(error);
                        }
                    })
                }
                let clearFile = document.getElementById('musicFile');
                if (clearFile) {
                    clearFile.outerHTML = clearFile.outerHTML;
                }
                _self.fileUpload.percentage = 0;
            }
        },
        methods: {
            formSubmit(){ //提交表单
                let _self = this;
                _self.$refs.formData.validate((valid) => {
                    if (valid) {
                        if (_self.formData.musicId == undefined || _self.formData.musicId == '') {
                            _self.$message.warning('请选择音乐文件，并上传');
                            return;
                        }
                        _self.formLoading = true;
                        let para = new FormData();
                        para.append("id", _self.formData.id);
                        para.append("name", _self.formData.name);
                        para.append("coverId", _self.formData.coverId);
                        para.append("musicId", _self.formData.musicId);
                        para.append("originalSource", _self.formData.originalSource);
                        para.append("movieIds", _self.formData.movieIds.join(','));
                        para.append("attributeIds", _self.formData.attributeIds.join(','));
                        para.append("categoryIds", _self.formData.categoryIds.join(','));
                        para.append("tagIds", _self.formData.tagIds.join(','));
                        para.append("kw", _self.formData.keyword.join(' '));
                        httpPost('contentMusicEdit', para, _self, function (res) {
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
            //搜索相关电影操作
            handleMovie(query){
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
                        let { error, status,data } = res;
                        _self.searchMovie.list = data.content;
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            //搜索属性
            handleAttr(query){
                let _self = this;
                _self.searchAttr.loading = true;
                let para = {
                    offset: 0,
                    size: 30,
                    type: '0',
                    id: '',
                    kw: ''
                };
                if (isNaN(query)) { //输入不为数字，值传入kw
                    para.kw = query;
                } else {
                    para.id = query;
                }
                httpGet('contentAttrList', para, _self, function (res) {
                    _self.searchAttr.loading = false;
                    try {
                        let { error, status,data } = res;
                        _self.searchAttr.list = data.content;
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            //搜索分类
            handleCat(query){
                let _self = this;
                _self.searchCat.loading = true;
                let para = {
                    offset: 0,
                    size: 30,
                    type: '0',
                    id: '',
                    kw: ''
                };
                if (isNaN(query)) { //输入不为数字，值传入kw
                    para.kw = query;
                } else {
                    para.id = query;
                }
                httpGet('contentCatList', para, _self, function (res) {
                    _self.searchCat.loading = false;
                    try {
                        let { error, status,data } = res;
                        _self.searchCat.list = data.content;
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            //搜索标签
            handleTag(query){
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
                        let { error, status,data } = res;
                        _self.searchTag.list = data.content;
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            chooseFile(){ //触发选择文件
                let fileDom = document.getElementById('cover');
                fileDom.click();
            },
            fileChange(){ // 文件变更后操作
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
                                let { error, status,data } = res;
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
            resetCoverImg(){ //删除封面
                this.formData.coverImgUrl = '';
                this.formData.coverId = '';
                document.getElementById('cover').value = '';
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
            changeFile(){ //更改视频文件，名称、上传进度、musicId 重置
                this.fileUpload.percentage = 0;
                this.formData.musicId = '';
            },
            submitUploadKs(){ //文件上传至金山
                let file = document.getElementById('musicFile').files[0];
                let _self = this;
                if (!file) { //未选择文件
                    _self.$message({
                        message: '请先选择文件',
                        type: 'error'
                    });
                    return;
                }

                const isMp3 = file.type === 'audio/mp3';
                if (!isMp3) {
                    this.$message.error('只可以上传mp3格式');
                    return;
                }
                let para = {
                    contentType: file.type,
                    fileName: file.name
                };
                httpGet('musicSign', para, _self, function (res) {
                    try {
                        let { error, status,data } = res;
                        Ks3.Ks3.config.baseUrl = data.url;
                        Ks3.Ks3.config.AK = data.formParam.KSSAccessKeyId;
                        Ks3.Ks3.config.bucket = data.bucketName;
                        Ks3.Ks3.putObject({
                            Key: data.formParam.key,
                            File: file,
                            ACL: 'public-read',
                            ProgressListener: progressFunction, //上传进程
                            Signature: data.formParam.signature
                        }, function (err) {
                            if (err) { //上传失败
                                _self.$message({
                                    message: JSON.stringify(err),
                                    type: 'error'
                                });
                                _self.fileUpload.percentage = 0;
                            } else { //上传成功回调
                                var key = Ks3.Ks3.encodeKey(data.formParam.key);
                                var url = Ks3.Ks3.config.protocol + '://' + Ks3.Ks3.config.baseUrl + '/' + Ks3.Ks3.config.bucket + '/' + key;
                                let paras = new FormData();
                                paras.append("objectKey", data.formParam.key);
                                paras.append("name", file.name);
                                httpPost('musicUpload', paras, _self, function (res) {
                                    try {
                                        let { error, status,data } = res;
                                        _self.formData.musicId = data.id;
                                        _self.formData.musicUrl = url;
                                    } catch (error) {
                                        util.jsErrNotify(error);
                                    }
                                })
                            }
                        });
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
                function progressFunction(e) {
                    if (e.lengthComputable) {
                        let percent = parseInt((e.loaded / e.total) * 100);
                        _self.fileUpload.percentage = percent;
                    }
                }
            },
            change() {
                this.visible = false;
            },
            resetFormData(){ //关闭表格弹窗，重置表格数据
                let _self = this;
                _self.formData = {
                    id: '',
                    name: '',
                    coverImgUrl: '', //封面url
                    coverId: '',
                    musicId: '', //音乐id
                    musicUrl: '',
                    originalSource: '', //出处
                    movieIds: [], //电影id及名称
                    movieNames: [],
                    attributeIds: [], //属性id及名称
                    attributeNames: [],
                    categoryIds: [], //分类id及名称
                    categoryNames: [],
                    tagIds: [], //标签id及名称
                    tagNames: [],
                    keyword: []
                };
                _self.searchMovie.list = [];
                _self.searchAttr.list = [];
                _self.searchCat.list = [];
                _self.searchTag.list = [];
                _self.formTitle = '新增音乐';
                document.getElementById('cover').value = '';
                _self.musData = {};
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
