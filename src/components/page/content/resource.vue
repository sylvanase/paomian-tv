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
                    <el-button type="primary" @click="fetchList">查询</el-button>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="showForm('-1')">新增</el-button>
                </el-form-item>
            </el-form>
        </el-col>

        <!--表格-->
        <el-table v-loading="tableLoading" :data="tableList" stripe border :max-height="tableHeight" style="width: 100%;">
            <el-table-column prop="id" label="id" width="100"></el-table-column>
            <el-table-column prop="name" label="资源名称"></el-table-column>
            <el-table-column prop="size" label="文件大小" width="150"></el-table-column>
            <el-table-column prop="duration" label="时长" width="150"></el-table-column>
            <el-table-column label="封面" width="150">
                <template scope="scope">
                    <el-button size="small" @click="previewCover(scope.row, 0)">静态</el-button>
                    <el-button type="info" size="small" @click="previewCover(scope.row, 1)">动态
                    </el-button>
                </template>
            </el-table-column>
            <el-table-column label="操作" width="200">
                <template scope="scope">
                    <el-button type="info" size="small" @click="playVideo(scope.$index, scope.row)">播放</el-button>
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

        <!--资源新增-->
        <v-add v-model="isShowAdd" v-on:refresh="fetchList"></v-add>

        <!--资源编辑-->
        <v-detail :resData="resData" v-model="isShowForm" v-on:refresh="fetchList"></v-detail>

        <!--播放弹窗-->
        <el-dialog title="视频播放" v-model="videoVisible" @close="videoClose()">
            <div style="text-align: center;" v-html="videoHtml"></div>
        </el-dialog>
        <!--预览封面-->
        <el-dialog title="封面预览" v-model="coverVisible" @close="coverClose()">
            <div style="text-align: center;" v-html="coverHtml"></div>
        </el-dialog>
    </section>
</template>
<script type="es6">
    import util from '../../../api/util'
    import { httpGet, httpDel, httpPost} from '../../../api/api';
    import  Ks3 from '../../../../static/js/ksyun/ks3jssdk.js'
    import vDetail from './resDetail.vue'
    import vAdd from './resAdd.vue'

    export default {
        components: {
            vDetail,
            vAdd
        },
        data() {
            return {
                filters: { //列表筛选条件
                    kw: ''
                },
                total: 0, //表格列表数据总数
                page: 1, //当前页，默认为第一页
                tableHeight: '100%',
                tableLoading: false, //表格的loading符号
                tableList: [], //表格数据
                isShowForm: false, //显示、隐藏编辑页
                isShowAdd: false,
                resData: {},
                videoVisible: false,  //播放视频界面 显示、隐藏
                videoHtml: '',
                coverVisible: false,  //预览封面界面 显示、隐藏
                coverHtml: ''
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
                let paras = {
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
                httpGet('contentSourceList', paras, _self, function (res) {
                    _self.tableLoading = false;
                    try {
                        let { error, status,data } = res;
                        _self.total = data.totalElements;
                        _self.tableList = data.content.map(function (item) {
                            item.size = util.fileSizeFormat(item.size);
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
            showForm (row){ //显示表单 资源库只有新增操作
                if (row == -1) {
                    this.isShowAdd = true;
                } else {
                    this.isShowForm = true;
                    this.resData = row;
                }
            },
            handleTableDel: function (index, row) { //删除表格数据
                let _self = this;



                _self.$confirm('此操作将删除该资源, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    _self.tableLoading = true;
                    httpDel('contentSourceDel', {id: row.id}, _self, function (res) {
                        _self.tableLoading = false;
                        try {
                            _self.$message.success('删除成功');
                            _self.fetchList();
                        } catch (error) {
                            util.jsErrNotify(error);
                        }
                    })
                }).catch(() => {});
            },
            playVideo(index, row){ //播放视频
                this.videoVisible = true;
                this.videoHtml = '<video style="max-width: 100%;max-height:350px;" poster="' + row.coverUrl + '" controls="controls" autoplay="autoplay">'
                    + '<source src="' + row.url + '" type="video/mp4">对不起，您的浏览器不支持video标签，无法播放视频。</video>';
            },
            videoClose(){
                this.videoHtml = '';
            },
            previewCover(row, type){ //预览封面弹窗
                if (type == 0) { //0为静态封面
                    if (row.coverUrl == '') {
                        this.$message.warning('静态封面还没有形成，请稍等~');
                        return;
                    }
                    this.coverVisible = true;
                    this.coverHtml = '<img style="max-width: 100%;max-height:350px;" src="' + row.coverUrl + '" alt="静态封面">';
                } else if (type == 1) {
                    if (row.animateUrl == '') {
                        this.$message.warning('动态封面还没有形成，请稍等~');
                        return;
                    }
                    this.coverVisible = true;
                    this.coverHtml = '<picture><source srcset="' + row.animateUrl + '" type="image/webp" ><img style="max-width: 100%;max-height:350px;" src="' + row.coverUrl + '" alt="动态封面"></picture>';
                }
            },
            coverClose(){
                this.coverHtml = '';
            }
        },
        mounted() {
            this.fetchList();
        }
    }

</script>
