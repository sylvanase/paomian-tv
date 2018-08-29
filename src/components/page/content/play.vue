<template>
    <section>
        <!--顶部工具条-->
        <el-col :span="24" class="toolbar">
            <el-form :inline="true" :model="filters">
                <el-form-item>
                    <el-input v-model="filters.kw" placeholder="ID/名称" icon="circle-close" :on-icon-click="resetSearch"
                              @keyup.enter.native="fetchList"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-select v-model="filters.type" @change="fetchList" placeholder="请选择" style="width: 150px;">
                        <el-option label="按剧本搜" value="0"></el-option>
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
                    <el-select v-model="filters.status" @change="fetchList" placeholder="剧本状态" style="width: 150px;">
                        <el-option label="全部状态" value=""></el-option>
                        <el-option label="上架" value="1"></el-option>
                        <el-option label="下架" value="0"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="fetchList()">查询</el-button>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="showForm('-1')">新增</el-button>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click.native="excelVisible = true">数据导出</el-button>
                </el-form-item>
            </el-form>
        </el-col>

        <!--表格-->
        <el-table v-loading="tableLoading" class="table-expand" :data="tableList" stripe border
                  :max-height="tableHeight" style="width: 100%;">
            <el-table-column type="expand">
                <template scope="props">
                    <el-form label-position="left" class="table-expand">
                        <el-form-item label="相关电影：">
                            <span>{{ props.row.movieNames.join(' , ') }}</span>
                        </el-form-item>
                        <el-form-item label="剧本描述：">
                            <span>{{ props.row.description }}</span>
                        </el-form-item>
                        <template v-if="props.row.playType == 3 || props.row.playType == 4">
                            <el-form-item label="漫画资源：">
                                <span>{{ props.row.cartoonZipName }}</span>
                                <input type="file" :ref="'zip' + props.$index">
                                <el-button size="small" :loading="zipLoading" @click="uploadZip(props.$index, props.row)">上传</el-button>
                            </el-form-item>
                        </template>
                        <template v-if="props.row.scriptList.length < 3">
                            <el-form-item label="素材：" v-for="item in props.row.scriptList">
                                <span class="mr-10">id： {{ item.id }}</span>
                                <span class="mr-10">类型： {{ item.showType == 0 ? '横竖屏' : '' }}{{ item.showType == 1 ? '横屏' : '' }}{{ item.showType == 2 ? '竖屏' : '' }}</span>
                                <span class="mr-10">更新时间： {{ item.updateTime }}</span>
                                <span>
                                    <el-button size="small" @click="scriptEdit(props.row, item.id)">编辑</el-button>
                                    <el-button type="danger" size="small" @click="scriptDel(props.row, item)">删除
                                    </el-button>
                                </span>
                            </el-form-item>
                        </template>
                        <!-- 剧本下脚本数量为3，只显示横竖屏 -->
                        <template v-else-if="props.row.scriptList.length == 3">
                            <template v-for="item in props.row.scriptList">
                                <el-form-item label="素材：" v-if="item.showType == 0">
                                    <span class="mr-10">id： {{ item.id }}</span>
                                    <span class="mr-10">类型： 横竖屏</span>
                                    <span class="mr-10">更新时间： {{ item.updateTime }}</span>
                                    <span>
                                    <el-button size="small" @click="scriptEdit(props.row, item.id)">编辑</el-button>
                                    <el-button type="danger" size="small" @click="scriptDel(props.row, item)">删除
                                    </el-button>
                                </span>
                                </el-form-item>
                            </template>
                        </template>
                    </el-form>
                </template>
            </el-table-column>
            <el-table-column prop="id" label="id" width="100"></el-table-column>
            <el-table-column prop="name" label="剧本名称"></el-table-column>
            <el-table-column label="使用统计" width="100">
                <template scope="scope">
                    {{ scope.row.useCount ? scope.row.useCount : '0' }}次/{{ scope.row.userCount ? scope.row.userCount :
                    '0'}}人
                </template>
            </el-table-column>
            <el-table-column label="状态">
                <template scope="scope">
                    <el-tag :type="scope.row.status == 1 ? 'success' : 'danger'"
                            close-transition>{{ scope.row.status  == 1? '上架中' : '已下架' }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column label="剧本属性">
                <template scope="scope">
                    {{ scope.row.playAttrNames.join(' , ') }}
                </template>
            </el-table-column>
            <el-table-column label="操作" width="290">
                <template scope="scope">
                    <el-button-group class="mt-10">
                        <el-button size="small" @click="showForm(scope.row)">编辑</el-button>
                        <el-button size="small" @click="playVideo(scope.row)">预览</el-button>
                        <el-button type="info" size="small" @click="scriptEdit(scope.row, '')">添加素材</el-button>
                        <el-button size="small" @click="showComment(scope.row)">加评论</el-button>
                    </el-button-group>
                    <el-button-group class="mt-10 mb-10">
                        <el-button :type="scope.row.status == 1 ? 'danger' : 'success'" size="small"
                                   @click="handleTableLine(scope.row)">
                            {{ scope.row.status == 1 ? '下架' : '上架' }}
                        </el-button>
                        <el-button :type="scope.row.isRecommend == 1 ? 'danger' : 'success'" size="small"
                                   @click="handleRecommend(scope.row)">
                            {{ scope.row.isRecommend == 1 ? '取消推荐' : '推荐' }}
                        </el-button>
                        <el-button :type="scope.row.isTop == 1 ? 'danger' : 'success'" size="small"
                                   @click="handleTop(scope.row)">
                            {{ scope.row.isTop == 1 ? '取消置顶' : '置顶' }}
                        </el-button>
                        <el-button type="danger" size="small" @click="handleTableDel(scope.$index, scope.row)">删除
                        </el-button>
                        
                    </el-button-group>
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

        <!--导出数据-->
        <el-dialog title="数据导出" v-model="excelVisible" @close="resetExcel" size="tiny">
            <el-form :model="excelData" label-width="80px" style="margin-bottom: -20px;">
                <el-form-item label="开始时间">
                    <el-input placeholder="日期格式：xxxx-xx-xx" v-model="excelData.start"></el-input>
                </el-form-item>
                <el-form-item label="结束时间" style="margin-bottom: -20px;">
                    <el-input placeholder="日期格式：xxxx-xx-xx" v-model="excelData.end"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button size="small" @click.native="excelVisible = false">取消</el-button>
                <el-button size="small" type="primary" @click.native="excelSubmit" :loading="excelData.loading">提交
                </el-button>
            </div>
        </el-dialog>

        <!--剧本编辑-->
        <v-detail :playData="playData" v-model="isShowForm" v-on:refresh="fetchList"></v-detail>

        <!--脚本编辑-->
        <v-script-detail :scriptData="scriptData" v-model="isShowScript" v-on:refresh="fetchList"></v-script-detail>

        <!--播放弹窗-->
        <el-dialog title="剧本预览" v-model="videoVisible" @close="videoClose()">
            <div style="text-align: center;" v-html="videoHtml"></div>
        </el-dialog>

        <!--为剧本加评论-->
        <v-comment-add :typeData="typeData" :type="2" v-model="isShowComment"></v-comment-add>

    </section>
</template>

<script type="es6">
    import util from '../../../api/util'
    import {httpGet, httpDel, httpPost} from '../../../api/api';
    import Ks3 from '../../../../static/js/ksyun/ks3jssdk.js'
    import vDetail from './playDetail.vue'
    import vScriptDetail from './scriptDetail.vue'
    import vCommentAdd from './commentSource.vue'

    export default {
        components: {
            vDetail,
            vScriptDetail,
            vCommentAdd
        },
        data() {
            return {
                filters: { //搜索筛选条件
                    type: '0',
                    attr: '', //属性
                    kw: '',
                    id: '',
                    status: '' // 剧本状态
                },
                attrSelect: '', //属性列表
                total: 0, //表格列表数据总数
                page: 1, //当前页，默认为第一页
                tableHeight: '100%',
                tableLoading: false, //表格的loading符号
                tableList: [], //表格数据
                isShowForm: false, //显示、隐藏编辑页
                playData: {},
                isShowScript: false, //显示、隐藏编辑脚本页
                scriptData: {
                    scriptId: '', // 素材id
                    playId: '' // 剧本id
                },
                videoVisible: false,  //播放视频界面 显示、隐藏
                videoHtml: '',
                isShowComment: false, //显示、隐藏评论库列表
                typeData: {},
                zipLoading: false,
                excelVisible: false,
                excelData: {
                    loading: false,
                    start: '',
                    end: ''
                }
            }
        },
        methods: {
            handleCurrentChange(val) { //翻页
                this.page = val;
                this.fetchList();
            },
            fetchList() { //获取列表
                let _self = this;
                _self.tableHeight = document.getElementById('container').clientHeight - 77 - 42 - 15;
                let para = {
                    type: _self.filters.type,
                    attrId: _self.filters.attr,
                    offset: 0,
                    size: 10,
                    id: '',
                    kw: '',
                    status: _self.filters.status
                };
                if (isNaN(_self.filters.kw)) { //输入不为数字，值传入kw
                    para.kw = _self.filters.kw;
                } else {
                    para.id = _self.filters.kw;
                }
                para.offset = (_self.page - 1) * para.size;
                _self.tableLoading = true;
                httpGet('contentPlayList', para, _self, function (res) {
                    _self.tableLoading = false;
                    try {
                        let {error, status, data} = res;
                        _self.total = data.totalElements;
                        _self.tableList = data.content.map(function (item) {
                            if (item.scriptList.length > 0) {
                                let array = item.scriptList;
                                for (let k = 0, length = array.length; k < length; k++) {
                                    array[k].createTime = util.timestampFormat(array[k].createTime);
                                    array[k].updateTime = util.timestampFormat(array[k].updateTime);
                                }
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
                    type: '2',
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
            playVideo(row) { //播放视频
                this.videoVisible = true;
                this.videoHtml = '<video style="max-width: 100%;max-height:350px;" controls="controls" autoplay="autoplay">'
                    + '<source src="' + row.previewUrl + '" type="video/mp4">对不起，您的浏览器不支持video标签，无法播放视频。</video>';
            },
            videoClose() {
                this.videoHtml = '';
            },
            showForm(row) { //显示表单
                this.isShowForm = true;
                this.playData = row;
            },
            //删除表格数据
            handleTableDel: function (index, row) {
                let _self = this;
                _self.$confirm('此操作将删除该剧本, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    _self.tableLoading = true;
                    httpDel('contentPlayDel', {id: row.id}, _self, function (res) {
                        try {
                            _self.$message.success('删除成功');
                            _self.fetchList();
                        } catch (error) {
                            util.jsErrNotify(error);
                        }
                    })
                }).catch(() => {
                });
            },
            handleTableLine(row) {
                let _self = this;
                let para = new FormData();
                para.append("id", row.id);
                para.append("status", Number(!row.status));
                httpPost('contentPlayStatus', para, _self, function (res) {
                    try {
                        let {error, status, data} = res;
                        _self.$message.success('操作成功');
                        row.status = Number(!row.status);
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            handleRecommend(row) {
                let _self = this;
                let para = {
                    operation: Number(!row.isRecommend),
                    id: row.id
                };
                httpGet('contentRecPlay', para, _self, function (res) {
                    try {
                        let {error, status, data} = res;
                        _self.$message.success('操作成功');
//                        _self.fetchList();
                        row.isRecommend = Number(!row.isRecommend);
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
                    _api = 'contentCancelTopPlay';
                } else {
                    _api = 'contentTopPlay';
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
            },
            scriptEdit(row, id) { //编辑素材 剧本id、素材id ，id为空则为新增
                let _self = this;
                _self.isShowScript = true;
                _self.scriptData = {
                    scriptId: id, // 素材id
                    playId: row.id // 剧本id
                };
            },
            scriptDel(row, item) { //删除素材
                let _self = this;
                _self.tableLoading = true;
                let para = {
                    id: item.id,
                    playId: row.id,
                    showType: item.showType
                };
                httpPost('contentPlayScriptDel', para, _self, function (res) {
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
            showComment(row) { // 显示剧本对应的评论库
                let _self = this;
                _self.typeData = row;
                _self.isShowComment = true;
            },
            uploadZip(index, row){ // 上传漫画
                let _self = this;
                let file;
                file = _self.$refs['zip' + index].files[0];
                if (!file) { //未选择文件
                    return;
                }
                const isZip = file.name.slice(-3) === 'zip';
                if (!isZip) {
                    _self.$message.error('请选择zip格式的文件');
                    return;
                }
                let para = new FormData();
                para.append('zipFile', file);
                para.append('playId', row.id);
                _self.zipLoading = true;
                httpPost('contentPlayZipUpload', para, _self, function (res) { //服务器端获取上传所需签名
                    try {
                        let { error, status,data } = res;
                        _self.zipLoading = false;
                        _self.$message.success('文件上传成功');
                        row.cartoonZipName =  data;
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            resetExcel(){
                this.excelData = {
                    loading: false,
                    start: '',
                    end: ''
                }
            },
            excelSubmit(){
                let _self = this;
                window.open(location.origin + '/content/play/export?startDate=' + _self.excelData.start + '&endDate=' + _self.excelData.end);
            }
        },
        mounted() {
            this.fetchList();
            this.attrList();
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
