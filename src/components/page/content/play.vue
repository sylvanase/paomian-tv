<template>
    <section>
        <!--顶部工具条-->
        <el-col :span="24" class="toolbar" style="padding-bottom: 0;">
            <el-form :inline="true" :model="filters">
                <el-form-item>
                    <el-input v-model="filters.kw" placeholder="ID/名称" icon="circle-close" :on-icon-click="resetSearch" @keyup.enter.native="fetchList"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-select v-model="filters.type" @change="fetchList" placeholder="请选择" style="width: 150px;">
                        <el-option label="按剧本搜" value="0"></el-option>
                        <el-option label="按电影搜" value="1"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-select v-model="filters.status" @change="fetchList" placeholder="请选择" style="width: 100px;">
                        <el-option label="在线" value="1"></el-option>
                        <el-option label="离线" value="0"></el-option>
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
                        <el-form-item label="相关电影：">
                            <span>{{ props.row.movieNames.join(' , ') }}</span>
                        </el-form-item>
                        <el-form-item label="剧本描述：">
                            <span>{{ props.row.description }}</span>
                        </el-form-item>
                        <template v-if="props.row.scriptList.length < 3">
                            <el-form-item label="素材：" v-for="item in props.row.scriptList">
                                <span class="mr-10">id： {{ item.id }}</span>
                                <span class="mr-10">类型： {{ item.showType == 0 ? '横竖屏' : '' }}{{ item.showType == 1 ? '横屏' : '' }}{{ item.showType == 2 ? '竖屏' : '' }}</span>
                                <span class="mr-10">创建时间： {{ item.createTime }}</span>
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
                                <el-form-item label="素材：" v-if="item.showType == 0" >
                                    <span class="mr-10">id： {{ item.id }}</span>
                                    <span class="mr-10">类型： 横竖屏</span>
                                    <span class="mr-10">创建时间： {{ item.createTime }}</span>
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
            <el-table-column prop="status" label="状态" width="80">
                <template scope="scope">
                    <el-tag :type="scope.row.status == 1 ? 'success' : 'danger'"
                            close-transition>{{ scope.row.status == 1 ? '在线' : '离线' }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column label="使用统计">
                <template scope="scope">
                    {{ scope.row.useCount ? scope.row.useCount : '0' }}次/{{ scope.row.userCount ? scope.row.userCount :
                    '0'}}人
                </template>
            </el-table-column>
            <el-table-column label="操作" width="350">
                <template scope="scope">
                    <el-button size="small" @click="showForm(scope.row)">编辑</el-button>
                    <el-button size="small" @click="playVideo(scope.row)">预览</el-button>
                    <el-button type="danger" size="small" @click="handleTableDel(scope.$index, scope.row)">删除
                    </el-button>
                    <el-button :type="scope.row.status == 1 ? 'danger' : 'success'" size="small"
                               @click="handleTableLine(scope.$index, scope.row)">
                        {{ scope.row.status == 1 ? '下线' : '上线' }}
                    </el-button>
                    <el-button type="info" size="small" @click="scriptEdit(scope.row, '')">添加素材</el-button>
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

        <!--剧本编辑-->
        <v-detail :playData="playData" v-model="isShowForm" v-on:refresh="fetchList"></v-detail>

        <!--脚本编辑-->
        <v-script-detail :scriptData="scriptData" v-model="isShowScript" v-on:refresh="fetchList"></v-script-detail>

        <!--播放弹窗-->
        <el-dialog title="剧本预览" v-model="videoVisible" @close="videoClose()">
            <div style="text-align: center;" v-html="videoHtml"></div>
        </el-dialog>
    </section>
</template>

<script type="es6">
    import util from '../../../api/util'
    import { httpGet, httpDel, httpPost } from '../../../api/api';
    import  Ks3 from '../../../../static/js/ksyun/ks3jssdk.js'
    import vDetail from './playDetail.vue'
    import vScriptDetail from './scriptDetail.vue'

    export default {
        components: {
            vDetail,
            vScriptDetail
        },
        data() {
            return {
                filters: { //搜索筛选条件
                    type: '0',
                    status: '1',
                    kw: '',
                    id: ''
                },
                total: 0, //表格列表数据总数
                page: 1, //当前页，默认为第一页
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
                videoHtml: ''
            }
        },
        methods: {
            handleCurrentChange(val) { //翻页
                this.page = val;
                this.fetchList();
            },
            fetchList() { //获取列表
                let _self = this;
                let para = {
                    type: _self.filters.type,
                    status: _self.filters.status,
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
                httpGet('contentPlayList', para, _self, function (res) {
                    _self.tableLoading = false;
                    try {
                        let { error, status,data } = res;
                        _self.total = data.totalElements;
                        _self.tableList = data.content.map(function (item) {
                            if (item.scriptList.length > 0) {
                                let array = item.scriptList;
                                for (let k = 0, length = array.length; k < length; k++) {
                                    array[k].createTime = util.timestampFormat(array[k].createTime);
                                }
                            }
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
            playVideo(row){ //播放视频
                this.videoVisible = true;
                this.videoHtml = '<video style="max-width: 100%;max-height:350px;" controls="controls" autoplay="autoplay">'
                    + '<source src="' + row.previewUrl + '" type="video/mp4">对不起，您的浏览器不支持video标签，无法播放视频。</video>';
            },
            videoClose(){
                this.videoHtml = '';
            },
            showForm (row){ //显示表单
                this.isShowForm = true;
                this.playData = row;
            },
            //删除表格数据
            handleTableDel: function (index, row) {
                let _self = this;
                _self.tableLoading = true;
                httpDel('contentPlayDel', {id: row.id}, _self, function (res) {
                    try {
                        _self.$message.success('删除成功');
                        _self.fetchList();
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            handleTableLine(index, row){
                let _self = this;
                let para = new FormData();
                para.append("id", row.id);
                para.append("status", Number(!row.status));
                httpPost('contentPlayStatus', para, _self, function (res) {
                    try {
                        let { error, status,data } = res;
                        _self.$message.success('操作成功');
                        _self.fetchList();
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            scriptEdit(row, id){ //编辑素材 剧本id、素材id ，id为空则为新增
                let _self = this;
                _self.isShowScript = true;
                _self.scriptData = {
                    scriptId: id, // 素材id
                    playId: row.id // 剧本id
                };
            },
            scriptDel (row, item){ //删除素材
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
                        let { error, status,data } = res;
                        _self.$message.success('删除成功');
                        _self.fetchList();
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            }
        },
        mounted() {
            this.fetchList();
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
