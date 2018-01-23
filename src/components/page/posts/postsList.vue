<template>
    <section>
        <!--顶部工具条-->
        <el-col :span="24" class="toolbar">
            <el-form :inline="true" :model="filters">
                <el-form-item>
                    <el-input v-model="filters.kw" placeholder="帖子ID/关键字" icon="circle-close"
                              :on-icon-click="resetSearch" @keyup.enter.native="fetchList"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-input type="number" v-model="filters.uid" placeholder="用户ID" icon="circle-close"
                              :on-icon-click="resetSearchUser" @keyup.enter.native="fetchList"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-date-picker type="datetime" placeholder="开始时间" v-model="filters.start"
                                    style="width: 200px;" @change="setStart"></el-date-picker>
                    <span> - </span>
                    <el-date-picker type="datetime" placeholder="结束时间" v-model="filters.end"
                                    style="width: 200px;" @change="setEnd"></el-date-picker>
                </el-form-item>
                <el-form-item>
                    <el-select v-model="filters.isDel" @change="fetchList" style="width: 110px;">
                        <el-option label="显示状态" value=""></el-option>
                        <el-option label="显示" value="0"></el-option>
                        <el-option label="隐藏" value="1"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-select v-model="filters.isEssence" @change="fetchList" style="width: 110px;">
                        <el-option label="精华状态" value=""></el-option>
                        <el-option label="非精" value="0"></el-option>
                        <el-option label="精华" value="1"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-input type="number" v-model="filters.minLikeCount" min="0" max="5000" placeholder="最小赞数"
                              style="width: 100px;"></el-input>
                    <span> - </span>
                    <el-input type="number" v-model="filters.maxLikeCount" min="0" max="5000" placeholder="最大赞数"
                              style="width: 100px;"></el-input>
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
        <el-table v-loading="tableLoading" :data="tableList" stripe border :max-height="tableHeight"
                  style="width: 100%;">
            <el-table-column prop="id" label="id" width="180" fixed></el-table-column>
            <el-table-column prop="coverUrl" label="封面(点击播放)" width="135">
                <template scope="scope">
                    <img @click="playVideo(scope.row)" v-if="scope.row.coverUrl !== ''"
                         style="width: 100%;cursor: pointer;vertical-align:middle;margin:10px auto;"
                         :src="scope.row.coverUrl" alt="视频封面"/>
                    <span @click="playVideo(scope.row)" v-else>封面为空</span>
                </template>
            </el-table-column>
            <el-table-column prop="username" label="发帖人" min-width="150">
                <template scope="scope">
                    <router-link :to="{ name: '用户列表', params: { uid: scope.row.uid }}">{{ scope.row.username }}
                    </router-link>
                </template>
            </el-table-column>
            <el-table-column prop="videoText" min-width="200" label="帖子描述">
                <template scope="scope">
                    {{ scope.row.topicName ? '#'+ scope.row.topicName + '#' : '' }}{{ scope.row.videoText }}
                </template>
            </el-table-column>
            <el-table-column prop="videoInfoPo.likeCount" label="喜欢"></el-table-column>
            <el-table-column prop="createTime" label="发帖时间" min-width="180"></el-table-column>
            <!--<el-table-column prop="lastBarrageTime" label="最后评论时间" min-width="180"></el-table-column>-->
            <el-table-column label="精华" width="80">
                <template scope="scope">
                    <el-tag :type="scope.row.isEssence == 1 ? 'success' : 'danger'"
                            close-transition>{{ scope.row.isEssence == 1 ? '是' : '否' }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column label="来源">
                <template scope="scope">
                    {{ scope.row.publishType == 1 ? '后台' : '客户端' }}
                </template>
            </el-table-column>
            <el-table-column label="观看量">
                <template scope="scope">
                    {{ scope.row.videoInfoPo == null ? '0' : scope.row.videoInfoPo.viewShowCount }}
                </template>
            </el-table-column>
            <el-table-column label="观看人数" min-width="100">
                <template scope="scope">
                    {{ scope.row.videoInfoPo.viewUserCount == null ? '0' : scope.row.videoInfoPo.viewUserCount }}
                </template>
            </el-table-column>
            <el-table-column prop="videoInfoPo.barrageCount" label="弹幕数"></el-table-column>
            <el-table-column label="显示">
                <template scope="scope">
                    <el-tag :type="scope.row.isDel == 0 ? 'success' : 'danger'"
                            close-transition>{{ scope.row.isDel == 0 ? '是' : '否' }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column label="操作" width="250" fixed="right">
                <template scope="scope">
                    <div>
                        <el-button size="small" @click="showForm(scope.row, 'detail')">编辑</el-button>
                        <el-button :disabled="scope.row.isDel == 1 ? true : false" size="small" type="success"
                                   @click="addLike(scope.row)">点赞
                        </el-button>
                        <el-button :disabled="scope.row.isDel == 1 ? true : false" size="small" type="info"
                                   @click="showForm(scope.row, 'comment')">加评论
                        </el-button>
                    </div>
                    <div class="mt-10">
                        <el-button :type="scope.row.isEssence == 1 ? 'danger' : 'success'" size="small"
                                   @click="handleEssence(scope.row)">
                            {{ scope.row.isEssence == 1 ? '取精' : '加精' }}
                        </el-button>
                        <el-button :type="scope.row.isDel == 0 ? 'danger' : 'warning'" size="small"
                                   @click="postsDel(scope.row)">
                            {{ scope.row.isDel == 0 ? '删除' : '恢复' }}
                        </el-button>
                        <el-button size="small" @click="showForm(scope.row, 'postsComment')">帖子评论</el-button>
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

        <!--为帖子点赞-->
        <el-dialog title="点赞" v-model="likeVisible" @close="resetLike" size="tiny">
            <el-form :model="likeData" label-width="80px" :rules="likeRules" ref="likeData"
                     style="margin-bottom: -20px;">
                <el-form-item label="数量" prop="num" style="margin-bottom: -20px;">
                    <el-input-number placeholder="单次限制最多1000个" step="1" :min="0" :max="1000"
                                     v-model="likeData.num"></el-input-number>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button size="small" @click.native="likeVisible = false">取消</el-button>
                <el-button size="small" type="primary" @click.native="likeSubmit" :loading="likeData.loading">提交
                </el-button>
            </div>
        </el-dialog>

        <!--帖子编辑-->
        <v-detail :postsData="postsData" v-model="isShowForm" v-on:refresh="fetchList"></v-detail>

        <!--播放弹窗-->
        <el-dialog title="视频播放" v-model="videoVisible" @close="videoClose()">
            <div style="text-align: center;" v-html="videoHtml"></div>
        </el-dialog>

        <!--为帖子加评论-->
        <v-comment-add :postsData="postsData" v-model="isShowComment" v-on:refresh="fetchList"></v-comment-add>

        <!--为帖子加弹幕-->
        <!--<v-barrage :postsData="postsData" v-model="isShowBarrage" v-on:refresh="fetchList"></v-barrage>-->

        <!--帖子弹幕列表-->
        <!--<v-barrage-list :postsData="postsData" v-model="isShowPostsBarrage" v-on:refresh="fetchList"></v-barrage-list>-->

        <!--帖子评论列表-->
        <v-comment-list :postsData="postsData" v-model="isShowPostsComment" v-on:refresh="fetchList"></v-comment-list>
    </section>
</template>

<script type="es6">
    import util from '../../../api/util'
    import {httpGet, httpPost} from '../../../api/api';
    import vDetail from './postsDetail.vue'
    import vCommentAdd from './commentSource.vue'
    import vCommentList from './postsCommentList.vue'

    export default {
        components: {
            vDetail,
            vCommentAdd,
            vCommentList
        },
        data() {
            let validateNum = (rule, value, callback) => {
                if (value === '') {
                    callback(new Error('请输入赞数量'));
                } else {
                    if (value > 100) {
                        callback(new Error('数量不能超过1000!'));
                    }
                }
            };
            return {
                filters: {
                    kw: '',
                    uid: '',
                    start: '',
                    end: '',
                    isDel: '',
                    isEssence: '',
                    minLikeCount: '',
                    maxLikeCount: ''
                },
                total: 0, //表格列表数据总数
                page: 1, //当前页，默认为第一页
                tableHeight: '100%',
                tableLoading: false, //表格的loading符号
                tableList: [], //表格数据
                isShowForm: false, //显示、隐藏编辑页
                isShowComment: false, //显示、隐藏评论库列表
                isShowPostsComment: false, //显示、隐藏视频评论列表
                postsData: {},
                postsId: '', //帖子id
                isShowVideo: false, //显示、隐藏话题视频列表
                videoVisible: false,  //播放视频界面 显示、隐藏
                videoHtml: '',
                likeVisible: false,
                likeData: { // 点赞
                    loading: false,
                    num: 0,
                    id: ''
                },
                likeRules: {
                    num: [
                        {validator: validateNum, trigger: 'blur'},
                    ]
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
                _self.tableHeight = document.getElementById('container').clientHeight - 124 - 42 - 15;
                let paras = {
                    offset: 0,
                    size: 10,
                    uid: _self.filters.uid,
                    startTime: _self.filters.start,
                    endTime: _self.filters.end,
                    del: _self.filters.isDel,
                    isEssence: _self.filters.isEssence,
                    minLikeCount: _self.filters.minLikeCount,
                    maxLikeCount: _self.filters.maxLikeCount,
                    kw: '',
                    id: ''
                };
                if (isNaN(_self.filters.kw)) { //输入不为数字，值传入kw
                    paras.kw = _self.filters.kw;
                } else {
                    paras.id = _self.filters.kw;
                }
                paras.offset = (_self.page - 1) * paras.size;
                _self.tableLoading = true;
                httpGet('postsList', paras, _self, function (res) {
                    _self.tableLoading = false;
                    try {
                        let {error, status, data} = res;
                        _self.total = data.totalElements;
                        _self.tableList = data.content.map(function (item) { //格式化显示时间
                            item.createTime = util.timestampFormat(item.createTime);
                            if (item.lastBarrageTime) {
                                item.lastBarrageTime = util.timestampFormat(item.lastBarrageTime);
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
            resetSearchUser() {
                this.filters.uid = '';
                this.fetchList();
            },
            showForm(row, type) { //显示详情表单
                let _self = this;
                _self.postsData = row;
                if (type == 'detail') {
                    _self.isShowForm = true;
                }
                if (type == 'comment') {
                    _self.isShowComment = true;
                }

                if (type == 'postsComment') {
                    _self.isShowPostsComment = true;
                }
            },
            playVideo(row) { //播放视频
                this.videoVisible = true;
                this.videoHtml = '<video style="max-width: 100%;max-height:350px;" controls="controls" autoplay="autoplay">'
                    + '<source src="' + row.videoUrl + '" type="video/mp4">对不起，您的浏览器不支持video标签，无法播放视频。</video>';
            },
            videoClose() {
                this.videoHtml = '';
            },
            addLike(row) { // 显示增加赞数
                this.likeVisible = true;
                this.likeData.id = row.id;
            },
            likeSubmit() {
                let _self = this;
                let paras = new FormData();
                paras.append("vpId", _self.likeData.id);
                paras.append("num", _self.likeData.num);
                httpPost('postsLike', paras, _self, function (res) {
                    try {
                        let {error, status, data} = res;
//                        _self.$message.success(data);
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
                _self.$message.success('已发送点赞请求');
                _self.likeVisible = false;
            },
            resetLike() {
                this.likeData.id = '';
                this.likeData.num = 0;
                this.likeData.loading = false;
            },
            handleEssence(row) {
                let _self = this;
                let paras = new FormData();
                paras.append("id", row.id);
                paras.append("status", Number(!row.isEssence));
                _self.tableLoading = true;
                httpPost('postsEssence', paras, _self, function (res) {
                    _self.tableLoading = false;
                    try {
                        let {error, status, data} = res;
                        _self.$message.success('操作成功');
                        _self.fetchList();
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            setStart(val) { //格式化日期控件值
                this.filters.start = val;
            },
            setEnd(val) {
                this.filters.end = val;
            },
            postsDel: function (row) { //软删除帖子
                let _self = this;
                let paras = new FormData();
                paras.append("id", row.id);
                paras.append("status", Number(!row.isDel));
                _self.tableLoading = true;
                httpPost('postsStatus', paras, _self, function (res) {
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
            if (this.$route.params.uid) {
                this.filters.uid = this.$route.params.uid;
            }
            this.fetchList();
        }
    }
</script>

<style scoped>
</style>
