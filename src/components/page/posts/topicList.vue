<template>
    <section>
        <!--顶部工具条-->
        <el-col :span="24" class="toolbar">
            <el-form :inline="true" :model="filters">
                <el-form-item>
                    <el-input v-model="filters.kw" placeholder="ID/关键字" icon="circle-close" :on-icon-click="resetSearch"
                              @keyup.enter.native="fetchList" style="width:180px;"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-date-picker type="datetime" placeholder="开始时间" v-model="filters.start"
                                    style="width: 190px;" @change="setStart"></el-date-picker>
                    <span> - </span>
                    <el-date-picker type="datetime" placeholder="结束时间" v-model="filters.end"
                                    style="width: 190px;" @change="setEnd"></el-date-picker>
                </el-form-item>
                <el-form-item>
                    <el-select v-model="filters.isRec" clearable @change="fetchList" style="width: 110px;"
                               placeholder="是否推荐">
                        <el-option label="推荐" value="1"></el-option>
                        <el-option label="不推荐" value="0"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="fetchList">查询</el-button>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handelConfig">置顶配置</el-button>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="showForm('-1')">新增</el-button>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="squareConfig">广场置顶配置</el-button>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click.native="excelVisible = true">数据导出</el-button>
                </el-form-item>
            </el-form>
        </el-col>

        <!--表格-->
        <el-table v-loading="tableLoading" :data="tableList" stripe border :max-height="tableHeight"
                  style="width: 100%;">
            <el-table-column prop="id" label="id" min-width="80" fixed></el-table-column>
            <el-table-column prop="username" label="发帖人" min-width="150"></el-table-column>
            <el-table-column prop="name" label="标题" min-width="200"></el-table-column>
            <el-table-column label="话题类型" width="120">
                <template scope="scope">
                    <template v-if="scope.row.topicType == 0">普通</template>
                    <template v-if="scope.row.topicType == 1">单个剧本</template>
                    <template v-if="scope.row.topicType == 2">多个剧本</template>
                    <template v-if="scope.row.topicType == 3">音乐片段</template>
                </template>
            </el-table-column>
            <el-table-column label="样片">
                <template scope="scope">
                    <el-button size="small" @click="playVideo(scope.row)">播放</el-button>
                </template>
            </el-table-column>
            <el-table-column prop="createTime" label="发帖时间" min-width="120"></el-table-column>
            <el-table-column prop="status" label="是否推荐" width="100">
                <template scope="scope">
                    <el-tag :type="scope.row.isRecommend == 1 ? 'success' : 'danger'"
                            close-transition>{{ scope.row.isRecommend == 1 ? '是' : '否' }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="lastVideoTime" label="最新视频" min-width="180"></el-table-column>
            <el-table-column prop="videoCount" label="视频总数" min-width="100"></el-table-column>
            <el-table-column prop="userCount" label="参与人数" min-width="100"></el-table-column>
            <el-table-column prop="viewCount" label="浏览量"></el-table-column>
            <el-table-column prop="actionUserCount" label="互动人数" min-width="100"></el-table-column>
            <el-table-column prop="isSquareTop" label="广场置顶" width="100">
                <template scope="scope">
                    <el-tag :type="scope.row.isSquareTop == 1 ? 'success' : 'danger'"
                            close-transition>{{ scope.row.isSquareTop == 1 ? '是' : '否' }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="status" label="置顶" width="80">
                <template scope="scope">
                    <el-tag :type="scope.row.top == 1 ? 'success' : 'danger'"
                            close-transition>{{ scope.row.top == 1 ? '是' : '否' }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column label="操作" width="280" fixed="right">
                <template scope="scope">
                    <div class="mt-10">
                        <el-button type="info" size="small" @click="showVideo(scope.row)">视频列表</el-button>
                        <el-button size="small" @click="showForm(scope.row)">编辑</el-button>
                        <el-button :type="scope.row.isDel == 0 ? 'danger' : 'warning'" size="small"
                                   @click="topicDel(scope.row)">
                            {{ scope.row.isDel == 0 ? '删除' : '恢复' }}
                        </el-button>
                    </div>
                    <div class="mt-10 mb-10">
                        <el-button :type="scope.row.top == 1 ? 'danger' : 'success'" size="small"
                                   @click="topicTop(scope.row)">
                            {{ scope.row.top == 1 ? '取消置顶' : '置顶' }}
                        </el-button>
                        <el-button :type="scope.row.isRecommend == 1 ? 'danger' : 'success'" size="small"
                                   @click="topicRec(scope.row)">
                            {{ scope.row.isRecommend == 1 ? '取消推荐' : '推荐' }}
                        </el-button>
                    </div>
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

        <!--话题编辑-->
        <v-detail :topicData="topicData" v-model="isShowForm" v-on:refresh="fetchList"></v-detail>

        <!--视频列表-->
        <v-video :topicData="topicData" v-model="isShowVideo" v-on:preview="playVideo"
                 v-on:refresh="fetchList" v-on:barrage="showComment" v-on:like="showAddLike"></v-video>

        <!--播放弹窗-->
        <el-dialog title="视频播放" v-model="videoVisible" @close="videoClose()">
            <div style="text-align: center;" v-html="videoHtml"></div>
        </el-dialog>

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

        <!--配置置顶-->
        <el-dialog title="话题置顶配置" v-model="configVisible" size="tiny">
            <el-form :model="configData" label-width="80px" ref="configData">
                <el-form-item label="top1" prop="first">
                    <el-input style="width: 200px;" placeholder="请输入话题id" v-model.number="configData.first"
                              type="number"
                              auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="top2" prop="second">
                    <el-input style="width: 200px;" placeholder="请输入话题id" v-model.number="configData.second"
                              type="number"
                              auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="top3" prop="third" style="margin-bottom: 0;">
                    <el-input style="width: 200px;" placeholder="请输入话题id" v-model.number="configData.third"
                              type="number"
                              auto-complete="off"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click.native="configVisible = false">取消</el-button>
                <el-button type="primary" @click.native="configSubmit">确定</el-button>
            </div>
        </el-dialog>


        <!--广场置顶配置-->
        <el-dialog title="广场置顶配置" v-model="squareConfigVisible" size="tiny">
            <el-form :model="squareConfigData" label-width="80px" ref="squareConfigData">
                <el-form-item label="top1" prop="first">
                    <el-input style="width: 200px;" placeholder="请输入话题id" v-model.number="squareConfigData.first"
                              type="number"
                              auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="top2" prop="second">
                    <el-input style="width: 200px;" placeholder="请输入话题id" v-model.number="squareConfigData.second"
                              type="number"
                              auto-complete="off"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click.native="squareConfigVisible = false">取消</el-button>
                <el-button type="primary" @click.native="squareConfigSubmit">确定</el-button>
            </div>
        </el-dialog>


        <!--为帖子点赞-->
        <v-like-add :postsId="addLikeId" v-model="likeVisible" v-on:refresh="fetchList"></v-like-add>

        <!--为帖子加评论-->
        <v-comment-add :postsData="postsData" v-model="isShowComment" v-on:refresh="fetchList"></v-comment-add>
    </section>
</template>

<script type="es6">
    import util from '../../../api/util'
    import {httpGet, httpPost} from '../../../api/api';
    import vDetail from './topicDetail.vue'
    import vVideo from './topicVideo.vue'
    import vCommentAdd from './commentSource.vue'
    import vLikeAdd from './likeAdd.vue'

    export default {
        components: {
            vDetail,
            vVideo,
            vCommentAdd,
            vLikeAdd
        },
        data() {
            return {
                filters: {
                    kw: '',
                    start: '',
                    end: '',
                    isRec: ''
                },
                total: 0, //表格列表数据总数
                page: 1, //当前页，默认为第一页
                tableHeight: '100%',
                tableLoading: false, //表格的loading符号
                tableList: [], //表格数据
                isShowForm: false, //显示、隐藏编辑页
                topicData: {},
                topicId: '', //话题id
                isShowVideo: false, //显示、隐藏话题视频列表
                videoVisible: false,  //播放视频界面 显示、隐藏
                videoHtml: '',
                configVisible: false,
                configData: {
                    first: '',
                    second: '',
                    third: ''
                },
                squareConfigVisible: false, // 广场置顶配置
                squareConfigData: {
                    first: '',
                    second: ''
                },
                isShowComment: false, //显示、隐藏评论列表
                likeVisible: false, // 显示、隐藏点赞界面
                addLikeId: '',  // 点赞的帖子id
                postsData: {},
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
            fetchList() {    //获取列表
                let _self = this;
                _self.tableHeight = document.getElementById('container').clientHeight - 77 - 42 - 15;
                let paras = {
                    offset: 0,
                    size: 10,
                    id: '',
                    kw: '',
                    startTime: _self.filters.start,
                    endTime: _self.filters.end,
                    isRecommend: _self.filters.isRec
                };
                if (isNaN(_self.filters.kw)) { //输入不为数字，值传入kw
                    paras.kw = _self.filters.kw;
                } else {
                    paras.id = _self.filters.kw;
                }
                paras.offset = (_self.page - 1) * paras.size;
                _self.tableLoading = true;
                httpGet('topicList', paras, _self, function (res) {
                    _self.tableLoading = false;
                    try {
                        let {error, status, data} = res;
                        _self.total = data.totalElements;
                        _self.tableList = data.content.map(function (item) { //格式化显示时间
                            item.createTime = util.timestampFormat(item.createTime, 'YYYY-MM-DD');
                            if (item.lastVideoTime) {
                                item.lastVideoTime = util.timestampFormat(item.lastVideoTime);
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
            setStart(val) { //格式化日期控件值
                this.filters.start = val;
            },
            setEnd(val) {
                this.filters.end = val;
            },
            handelConfig() { //显示置顶配置弹窗
                let _self = this;
                _self.configVisible = true;
                httpGet('topConfigDetail', '', _self, function (res) {
                    try {
                        let {error, status, data} = res;
                        _self.configData = {
                            first: data.firstTopId,
                            second: data.secondTopId,
                            third: data.thirdTopId
                        };
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            configSubmit() {
                this.$refs.configData.validate((valid) => {
                    let _self = this;
                    let paras = new FormData();
                    paras.append("firstTopId", _self.configData.first);
                    paras.append("secondTopId", _self.configData.second);
                    paras.append("thirdTopId", _self.configData.third);
                    httpPost('topConfigHandel', paras, _self, function (res) {
                        try {
                            _self.$message.success('更改配置成功');
                            _self.$refs['configData'].resetFields();
                            _self.configVisible = false;
                            _self.fetchList();
                        } catch (error) {
                            util.jsErrNotify(error);
                        }
                    })
                });
            },
            squareConfig() { //显示广场置顶配置弹窗
                let _self = this;
                _self.squareConfigVisible = true;
                httpGet('topSquareConfigDetail', '', _self, function (res) {
                    try {
                        let {error, status, data} = res;
                        _self.squareConfigData = {
                            first: data[0],
                            second: data[1]
                        };
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            squareConfigSubmit() { // 提交广场置顶配置
                let _self = this;
                let paras = new FormData();
                paras.append("ids", [_self.squareConfigData.first, _self.squareConfigData.second]);
                httpPost('topSquareConfig', paras, _self, function (res) {
                    try {
                        _self.$message.success('更改配置成功');
                        _self.squareConfigVisible = false;
                        _self.fetchList();
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            showForm(row) { //显示详情表单
                this.isShowForm = true;
                this.topicData = row;
            },
            showVideo(row) { //显示视频列表
                this.isShowVideo = true;
                this.topicData = row;
            },
            playVideo(row) { //播放视频
                this.videoVisible = true;
                this.videoHtml = '<video style="max-width: 100%;max-height:350px;" controls="controls" autoplay="autoplay">'
                    + '<source src="' + row.videoUrl + '" type="video/mp4">对不起，您的浏览器不支持video标签，无法播放视频。</video>';
            },
            videoClose() {
                this.videoHtml = '';
            },
            topicDel(row) { // 话题删除、恢复
                let _self = this;
                let paras = new FormData();
                paras.append("id", row.id);
                paras.append("status", Number(!row.isDel));
                _self.tableLoading = true;
                httpPost('topicDel', paras, _self, function (res) {
                    try {
                        _self.tableLoading = false;
                        _self.$message.success('操作成功');
                        _self.fetchList();
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            topicTop(row) { // 话题置顶
                let _self = this;
                let paras = new FormData();
                paras.append("id", row.id);
                paras.append("status", Number(!row.top));
                _self.tableLoading = true;
                httpPost('topicTop', paras, _self, function (res) {
                    try {
                        _self.tableLoading = false;
                        _self.$message.success('操作成功');
                        _self.fetchList();
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            topicRec(row) { // 推荐话题，取消话题推荐
                let _self = this;
                let paras = {
                    id: row.id,
                    status: Number(!row.isRecommend)
                };
                _self.tableLoading = true;
                httpGet('topicRecommend', paras, _self, function (res) {
                    try {
                        _self.tableLoading = false;
                        _self.$message.success('操作成功');
                        _self.fetchList();
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            showComment(row) { //显示弹幕列表
                this.isShowComment = true;
                this.postsData = row;
            },
            showAddLike(row) {
                this.likeVisible = true;
                this.addLikeId = row.id
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
                window.open(location.origin  + '/topic/export?startDate=' + _self.excelData.start + '&endDate=' + _self.excelData.end);
            }
        },
        mounted() {
            this.fetchList();
        }
    }
</script>

<style>
    .tb-edit .el-input {
        display: none
    }

    .tb-edit .current-row .el-input {
        display: block
    }

    .tb-edit .current-row .el-input + span {
        display: none
    }
</style>
