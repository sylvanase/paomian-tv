<template>
    <section>
        <!--顶部工具条-->
        <el-col :span="24" class="toolbar" style="padding-bottom: 0;">
            <el-form :inline="true" :model="filters">
                <el-form-item>
                    <el-input v-model="filters.kw" placeholder="ID/名称"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-select v-model="filters.type" @change="fetchList" placeholder="请选择" style="width: 150px;">
                        <el-option label="按音乐搜" value="0"></el-option>
                        <el-option label="按电影搜" value="1"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-select v-model="filters.attr" @change="fetchList" placeholder="请选择" style="width: 150px;">
                        <el-option label="全部属性" value=""></el-option>
                        <el-option v-for="item in attrSelect" :key="item.id" :label="item.name"
                                   :value="item.id">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-select v-model="filters.category" @change="fetchList" placeholder="请选择" style="width: 150px;">
                        <el-option label="全部分类" value=""></el-option>
                        <el-option v-for="item in catSelect" :key="item.id" :label="item.name"
                                   :value="item.id">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="fetchList()">查询</el-button>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="showForm('-1')">新增</el-button>
                </el-form-item>
            </el-form>
        </el-col>

        <!--表格-->
        <el-table v-loading="tableLoading" class="table-expand" :data="tableList" stripe border style="width: 100%;">
            <el-table-column prop="id" label="id" width="100"></el-table-column>
            <el-table-column prop="name" label="音乐名称"></el-table-column>
            <el-table-column prop="duration" label="时长" width="130">
            </el-table-column>
            <el-table-column label="属性">
                <template scope="props">
                    {{ props.row.attributeNames.join(' , ') }}
                </template>
            </el-table-column>
            <el-table-column label="分类">
                <template scope="props">
                    {{ props.row.categoryNames.join(' , ') }}
                </template>
            </el-table-column>
            <el-table-column label="相关电影">
                <template scope="props">
                    {{ props.row.movieNames.join(' , ') }}
                </template>
            </el-table-column>
            <el-table-column label="使用统计">
                <template scope="scope">
                    {{ scope.row.useCount ? scope.row.useCount : '0' }}次/{{ scope.row.userCount ? scope.row.userCount : '0'}}人
                </template>
            </el-table-column>
            <el-table-column label="操作" width="200">
                <template scope="scope">
                    <el-button size="small" type="info" @click="playMusic(scope.row)">预览</el-button>
                    <el-button size="small" @click="showForm(scope.$index, scope.row)">编辑</el-button>
                    <el-button type="danger" size="small" @click="handleTableDel(scope.$index, scope.row)">删除
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

        <!--播放弹窗-->
        <el-dialog :title="musicTitle" v-model="musicVisible" @close="musicClose()">
            <div style="text-align: center;" v-html="musicHtml"></div>
        </el-dialog>

        <!--新建/编辑-->
        <el-dialog :title="formTitle" v-model="formVisible" :close-on-click-modal="false" @close="resetFormData">
            <el-form :model="formData" label-width="80px" :rules="formRules" ref="formData">
                <el-form-item label="音乐名称" prop="name">
                    <el-input v-model.trim="formData.name" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="音乐封面" prop="coverId">
                    <div class="avatar-uploader" style="width: 80%;" @click="chooseFile">
                        <div class="el-upload el-upload--text">
                            <i v-show="avatarLoading"class="el-icon-loading avatar-uploader-icon"></i>
                            <i v-show="!formData.coverImgUrl && !avatarLoading" class="el-icon-plus avatar-uploader-icon"></i>
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
                <el-button size="small" @click.native="formVisible = false">取消</el-button>
                <el-button size="small" type="primary" @click.native="formSubmit" :loading="formLoading">提交</el-button>
            </div>
        </el-dialog>
    </section>
</template>

