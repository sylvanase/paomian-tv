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
                        <el-option label="按片段搜" value="0"></el-option>
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
            <!--<el-table-column type="expand">
                <template scope="props">
                    <el-form label-position="left" class="table-expand">
                        <el-form-item label="片段属性：">
                            <span>{{ props.row.attributeNames.join(' , ') }}</span>
                        </el-form-item>
                        <el-form-item label="片段分类：">
                            <span>{{ props.row.categoryNames.join(' , ') }}</span>
                        </el-form-item>
                        <el-form-item label="相关电影：">
                            <span>{{ props.row.movieNames.join(' , ') }}</span>
                        </el-form-item>
                    </el-form>
                </template>
            </el-table-column>-->
            <el-table-column prop="id" label="id"></el-table-column>
            <el-table-column prop="name" label="片段名称"></el-table-column>
            <el-table-column prop="showTypeName" label="片段类型" width="100"></el-table-column>
            <el-table-column label="片段属性">
                <template scope="props">
                    {{ props.row.attributeNames.join(' , ') }}
                </template>
            </el-table-column>
            <el-table-column label="片段分类">
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
            <el-table-column label="操作" width="210">
                <template scope="scope">
                    <el-button size="small" @click="showForm(scope.$index, scope.row)">编辑</el-button>
                    <el-button type="danger" size="small" @click="handleTableDel(scope.$index, scope.row)">删除
                    </el-button>
                    <el-button type="info" size="small" @click="playVideo(scope.$index, scope.row)">播放</el-button>
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
                <el-form-item label="片段名称" prop="name">
                    <el-input v-model.trim="formData.name" auto-complete="off"></el-input>
                </el-form-item>
                <!--<el-form-item label="静态封面" prop="coverImgUrl">
                    <el-upload style="width: 80%;" :disabled="avatarDisabled" class="avatar-uploader" ref="upload"
                               action="" :show-file-list="false" :on-change="avatarChange" :auto-upload="false"
                               :before-upload="beforeAvatarUpload">
                        <img v-if="formData.coverImgUrl" v-model="formData.coverId" :src="formData.coverImgUrl"
                             class="avatar">
                        <i v-else class="el-icon-plus avatar-uploader-icon"></i>
                    </el-upload>
                    <el-button :loading="avatarLoading" type="primary" size="small" @click="submitUpload">上传
                    </el-button>
                    <el-button type="danger" size="small" @click="resetCoverImg">删除</el-button>
                </el-form-item>-->
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
                        <el-select style="width: 50%;" v-model="formData.horiVideoId" filterable remote
                                   loading-text="搜索中" placeholder="输入关键词搜索视频资源" :remote-method="handleSource"
                                   :loading="searchSource.loading" :disabled="horDisable">
                            <el-option v-for="item in searchSource.list" :key="item.id" :label="item.name"
                                       :value="item.id">
                            </el-option>
                        </el-select>
                    </template>
                </el-form-item>
                <el-form-item label="竖屏片段" prop="vertVideoId">
                    <template>
                        <el-select style="width: 50%;" v-model="formData.vertVideoId" filterable remote
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
                <el-button size="small" @click.native="formVisible = false">取消</el-button>
                <el-button size="small" type="primary" @click.native="formSubmit" :loading="formLoading">提交</el-button>
            </div>
        </el-dialog>

        <!--播放弹窗-->
        <el-dialog title="视频播放" v-model="videoVisible" @close="videoClose()">
            <div style="text-align: center;" v-html="videoHtml"></div>
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
                        {required: true, message: '请输入片段名称', trigger: 'blur'},
                        {min: 1, max: 32, message: '长度在 1 到 32 个字符', trigger: 'blur'}
                    ]
                },
                formData: {
                    id: '',
                    name: '',
                    /*coverImgUrl: '', //封面url
                     coverId: '',*/
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
                horDisable: false, //横屏
                vertDisable: false, //竖屏
                videoVisible: false,  //播放视频界面 显示、隐藏
                videoHtml: '',
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
                searchSource: { //搜索资源
                    loading: false,
                    list: []
                },
                searchTag: { //搜索标签
                    loading: false,
                    list: []
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
                let _self = this;
                let paras = {
                    type: _self.filters.type,
                    attrId: _self.filters.attr,
                    catId: _self.filters.category,
                    offset: 0,
                    size: 10,
                    id: '',
                    kw: ''
                };
                if (isNaN(_self.filters.kw)) { //输入不为数字，值传入kw
                    paras.kw = _self.filters.kw;
                } else {
                    paras.id = _self.filters.kw;
                }
                paras.offset = (_self.page - 1) * paras.size;
                _self.tableLoading = true;
                httpGet('contentMaterialList', paras, _self, function (res) {
                    _self.tableLoading = false;
                    try {
                        let { error, status,data } = res;
                        _self.total = data.totalElements;
                        _self.tableList = data.content.map(function (item) {
                            if (item.showType == 0) {
                                item.showTypeName = '横竖屏';
                            } else if (item.showType == 1) {
                                item.showTypeName = '横屏';
                            } else if (item.showType == 2) {
                                item.showTypeName = '竖屏';
                            } else {
                                item.showTypeName = '无';
                            }
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
                    type: '1',
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
                    type: '1',
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
            showForm (index, row){ //显示表单
                this.formVisible = true;
                if (index == -1) { //索引为-1时，新增操作
                    this.formTitle = '新增片段';
                    this.formData = {
                        id: '',
                        name: '',
                        /*coverImgUrl: '', //封面url
                         coverId: '',*/
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
                    this.horDisable = false;
                    this.vertDisable = false;
                    this.searchMovie.list = [];
                    this.searchAttr.list = [];
                    this.searchCat.list = [];
                    this.searchSource.list = [];
                    this.searchTag.list = [];
                } else {
                    this.formTitle = '编辑片段';
                    let _self = this;
                    httpGet('contentMaterialDetail', {id: row.id}, _self, function (res) {
                        try {
                            let { error, status,data } = res;
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
            },
            formSubmit(){ //提交表格
                this.$refs.formData.validate((valid) => {
                    if (valid) {
                        if (this.formData.showType == 0) {
                            if (this.formData.horiVideoId == '' && this.formData.vertVideoId == '') {
                                this.$message({
                                    message: '片段类型为横竖屏，横屏片段、竖屏片段不能为空',
                                    type: 'warning'
                                });
                                return;
                            }
                        } else if (this.formData.showType == 1) {
                            if (this.formData.horiVideoId == '') {
                                this.$message({
                                    message: '片段类型为横屏，横屏片段不能为空',
                                    type: 'warning'
                                });
                                return;
                            }
                        } else if (this.formData.showType == 2) {
                            if (this.formData.vertVideoId == '') {
                                this.$message({
                                    message: '片段类型为竖屏，竖屏片段内容不能为空',
                                    type: 'warning'
                                });
                                return;
                            }
                        }
                        let _self = this;
                        _self.formLoading = true;
                        let para = new FormData();
                        para.append("id", _self.formData.id);
                        para.append("name", _self.formData.name);
                        //para.append("coverId", this.formData.coverId);
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
                httpDel('topConfigDetail', {id: row.id}, _self, function (res) {
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
            playVideo(index, row){ //播放视频
                if (row.horiVideoUrl == null && row.vertVideoUrl == null) {
                    this.$message({
                        message: '视频链接均为空，请联系服务端同学',
                        type: 'warning'
                    });
                    return;
                }
                this.videoVisible = true;
                let _url = '';
                if (row.showType == 0 || row.showType == 2) { //横竖屏的播放竖屏资源
                    _url = row.vertVideoUrl;
                } else {
                    _url = row.horiVideoUrl;
                }
                this.videoHtml = '<video style="max-width: 100%;max-height:350px;" controls="controls" autoplay="autoplay">'
                    + '<source src="' + _url + '" type="video/mp4">对不起，您的浏览器不支持video标签，无法播放视频。</video>';
            },
            videoClose(){
                this.videoHtml = '';
            },
            handleMovie(query){ //搜索相关电影操作
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
                        let { error, status,data } = res;
                        _self.searchMovie.list = data.content;
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            handleAttr(query){ //搜索属性
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
                        let { error, status,data } = res;
                        _self.searchAttr.list = data.content;
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            handleCat(query){ //搜索分类
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
                        let { error, status,data } = res;
                        _self.searchCat.list = data.content;
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            handleSource(query){ //搜索视频资源
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
                        let { error, status,data } = res;
                        _self.searchSource.list = data.content;
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            handleTag(query){ //搜索标签
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
                        let { error, status,data } = res;
                        _self.searchTag.list = data.content;
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            handleType(){ //更改片段类型，重置横竖屏内容
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
