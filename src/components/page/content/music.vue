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
            <el-table-column type="expand">
                <template scope="props">
                    <el-form label-position="left" class="table-expand">
                        <el-form-item label="音乐属性：">
                            <span>{{ props.row.attributeNames.join(' , ') }}</span>
                        </el-form-item>
                        <el-form-item label="音乐分类：">
                            <span>{{ props.row.categoryNames.join(' , ') }}</span>
                        </el-form-item>
                        <el-form-item label="相关电影：">
                            <span>{{ props.row.movieNames.join(' , ') }}</span>
                        </el-form-item>
                    </el-form>
                </template>
            </el-table-column>
            <el-table-column prop="id" label="id" width="100"></el-table-column>
            <el-table-column prop="name" label="音乐名称"></el-table-column>
            <el-table-column prop="duration" label="时长" width="150">
            </el-table-column>
            <el-table-column label="操作" width="350">
                <template scope="scope">
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

        <!--新建/编辑-->
        <el-dialog :title="formTitle" v-model="formVisible" :close-on-click-modal="false">
            <el-form :model="formData" label-width="80px" :rules="formRules" ref="formData">
                <el-form-item label="音乐名称" prop="name">
                    <el-input v-model.trim="formData.name" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="音乐封面" prop="coverId">
                    <el-upload style="width: 80%;" :disabled="avatarDisabled" class="avatar-uploader" ref="upload"
                               action="" :show-file-list="false" :on-change="avatarChange" :auto-upload="false">
                        <img v-if="formData.coverImgUrl" v-model="formData.coverId" :src="formData.coverImgUrl"
                             class="avatar">
                        <i v-else class="el-icon-plus avatar-uploader-icon"></i>
                    </el-upload>
                    <el-button :loading="avatarLoading" class="mb-10" type="primary" size="small" @click="submitUpload">
                        上传
                    </el-button>
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
    import { tableListApi, tableDelApi, tableEditApi, tableDetailApi, imgUploadApi, signatureApi, uploadCallbackApi} from '../../../api/api';
    import  Ks3 from '../../../../static/js/ksyun/ks3jssdk.js'

    export default {
        data() {
            return {
                api: 'music',
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
                }
            }
        },
        methods: {
            handleCurrentChange(val) { //翻页
                this.page = val;
                this.fetchList();
            },
            //获取列表
            fetchList() {
                let para = {
                    type: this.filters.type,
                    attrId: this.filters.attr,
                    catId: this.filters.category,
                    offset: 0,
                    size: 10,
                    id: '',
                    kw: ''
                };
                if (isNaN(this.filters.kw)) { //输入不为数字，值传入kw
                    para.kw = this.filters.kw;
                } else {
                    para.id = this.filters.kw;
                }
                para.offset = (this.page - 1) * para.size;
                this.tableLoading = true;
                tableListApi(this.api, para).then((res) => {
                    let { error, status,data } = res;
                    if (status !== 0) {
                        if (status == 403) { //返回403时，重新登录
                            sessionStorage.removeItem('user');
                            this.$router.push('/login');
                        } else {
                            this.$message.error(error);
                        }
                    } else {
                        this.total = data.totalElements;
                        this.tableList = data.content.map(function (item) {
                            var html, //计算时长
                                s = (item.duration % 60).toFixed(1),
                                min = parseInt(item.duration / 60),
                                h;
                            if (0 < min < 60) {
                                html = min + ' 分 ' + s + ' 秒 ';
                            } else if (min >= 60) {
                                h = parseInt(min / 60);
                                min = min % 60;
                                html = h + ' 小时 ' + min + ' 分 ' + s + ' 秒 ';
                            }
                            item.duration = html;
                            return item;
                        });
                        this.tableLoading = false;
                    }
                });
            },
            attrList(){
                let para = {
                    type: '0',
                    status: '',
                    offset: 0,
                    size: 99999
                };
                this.tableLoading = true;
                tableListApi('attribute', para).then((res) => {
                    let { error, status,data } = res;
                    if (status !== 0) {
                        if (status == 403) { //返回403时，重新登录
                            sessionStorage.removeItem('user');
                            this.$router.push('/login');
                        } else {
                            this.$message.error(error);
                        }
                    } else {
                        this.attrSelect = data.content;
                    }
                });
            },
            catList(){
                let para = {
                    type: '0',
                    status: '',
                    offset: 0,
                    size: 99999
                };
                this.tableLoading = true;
                tableListApi('category', para).then((res) => {
                    let { error, status,data } = res;
                    if (status !== 0) {
                        if (status == 403) { //返回403时，重新登录
                            sessionStorage.removeItem('user');
                            this.$router.push('/login');
                        } else {
                            this.$message.error(error);
                        }
                    } else {
                        this.catSelect = data.content;
                    }
                });
            },
            showForm (index, row){ //显示表单
                this.formVisible = true;
                if (index == -1) { //索引为-1时，新增操作
                    this.formTitle = '新增音乐';
                    this.formData = {
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
                    this.searchMovie.list = [];
                    this.searchAttr.list = [];
                    this.searchCat.list = [];
                    this.searchTag.list = [];
                } else {
                    this.formTitle = '编辑音乐';
                    let para = {id: row.id};
                    tableDetailApi(this.api, para).then((res) => {
                        let { error, status,data } = res;
                        this.formData.coverImgUrl = '';
                        this.formData = Object.assign({}, data);
                        if (data.keyword != '') {
                            this.formData.keyword = data.keyword.split(' ');
                        } else {
                            this.formData.keyword = [];
                        }
                        this.searchMovie.list = [];
                        this.searchAttr.list = [];
                        this.searchCat.list = [];
                        this.searchTag.list = [];
                        //生成下拉框已选项 电影、属性、分类
                        if (this.formData.movieIds.length > 0) {
                            let array = this.formData.movieIds;
                            let arrayName = this.formData.movieNames;
                            for (var k = 0, length = array.length; k < length; k++) {
                                this.searchMovie.list.push({
                                    name: arrayName[k],
                                    id: array[k]
                                });
                            }
                        }
                        if (this.formData.attributeIds.length > 0) {
                            let array = this.formData.attributeIds;
                            let arrayName = this.formData.attributeNames;
                            for (var k = 0, length = array.length; k < length; k++) {
                                this.searchAttr.list.push({
                                    name: arrayName[k],
                                    id: array[k]
                                });
                            }
                        }
                        if (this.formData.categoryIds.length > 0) {
                            let array = this.formData.categoryIds;
                            let arrayName = this.formData.categoryNames;
                            for (var k = 0, length = array.length; k < length; k++) {
                                this.searchCat.list.push({
                                    name: arrayName[k],
                                    id: array[k]
                                });
                            }
                        }
                        if (this.formData.tagIds.length > 0) {
                            let array = this.formData.tagIds;
                            let arrayName = this.formData.tagNames;
                            for (var k = 0, length = array.length; k < length; k++) {
                                this.searchTag.list.push({
                                    name: arrayName[k],
                                    id: array[k]
                                });
                            }
                        }
                    });
                }
                let clearFile = document.getElementById('musicFile');
                if (clearFile) {
                    clearFile.outerHTML = clearFile.outerHTML;
                }
                this.fileUpload.percentage = 0;
            },
            formSubmit(){ //提交表格
                this.$refs.formData.validate((valid) => {
                    if (valid) {
                        if (this.formData.musicId == undefined || this.formData.musicId == '') {
                            this.$message.warning('请选择音乐文件，并上传');
                            return;
                        }
                        this.formLoading = true;
                        let para = new FormData();
                        para.append("id", this.formData.id);
                        para.append("name", this.formData.name);
                        para.append("coverId", this.formData.coverId);
                        para.append("musicId", this.formData.musicId);
                        para.append("originalSource", this.formData.originalSource);
                        para.append("movieIds", this.formData.movieIds.join(','));
                        para.append("attributeIds", this.formData.attributeIds.join(','));
                        para.append("categoryIds", this.formData.categoryIds.join(','));
                        para.append("tagIds", this.formData.tagIds.join(','));
                        para.append("kw", this.formData.keyword.join(' '));
                        tableEditApi(this.api, para).then((res) => {
                            this.formLoading = false;
                            let { error, status } = res;
                            if (status !== 0) {
                                if (status == 403) { //返回403时，重新登录
                                    sessionStorage.removeItem('user');
                                    this.$router.push('/login');
                                } else {
                                    this.$message.error(error);
                                }
                            } else {
                                this.$message.success('提交成功');
                                this.$refs['formData'].resetFields();
                                this.formVisible = false;
                                this.fetchList();
                            }
                        });

                    }
                });
            },
            //删除表格数据
            handleTableDel: function (index, row) {
                this.$confirm('确认删除该记录吗?', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.tableLoading = true;
                    let para = {id: row.id};
                    tableDelApi(this.api, para).then((res) => {
                        this.tableLoading = false;
                        let { error, status } = res;
                        if (status !== 0) {
                            if (status == 403) { //返回403时，重新登录
                                sessionStorage.removeItem('user');
                                this.$router.push('/login');
                            } else {
                                this.$message.error(error);
                            }
                        } else {
                            this.$message.success('删除成功');
                            this.fetchList();
                        }
                    });
                })
            },
            /*
             * 搜索相关电影操作
             * */
            handleMovie(query){
                this.searchMovie.loading = true;
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
                tableListApi('movie', para).then((res) => {
                    let { error, status,data } = res;
                    this.searchMovie.loading = false;
                    this.searchMovie.list = data.content;
                });
            },
            /*
             * 搜索属性
             * */
            handleAttr(query){
                this.searchAttr.loading = true;
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
                tableListApi('attribute', para).then((res) => {
                    let { error, status,data } = res;
                    this.searchAttr.loading = false;
                    this.searchAttr.list = data.content;
                });
            },
            /*
             * 搜索分类
             * */
            handleCat(query){
                this.searchCat.loading = true;
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
                tableListApi('category', para).then((res) => {
                    let { error, status,data } = res;
                    this.searchCat.loading = false;
                    this.searchCat.list = data.content;
                });
            },
            /*
             * 搜索标签
             * */
            handleTag(query){
                this.searchTag.loading = true;
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
                tableListApi('tag', para).then((res) => {
                    let { error, status,data } = res;
                    this.searchTag.loading = false;
                    this.searchTag.list = data.content;
                });
            },
            /*
             * 封面选择相关操作
             * */
            avatarChange(file){ //更改图片时,重置预览文件路径
                this.formData.coverImgUrl = file.url;
            },
            resetCoverImg(){ //删除封面
                this.formData.coverImgUrl = '';
                this.formData.coverId = '';
            },
            beforeAvatarUpload(file) { //上传前校验
                const isType = file.type.substring(0, 5);
                const isJPG = isType === 'image';
                const isLt2M = file.size / 1024 / 1024 <= 10;

                if (!isJPG) {
                    this.$message.warning('封面文件必须是图片类型!');
                }
                if (!isLt2M) {
                    this.$message.warning('上传图片大小不能超过 10MB!');
                }
                return isJPG && isLt2M;
            },
            submitUpload() { //上传图片
                let file = document.getElementsByName('file')[0].files;
                if (file.length == 0) { //file为空，提示并返回
                    this.$message.warning('请选择文件');
                    return;
                }
                var imgFile = document.getElementsByName('file')[0].files[0];
                if (!this.beforeAvatarUpload(imgFile)) {
                    return;
                }
                let para = new FormData();
                para.append("imageFile", imgFile);
                imgUploadApi(para).then((res) => {
                    this.avatarDisabled = true;
                    this.avatarLoading = true;
                    let { error, status, data } = res;
                    if (status !== 0) {
                        if (status == 403) { //返回403时，重新登录
                            sessionStorage.removeItem('user');
                            this.$router.push('/login');
                        } else {
                            this.$message.error(error);
                        }
                    } else {
                        //上传图片成功回调
                        this.handleAvatarSuccess(data);
                    }
                });
            },
            handleAvatarSuccess(res) { //上传成功后操作
                this.$message.success('上传图片成功');
                this.avatarDisabled = false;
                this.avatarLoading = false;
                this.formData.coverId = res.id;
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
                //服务器端获取上传所需签名
                signatureApi('music', para).then((res) => {
                    let { error, status,data } = res;
                    if (status !== 0) {
                        if (status == 403) { //返回403时，重新登录
                            sessionStorage.removeItem('user');
                            _self.$router.push('/login');
                        } else {
                            _self.$message.error(error);
                        }
                    } else {
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
                                uploadCallbackApi('music', paras).then((res) => {
                                    let { error, status,data } = res;
                                    if (status !== 0) {
                                        if (status == 403) { //返回403时，重新登录
                                            sessionStorage.removeItem('user');
                                            _self.$router.push('/login');
                                        } else {
                                            _self.$message.error(error);
                                        }
                                    } else {
                                        _self.formData.musicId = data.id;
                                        _self.formData.musicUrl = url;
                                    }
                                });
                            }
                        });
                    }
                });
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

    /*
        封面选择部分
    */
    .avatar-uploader .el-upload {
        border: 1px dashed #d9d9d9;
        border-radius: 6px;
        cursor: pointer;
        position: relative;
        overflow: hidden;
        background-color: #fff;
        box-sizing: border-box;
        width: 360px;
        height: 180px;
        text-align: center;

    }

    .avatar-uploader .el-upload:hover {
        border-color: #20a0ff;
    }

    .avatar-uploader-icon {
        font-size: 28px;
        color: #8c939d;
        width: 178px;
        height: 178px;
        line-height: 178px;
        text-align: center;
    }

    .avatar {
        max-width: 100%;
        max-height: 100%;
        display: block;
        margin: 0 auto;
    }
</style>
