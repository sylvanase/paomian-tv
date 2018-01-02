<template>
    <section>
        <!--顶部工具条-->
        <el-col :span="24" class="toolbar" style="padding-bottom: 0;">
            <el-form :inline="true" :model="filters">
                <el-form-item>
                    <el-input v-model="filters.kw" placeholder="帖子ID" icon="circle-close" :on-icon-click="resetSearch" @keyup.enter.native="fetchList"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-select v-model="filters.status" @change="fetchList"  style="width: 150px;">
                        <el-option label="全部处理状态" value=""></el-option>
                        <el-option label="检测成功" value="0"></el-option>
                        <el-option label="请求重复" value="110"></el-option>
                        <el-option label="参数错误" value="120"></el-option>
                        <el-option label="解析错误" value="130"></el-option>
                        <el-option label="数据类型错误" value="140"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-select v-model="filters.level" @change="fetchList"  style="width: 110px;">
                        <el-option label="全部级别" value=""></el-option>
                        <el-option label="正常" value="0"></el-option>
                        <el-option label="不确定" value="1"></el-option>
                        <el-option label="确定" value="2"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="fetchList">查询</el-button>
                </el-form-item>
            </el-form>
        </el-col>

        <!--表格-->
        <el-table v-loading="tableLoading" :data="tableList" stripe border style="width: 100%;">
            <el-table-column prop="id" label="id" width="180" fixed></el-table-column>
            <el-table-column prop="coverUrl" label="封面(点击播放)" width="135">
                <template scope="scope">
                    <img @click="playVideo(scope.row)" v-if="scope.row.coverUrl !== ''" style="width: 100%;cursor: pointer;vertical-align: middle;margin: 10px 0;" :src="scope.row.coverUrl" alt="视频封面"/>
                    <span @click="playVideo(scope.row)" v-else>封面为空</span>
                </template>
            </el-table-column>
            <el-table-column prop="username" label="发帖人" min-width="150"></el-table-column>
            <el-table-column prop="createTime" label="发帖时间" min-width="180"></el-table-column>
            <el-table-column prop="videoText" min-width="200" label="帖子描述"></el-table-column>
            <el-table-column label="已封禁" width="100">
                <template scope="scope">
                    <el-tag :type="scope.row.isDel == 1 ? 'success' : 'danger'"
                            close-transition>{{ scope.row.isDel == 1 ? '是' : '否' }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="status" label="监测状态" width="130"></el-table-column>
            <el-table-column prop="level" label="嫌疑类型" width="130"></el-table-column>
            <el-table-column label="操作" fixed="right" width="100">
                <template scope="scope">
                    <el-button v-if="scope.row.isDel == 0" type="danger" size="small" @click="blockedVideo(scope.row)">封禁</el-button>
                    <el-button v-else size="small" @click="unblockVideo(scope.row)">解封</el-button>
                </template>
            </el-table-column>
        </el-table>
        <!--分页-->
        <el-col :span="24" class="mt-10">
            <el-pagination style="float:right;" @current-change="handleCurrentChange"
                           :page-size="10" :current-page="page"
                           layout="total, prev, pager, next, jumper" :total="total">
            </el-pagination>
        </el-col>
        <!--播放弹窗-->
        <el-dialog title="视频播放" v-model="videoVisible" @close="videoClose()">
            <div style="text-align: center;" v-html="videoHtml"></div>
        </el-dialog>
    </section>
</template>

<script type="es6">
    import util from '../../../api/util'
    import { httpGet, httpPost} from '../../../api/api';

    export default {
        data() {
            return {
                filters: {
                    kw: '',
                    status: '',
                    level: ''
                },
                total: 0, //表格列表数据总数
                page: 1, //当前页，默认为第一页
                tableLoading: false, //表格的loading符号
                videoVisible: false,  //播放视频界面 显示、隐藏
                videoHtml: ''
            }
        },
        methods: {
            handleCurrentChange(val) { //翻页
                this.page = val;
                this.fetchList();
            },
            fetchList() {    //获取列表
                let _self = this;
                let paras = {
                    offset: 0,
                    size: 10,
                    id: _self.filters.kw,
                    status: _self.filters.status,
                    level: _self.filters.level
                };
                paras.offset = (_self.page - 1) * paras.size;
                _self.tableLoading = true;
                httpGet('postsCheckList', paras, _self, function (res) {
                    _self.tableLoading = false;
                    try {
                        let { error, status,data } = res;
                        _self.total = data.totalElements;
                        _self.tableList = data.content.map(function (item) { //格式化显示时间
                            item.createTime = util.timestampFormat(item.createTime);
                            item.level = util.postsLevel(item.level);
                            item.status = util.postsStatus(item.status);
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
                    + '<source src="' + row.videoUrl + '" type="video/mp4">对不起，您的浏览器不支持video标签，无法播放视频。</video>';
            },
            videoClose(){
                this.videoHtml = '';
            },
            blockedVideo (row) { // 封禁帖子
                let _self = this;
                let paras = new FormData();
                paras.append("vpId", row.id);
                _self.tableLoading = true;
                httpPost('postsBlocked', paras, _self, function (res) {
                    _self.tableLoading = false;
                    try {
                        let { error, status,data } = res;
                        _self.$message.success('操作成功');
                        _self.fetchList();
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            unblockVideo(row){
                let _self = this;
                let paras = {
                    vpId: row.id
                };
                _self.tableLoading = true;
                httpGet('postsUnblock', paras, _self, function (res) {
                    _self.tableLoading = false;
                    try {
                        let { error, status,data } = res;
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
        }
    }
</script>

<style scoped>
</style>
