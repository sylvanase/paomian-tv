<template>
    <section>
        <!--表格-->
        <el-table v-loading="tableLoading" :data="tableList" :max-height="tableHeight" stripe border
                  style="width: 100%;margin-top:10px;">
            <el-table-column prop="createTime" label="日期" width="175"></el-table-column>
            <el-table-column prop="vpId" label="帖子id" width="180"></el-table-column>
            <el-table-column label="内容" width="100">
                <template scope="scope">
                    <el-button size="small" @click="playVideo(scope.row)">播放</el-button>
                </template>
            </el-table-column>
            <el-table-column prop="type" label="举报性质" width="100"></el-table-column>
            <el-table-column prop="postUsername" label="发帖人" min-width="150"></el-table-column>
            <el-table-column prop="username" label="举报人" min-width="150"></el-table-column>
            <el-table-column label="操作">
                <template scope="scope">
                    <el-button :type="scope.row.isDel == 0 ? 'danger' : 'warning'" size="small"
                               @click="postsDel(scope.row)">
                        {{ scope.row.isDel == 0 ? '删除' : '恢复' }}
                    </el-button>
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
        <el-dialog title="视频播放" v-model="videoVisible" @close="videoClose()">
            <div style="text-align: center;" v-html="videoHtml"></div>
        </el-dialog>

    </section>
</template>

<script type="es6">
    import util from '../../../api/util'
    import {httpGet, httpPost} from '../../../api/api';

    export default {
        data() {
            return {
                total: 0, //表格列表数据总数
                page: 1, //当前页，默认为第一页
                tableHeight: '100%',
                tableLoading: false, //表格的loading符号
                tableList: [], //表格数据
                isShowVideo: false, //显示、隐藏话题视频列表
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
                _self.tableHeight = document.getElementById('container').clientHeight - 10 - 42 - 15;
                let paras = {
                    offset: 0,
                    size: 10
                };
                paras.offset = (_self.page - 1) * paras.size;
                _self.tableLoading = true;
                httpGet('illegalList', paras, _self, function (res) {
                    _self.tableLoading = false;
                    try {
                        let {error, status, data} = res;
                        _self.total = data.totalElements;
                        _self.tableList = data.content.map(function (item) { //格式化显示时间
                            item.createTime = util.timestampFormat(item.createTime);
                            item.type = util.illegalType(item.type);
                            return item;
                        });
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            playVideo(row) { //播放视频
                this.videoVisible = true;
                this.videoHtml = '<video style="max-width: 100%;max-height:350px;" controls="controls" autoplay="autoplay">'
                    + '<source src="' + row.video.videoUrl + '" type="video/mp4">对不起，您的浏览器不支持video标签，无法播放视频。</video>';
            },
            videoClose() {
                this.videoHtml = '';
            },
            postsDel(row) { //删除帖子
                let _self = this;
                let paras = new FormData();
                paras.append("vpId", row.vpId);
                paras.append("status", Number(!row.isDel));
                _self.tableLoading = true;
                httpPost('illegalStatus', paras, _self, function (res) {
                    _self.tableLoading = false;
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
        }
    }
</script>

<style>
</style>
