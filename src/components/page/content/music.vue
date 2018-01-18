<template>
    <section>
        <!--顶部工具条-->
        <el-col :span="24" class="toolbar">
            <el-form :inline="true" :model="filters">
                <el-form-item>
                    <el-input v-model="filters.kw" placeholder="ID/名称" icon="circle-close" :on-icon-click="resetSearch" @keyup.enter.native="fetchList"></el-input>
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
        <el-table v-loading="tableLoading" class="table-expand" :data="tableList" stripe border :max-height="tableHeight" style="width: 100%;">
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
                    <el-button size="small" @click="showForm(scope.row)">编辑</el-button>
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

        <!--音乐编辑-->
        <v-detail :musData="musData" v-model="isShowForm" v-on:refresh="fetchList"></v-detail>

    </section>
</template>

<script type="es6">
    import util from '../../../api/util'
    import { httpGet, httpDel, httpPost} from '../../../api/api';
    import vDetail from './musicDetail.vue'

    export default {
        components: {
            vDetail
        },
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
                tableHeight: '100%',
                tableLoading: false, //表格的loading符号
                tableList: [], //表格数据
                musicTitle:'音乐播放',
                musicVisible: false,  //播放音乐界面 显示、隐藏
                musicHtml: '',
                isShowForm: false, //显示、隐藏编辑页
                musData: {}
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
                _self.tableHeight = document.getElementById('container').clientHeight - 77 - 42 - 15;
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
            resetSearch(){
                this.filters.kw = '';
                this.fetchList();
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
            showForm (row){ //显示表单
                this.isShowForm = true;
                this.musData = row;
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