<script type="es6">
    import util from '../../../api/util'
    import { httpGet, httpDel, httpPost} from '../../../api/api';
    import  Ks3 from '../../../../static/js/ksyun/ks3jssdk.js'

    export default {
        data() {
            return {
                filters: { //搜索筛选条件
                    type: '0',
                    attr: '', //属性
                    category: '', //分类
                    kw: '',
                    id: ''
                },
                total: 0, //表格列表数据总数
                page: 1, //当前页，默认为第一页
                attrSelect: '', //属性列表
                catSelect: '', //分类列表
                tableLoading: false, //表格的loading符号
                tableList: [], //表格数据
                formTitle: '',
                formVisible: false,//新增界面是否显示
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
                },
                musicTitle:'音乐播放',
                musicVisible: false,  //播放音乐界面 显示、隐藏
                musicHtml: ''
            }
        },
        methods: {
            handleCurrentChange(val) { //翻页
                this.page = val;
                this.fetchList();
            },
            //获取列表
            fetchList() {
                let _self = this;
                let para = {
                    type: _self.filters.type,
                    attrId: _self.filters.attr,
                    catId: _self.filters.category,
                    offset: 0,
                    size: 10,
                    id: '',
                    kw: ''
                };
                if (isNaN(_self.filters.kw)) { //输入不为数字，值传入kw
                    para.kw = _self.filters.kw;
                } else {
                    para.id = _self.filters.kw;
                }
                para.offset = (_self.page - 1) * para.size;
                _self.tableLoading = true;
                httpGet('contentMusicList', para, _self, function (res) {
                    _self.tableLoading = false;
                    try {
                        let { error, status,data } = res;
                        _self.total = data.totalElements;
                        _self.tableList = data.content.map(function (item) {
                            item.duration = util.fileDuration(item.duration);
                            return item;
                        });
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            attrList(){
                let _self = this;
                let para = {
                    type: '0',
                    status: '',
                    offset: 0,
                    size: 99999
                };
                httpGet('contentAttrList', para, _self, function (res) {
                    try {
                        let { error, status,data } = res;
                        _self.attrSelect = data.content;
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            catList(){
                let _self = this;
                let para = {
                    type: '0',
                    status: '',
                    offset: 0,
                    size: 99999
                };
                httpGet('contentCatList', para, _self, function (res) {
                    try {
                        let { error, status,data } = res;
                        _self.catSelect = data.content;
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            playMusic(row){ //播放音乐
                this.musicVisible = true;
                this.musicTitle = row.name;
                this.musicHtml = '<audio controls="controls" src="'+ row.musicUrl +'" autoplay="autoplay" preload="auto"></audio>';
            },
            musicClose(){
                this.musicHtml = '';
            },
            showForm (index, row){ //显示表单
                let _self = this;
                _self.formVisible = true;
                if (index == -1) { //索引为-1时，新增操作
                    _self.formTitle = '新增音乐';
                } else {
                    _self.formTitle = '编辑音乐';
                    httpGet('contentMusicDetail', {id: row.id}, _self, function (res) {
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
                document.getElementById('cover').value = '';
            },
            formSubmit(){ //提交表格
                this.$refs.formData.validate((valid) => {
                    if (valid) {
                        let _self = this;
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
                                let { error, status,data } = res;
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
            //删除表格数据
            handleTableDel: function (index, row) {
                let _self = this;
                _self.tableLoading = true;
                httpDel('contentMusicDel', {id: row.id}, _self, function (res) {
                    _self.tableLoading = false;
                    try {
                        let { error, status,data } = res;
                        _self.$message.success('删除成功');
                        _self.fetchList();
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
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
                        },function (res) { // 上传失败回调
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
                let file = document.getElementsByName('file')[1].files[0];
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
            }
        },
        mounted() {
            this.fetchList();
            this.attrList();
            this.catList();
        }
    }


</script>

<style>
    /*
        表格展开部分样式
    */
    .table-expand label {
        width: 90px;
        color: #99a9bf;
    }

    .table-expand .el-form-item {
        margin-right: 0;
        margin-bottom: 0;
        width: 100%;
    }

</style>
