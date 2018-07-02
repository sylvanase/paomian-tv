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
                            <el-select v-model="filters.attrIds" multiple @change="fetchList" placeholder="选择分类" style="width: 200px;">
                                <el-option v-for="item in attrList" :key="item.id" :label="item.text"
                                           :value="item.id">
                                </el-option>
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
                    <el-table-column prop="id" label="id" width="80"></el-table-column>
                    <el-table-column prop="attrName" label="分类" width="120"></el-table-column>
                    <el-table-column prop="text" label="评论内容">
                        <template scope="scope">
                            <!-- <el-input size="small" minlength="1" v-model.trim="scope.row.text" placeholder="请输入内容"
                                      @change="handleEdit(scope.row)" v-on:focus="handleFocus(scope.row)"
                                      v-on:blur="handleBlur(scope.row)"></el-input> -->
                            <span>{{scope.row.text}}</span>
                        </template>
                    </el-table-column>
                </el-table>
                <!--工具条-->
                <el-col :span="24" class="mt-10" style="margin-bottom: 20px;">
                    <el-pagination style="float:right;" @current-change="handleCurrentChange"
                                   :page-size="size" :current-page="page"
                                   :page-sizes="[10, 30, 100]"
                                   @size-change="handleSizeChange"
                                   layout="total, sizes, prev, pager, next, jumper" :total="total">
                    </el-pagination>
                </el-col>
            </el-tab-pane>
            <el-tab-pane label="新增评论" name="add">
                <el-form :model="formData" label-width="80px" :rules="formRules" ref="formData"
                         style="margin-top:20px;margin-bottom: -20px;">
                    <el-form-item label="评论内容" prop="text">
                        <el-input type="textarea" :rows="2" v-model.trim="formData.text" maxlength="128"></el-input>
                    </el-form-item>
                    <!-- <el-form-item label="关联剧本" prop="playIds">
                        <template>
                            <el-select style="width: 50%;" filterable :remote-method="fetchPlayList"
                                       :loading="playloading" remote v-model="formData.playIds" multiple
                                       placeholder="搜索关联剧本">
                                <el-option v-for="item in playList" :key="item.id" :label="item.name"
                                           :value="item.id">
                                </el-option>
                            </el-select>
                        </template>
                    </el-form-item> -->
                    <!-- <el-form-item label="关联片段" prop="materialIds">
                        <template>
                            <el-select style="width: 50%;" filterable :remote-method="fetchMaterialList"
                                       :loading="materialloading" remote v-model="formData.materialIds" multiple
                                       placeholder="搜索关联片段">
                                <el-option v-for="item in materialList" :key="item.id" :label="item.name"
                                           :value="item.id">
                                </el-option>
                            </el-select>
                        </template>
                    </el-form-item> -->
                    <!-- <el-form-item label="关联音乐" prop="musicIds">
                        <template>
                            <el-select style="width: 50%;" filterable :remote-method="fetchMusicList"
                                       :loading="musicloading" remote v-model="formData.musicIds" multiple
                                       placeholder="搜索关联音乐">
                                <el-option v-for="item in musicList" :key="item.id" :label="item.name"
                                           :value="item.id">
                                </el-option>
                            </el-select>
                        </template>
                    </el-form-item> -->
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
            <el-tab-pane label="临时评论" name="temporary">
                <el-col :span="24" style="margin-top: 0;margin-bottom: 10px;">
                    <el-button type="primary" size="small" @click="submitTemp()">提交</el-button>
                    <span>（需要入库时请勾选评论）</span>
                </el-col>
                <!--表格-->
                <el-table :data="temporaryList" stripe border style="width: 100%;" highlight-current-row @selection-change="tempSelectionChange">
                    <el-table-column type="selection" label="评论入库" :selectable="isSelectable" width="55"></el-table-column>
                    <el-table-column label="分类" width="230">
                        <template scope="scope">
                            <el-input size="small" v-model.trim="scope.row.attrNames" placeholder="多个分类使用中文逗号隔开"></el-input>
                        </template>
                    </el-table-column>
                    <el-table-column prop="text" label="评论内容">
                        <template scope="scope">
                            <el-input size="small" v-model.trim="scope.row.text" placeholder="请输入内容" ></el-input>
                        </template>
                    </el-table-column>
                </el-table>
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
                    attr: [],
                    kw: ''
                },
                size: 10,
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
                attrList: [],
                temporaryList:[ // 初始化临时评论
                    {attrNames:'',text:'', isStore: 0},
                    {attrNames:'',text:'', isStore: 0},
                    {attrNames:'',text:'', isStore: 0},
                    {attrNames:'',text:'', isStore: 0},
                    {attrNames:'',text:'', isStore: 0},
                    {attrNames:'',text:'', isStore: 0},
                    {attrNames:'',text:'', isStore: 0},
                    {attrNames:'',text:'', isStore: 0},
                    {attrNames:'',text:'', isStore: 0},
                    {attrNames:'',text:'', isStore: 0}], 
                temporaryCheck: [] // 被选中的队列
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
                        attrIds: [],
                        kw: ''
                    };
                    _self.total = 0;
                    _self.page = 1;
                    _self.multipleCommentIds = [];
                    _self.fetchList();
                    _self.fetchAttrList();
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
                    _self.resetForm(); // 重置新增评论表单
                }
            },
            handleSizeChange(val){
                this.size = val;
                this.fetchList();
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
                /*let paras = {
                    offset: 0,
                    size: _self.size,
                    attrIds: _self.filters.attr,
                    keyWord : '',
                    id:''
                };*/
                let paras = new FormData();
                paras.append('size', _self.size);
                paras.append('attrIds', _self.filters.attrIds);
                paras.append('vpId', _self.postsData.id);
                paras.append('keyWord', _self.filters.kw);
                if (!isNaN(_self.filters.kw)) { //输入不为数字，值传入kw
                    paras.append('id', _self.filters.kw);
                }
                paras.append('offset', (_self.page - 1) * _self.size);
                _self.tableLoading = true;
                httpPost('commentListSearch', paras, _self, function (res) {
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
                if(_self.multipleCommentIds.length == 0){
                    _self.$message.warning('请选择需要提交的评论');
                    return;
                }
                let paras = new FormData();
                paras.append("vpId", _self.postsData.id);
                paras.append("barrageIds", _self.multipleCommentIds.join(','));
                httpPost('postsBarrageAdd', paras, _self, function (res) {
                    try {
                        _self.$message.success('增加评论成功');
                        _self.visible = false;
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
            /*fetchPlayList(query) { // 获取剧本数据
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
            },*/
            /*fetchMaterialList(query) { // 获取片段数据
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
            },*/
            /*fetchMusicList(query) { // 获取音乐数据
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
            },*/
            fetchAttrList() { // 获取评论属性
                let _self = this;
                let paras = {
                    offset: 0,
                    size: 999999,
                    isListQuery: 0
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
            },
            isSelectable(row){ // 是否可选
                if(row.text && row.attrNames){
                    return true;
                }
                return false;
            },
            submitTemp(){
                let _self = this;
                let paras = new FormData();
                let arr = [];
                arr = _self.temporaryList.filter(function(item) {
                    return (item.text !== '');
                }).map(function(item) {
                    item.attrNames = (item.attrNames instanceof Array) ? item.attrNames : item.attrNames.split('，');
                    item.vpId = _self.postsData.id;
                    item.vpUid = _self.postsData.uid;
                    return item;
                });
                if(arr.length == 0){
                    _self.$message.warning('没有可提交的评论');
                    return;
                }
                paras.append("commentResourceRequests", JSON.stringify(arr));
                httpPost("commentBatchAdd", paras, _self, function (res) {
                    try {
                        _self.$message.success('提交成功');
                        _self.temporaryList = [
                            {attrNames:'',text:'', isStore: 0},
                            {attrNames:'',text:'', isStore: 0},
                            {attrNames:'',text:'', isStore: 0},
                            {attrNames:'',text:'', isStore: 0},
                            {attrNames:'',text:'', isStore: 0},
                            {attrNames:'',text:'', isStore: 0},
                            {attrNames:'',text:'', isStore: 0},
                            {attrNames:'',text:'', isStore: 0},
                            {attrNames:'',text:'', isStore: 0},
                            {attrNames:'',text:'', isStore: 0}];
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            tempSelectionChange(rows){ // 选择更改时
                // 所有临时评论的状态置为0
                this.temporaryList.map(function(item) {
                    item.isStore = 0;
                    return item;
                })
                for(var i = 0; i < rows.length; i++){
                    rows[i].isStore = 1;
                }
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
    /* .tb-edit .el-input {
        display: none
    }

    .tb-edit .current-row .el-input {
        display: block
    }

    .tb-edit .current-row .el-input + span {
        display: none
    } */
</style>
