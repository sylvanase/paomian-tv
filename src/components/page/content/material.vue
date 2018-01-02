<template>
    <section>
        <!--顶部工具条-->
        <el-col :span="24" class="toolbar" style="padding-bottom: 0;">
            <el-form :inline="true" :model="filters">
                <el-form-item>
                    <el-input v-model="filters.kw" placeholder="ID/名称" icon="circle-close" :on-icon-click="resetSearch"
                              @keyup.enter.native="fetchList"></el-input>
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
                    {{ scope.row.useCount ? scope.row.useCount : '0' }}次/{{ scope.row.userCount ? scope.row.userCount :
                    '0'}}人
                </template>
            </el-table-column>
            <el-table-column label="操作" width="210">
                <template scope="scope">
                    <div class="mt-10">
                        <el-button size="small" @click="showForm(scope.row)">编辑</el-button>
                        <el-button type="danger" size="small" @click="handleTableDel(scope.$index, scope.row)">删除
                        </el-button>
                        <el-button type="info" size="small" @click="playVideo(scope.$index, scope.row)">播放</el-button>
                    </div>
                    <div class="mt-10 mb-10">
                        <el-button :type="scope.row.isRecommend == 1 ? 'danger' : 'success'" size="small"
                                   @click="handleRecommend(scope.row)">
                            {{ scope.row.isRecommend == 1 ? '取消精选' : '精选' }}
                        </el-button>
                        <el-button :type="scope.row.isTop == 1 ? 'danger' : 'success'" size="small"
                                   @click="handleTop(scope.row)">
                            {{ scope.row.isTop == 1 ? '取消置顶' : '置顶' }}
                        </el-button>
                    </div>
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

        <!--片段编辑-->
        <v-detail :matData="matData" v-model="isShowForm" v-on:refresh="fetchList"></v-detail>

        <!--播放弹窗-->
        <el-dialog title="视频播放" v-model="videoVisible" @close="videoClose()">
            <div style="text-align: center;" v-html="videoHtml"></div>
        </el-dialog>
    </section>
</template>

<script type="es6">
    import util from '../../../api/util'
    import {httpGet, httpDel, httpPost} from '../../../api/api';
    import vDetail from './materialDetail.vue'

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
                tableLoading: false, //表格的loading符号
                tableList: [], //表格数据
                isShowForm: false, //显示、隐藏编辑页
                matData: {},
                videoVisible: false,  //播放视频界面 显示、隐藏
                videoHtml: ''
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
                        let {error, status, data} = res;
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
            resetSearch() {
                this.filters.kw = '';
                this.fetchList();
            },
            attrList() {
                let _self = this;
                let para = {
                    type: '1',
                    status: '',
                    offset: 0,
                    size: 99999
                };
                httpGet('contentAttrList', para, _self, function (res) {
                    try {
                        let {error, status, data} = res;
                        _self.attrSelect = data.content;
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            catList() {
                let _self = this;
                let para = {
                    type: '1',
                    status: '',
                    offset: 0,
                    size: 99999
                };
                httpGet('contentCatList', para, _self, function (res) {
                    try {
                        let {error, status, data} = res;
                        _self.catSelect = data.content;
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            showForm(row) { //显示表单
                this.isShowForm = true;
                this.matData = row;
            },
            //删除表格数据
            handleTableDel: function (index, row) {
                let _self = this;
                _self.tableLoading = true;
                httpDel('contentMaterialDel', {id: row.id}, _self, function (res) {
                    _self.tableLoading = false;
                    try {
                        let {error, status, data} = res;
                        _self.$message.success('删除成功');
                        _self.fetchList();
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            playVideo(index, row) { //播放视频
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
            videoClose() {
                this.videoHtml = '';
            },
            handleRecommend(row) {
                let _self = this;
                let para = {
                    operation: Number(!row.isRecommend),
                    id: row.id
                };
                httpGet('contentChoiceMaterial', para, _self, function (res) {
                    try {
                        let {error, status, data} = res;
                        _self.$message.success('操作成功');
                        _self.fetchList();
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            handleTop(row) {
                let _self = this;
                let para = {
                    size: 10,
                    id: row.id
                };
                let _api = null;
                if (row.isTop == 1) { // 该条目现在为已置顶状态
                    _api = 'contentCancelTopMaterial';
                } else {
                    _api = 'contentTopMaterial';
                    para.offset = (_self.page - 1) * para.size;
                }
                httpGet(_api, para, _self, function (res) {
                    try {
                        let {error, status, data} = res;
                        _self.$message.success('操作成功');
                        _self.fetchList();
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
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
