<template>
    <section>
        <!--顶部工具条-->
        <el-col :span="24" class="toolbar">
            <el-form :inline="true" :model="filters">
                <el-form-item>
                    <el-input v-model="filters.kw" placeholder="ID/关键字" icon="circle-close"
                              :on-icon-click="resetSearch" @keyup.enter.native="fetchList"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-select v-model="filters.type" style="width: 110px;">
                        <el-option label="按帖子搜" value="0"></el-option>
                        <el-option label="按用户搜" value="1"></el-option>
                        <el-option label="按剧本搜" value="2"></el-option>
                        <el-option label="按音乐搜" value="3"></el-option>
                    </el-select>
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
                    <el-select v-model="filters.checked" @change="fetchList" style="width: 110px;">
                        <el-option label="审核状态" value=""></el-option>
                        <el-option label="已审核" value="1"></el-option>
                        <el-option label="未审核" value="0"></el-option>
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
                    <el-button type="primary" @click="showForm('','detail')">新增</el-button>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click.native="excelVisible = true">数据导出</el-button>
                </el-form-item>
            </el-form>
        </el-col>

        <!--表格-->
        <el-table v-loading="tableLoading" :data="tableList" stripe border :max-height="tableHeight"
                  style="width: 100%;">
            <el-table-column prop="username" label="发帖人" width="150" fixed>
                <template scope="scope">
                    <div :ref="'user' + scope.$index">
                        <router-link target="_blank"  :to="{ name: '用户列表', query: { uid: scope.row.uid }}" @mouseover.native="popUser(scope.row.uid, scope.$index)" @mouseout.native="hideUser(false)">
                            {{ scope.row.username }}
                        </router-link>
                    </div>
                </template>
            </el-table-column>
            <!-- <el-table-column prop="id" label="id" width="180"></el-table-column> -->
            <el-table-column prop="coverUrl" label="封面(点击播放)" width="135">
                <template scope="scope">
                    <img @click="playVideo(scope.row)" v-if="scope.row.coverUrl !== ''"
                         style="width: 100%;cursor: pointer;vertical-align:middle;margin:10px auto;"
                         :src="scope.row.coverUrl" alt="视频封面"/>
                    <span @click="playVideo(scope.row)" v-else>封面为空</span>
                </template>
            </el-table-column>
            <el-table-column prop="id" label="帖子id" min-width="180"></el-table-column>
            <el-table-column prop="videoText" min-width="200" label="帖子描述">
                <template scope="scope">
                    {{ scope.row.topicName ? '#'+ scope.row.topicName + '#' : '' }}{{ scope.row.videoText }}
                </template>
            </el-table-column>
            <el-table-column prop="createTime" label="发帖时间" min-width="180"></el-table-column>
            <el-table-column prop="checker" label="审核人"></el-table-column>
            <el-table-column label="显示">
                <template scope="scope">
                    <el-tag :type="scope.row.isDel == 0 ? 'success' : 'danger'"
                            close-transition>{{ scope.row.isDel == 0 ? '是' : '否' }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column label="精华" width="80">
                <template scope="scope">
                    <el-tag :type="scope.row.isEssence == 1 ? 'success' : 'danger'"
                            close-transition>{{ scope.row.isEssence == 1 ? '是' : '否' }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="videoInfoPo.likeCount" label="喜欢"></el-table-column>
            <el-table-column prop="videoInfoPo.commentCount" label="评论数"></el-table-column>
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
            <el-table-column label="来源">
                <template scope="scope">
                    {{ scope.row.publishType == 1 ? '后台' : '客户端' }}
                </template>
            </el-table-column>
            <el-table-column label="操作" width="260" fixed="right">
                <template scope="scope">
                    <el-button-group>
                        <el-button size="small" @click="showForm(scope.row, 'detail')">编辑</el-button>
                        <el-button size="small" @click="showForm(scope.row, 'postsComment')">帖子评论</el-button>
                        <el-button :disabled="scope.row.isDel == 1 ? true : false" size="small" type="info" @click="showForm(scope.row, 'comment')">加评论
                        </el-button>
                    </el-button-group>
                    <el-button-group class="mt-10">
                        <el-button :disabled="scope.row.isDel == 1 ? true : false" size="small" type="success"  @click="showAddLike(scope.row)">点赞
                        </el-button>
                        <el-button :type="scope.row.isEssence == 1 ? 'danger' : 'success'" size="small" @click="handleEssence(scope.row)">
                            {{ scope.row.isEssence == 1 ? '取精' : '加精' }}
                        </el-button>
                        <el-button size="small" :type="scope.row.isNoRecommend == 1 ? 'danger' : 'warning'" @click="noRecommend(scope.row)">
                            {{ scope.row.isNoRecommend == 1 ? '取消不推荐' : '不推荐'}}
                        </el-button>
                        <el-button size="small" @click="addToRecommend(scope.row)">
                            推荐池
                        </el-button>
                    </el-button-group>
                    <el-button-group class="mt-10">
                        <el-button size="small" @click="postsTag(scope.row)">帖子标签</el-button>
                        <el-button size="small" :disabled="scope.row.checked == 1 ? true : false" type="danger" @click="checkPost(scope.row)">
                            {{ scope.row.checked == 1 ? '已审核' : '审核' }}
                        </el-button>
                        <el-button :type="scope.row.isDel == 0 ? 'danger' : 'warning'" size="small"
                                   @click="postsDel(scope.row)">
                            {{ scope.row.isDel == 0 ? '删除' : '恢复' }}
                        </el-button>
                    </el-button-group>
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

        <!-- hover显示用户详情 -->
        <div v-show="showPopUser" ref="userDetail" style="width: 350px;position: fixed;background-color: #fff;border: 1px solid #eee;border-radius5px;padding: 20px;z-index: 999;" @mouseover="hideUser(true)" @mouseout="hideUser(flase)">
            <el-row style="padding-bottom: 10px;border-bottom: 1px solid #eee;">
                <el-col :span="16">
                    <div>
                        用户名：{{ userData.name }}
                    </div>
                    <div style="margin-top: 10px;">
                        地&nbsp;&nbsp;址：{{ userData.address }}
                    </div>
                    <div style="margin-top: 10px;">
                        用户分类：{{ userData.category}}
                    </div style="margin-top: 10px;">
                    <div style="margin-top: 10px;">
                        手机号：{{ userData.phone }}
                    </div style="margin-top: 10px;">
                    <div>
                        注册时间：{{ userData.registerTime }}
                    </div>
                </el-col>
                <el-col :span="8">
                    <img v-if="userData.avatar !== ''" style="width:100px;height: 100px; border-radius: 50%;" :src="userData.avatar" alt="用户头像"/>
                    <img v-else style="width:100px;height: 100px; border-radius: 50%;" src="../../../../static/img/TV.png" alt="用户头像"/>
                </el-col>
            </el-row>
            <el-row style="padding: 10px;">
                <el-col :span="12">
                    粉丝数： {{ userData.fans}}
                </el-col>
                <el-col :span="12">
                    关注数：{{ userData.follow}}
                </el-col>
                <el-col :span="12" style="margin-top: 10px;">
                    喜&nbsp;&nbsp;欢：{{ userData.like}}
                </el-col>
                <el-col :span="12" style="margin-top: 10px;">
                    帖子数：{{ userData.posts}}
                </el-col>
            </el-row> 
            <el-row>
                <el-col :span="24">
                    <el-button size="small" @click="showUserForm()">编辑</el-button>
                    <el-button :type="userData.userCare == 1 ? 'danger' : 'info'" size="small"
                        @click="careUser()">
                        {{ userData.userCare == 1 ? '取关' : '关注' }}
                    </el-button>
                    <el-button size="small" @click="addFan()">加粉丝</el-button>
                    <el-button size="small" type="danger" @click="shieldUser">
                        {{ userData.isShield == 1 ? '取消屏蔽' : '屏蔽' }}
                    </el-button>
                </el-col>
            </el-row>  
        </div>

        <!--帖子编辑-->
        <v-detail :postsData="postsData" v-model="isShowForm" v-on:refresh="fetchList"></v-detail>

        <!--播放弹窗-->
        <el-dialog title="视频播放" v-model="videoVisible" @close="videoClose()">
            <div>
                视频ID： {{ videoData.id }}    
            </div>
            <div class="mt-10" style="text-align: center;" v-html="videoHtml"></div>
            <div style="text-align: center;">
                <el-button-group class="mt-10">
                    <el-button :disabled="videoData.isDel == 1 ? true : false" size="small" type="info"
                               @click="showForm(videoData, 'comment')">加评论
                    </el-button>
                    <el-button size="small" :type="videoData.isNoRecommend == 1 ? 'danger' : 'warning'"
                               @click="noRecommend(videoData)">
                        <!--isNoRecommend 1 帖子为不推荐状态，需要取消改状态-->
                        {{ videoData.isNoRecommend == 1 ? '取消不推荐' : '不推荐'}}
                    </el-button>
                    <el-button :disabled="videoData.isDel == 1 ? true : false" size="small" type="success"  @click="showAddLike(videoData)">点赞
                            </el-button>
                    <el-button :type="videoData.isEssence == 1 ? 'danger' : 'success'" size="small"
                               @click="handleEssence(videoData)">
                        {{ videoData.isEssence == 1 ? '取精' : '加精' }}
                    </el-button>
                    <el-button size="small" @click="showForm(videoData, 'postsComment')">帖子评论</el-button>
                    <el-button size="small" :disabled="videoData.checked == 1 ? true : false" type="danger" @click="checkPost(videoData)">
                        {{ videoData.checked == 1 ? '已审核' : '审核' }}
                    </el-button>
                    <el-button :type="videoData.isDel == 0 ? 'danger' : 'warning'" size="small"
                               @click="postsDel(videoData)">
                        {{ videoData.isDel == 0 ? '删除' : '恢复' }}
                    </el-button>
                </el-button-group>
            </div>
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

        <!--为评论点赞-->
        <v-comment-like :commentId="commentId" v-model="comLikeVisible"></v-comment-like>

        <!--帖子评论列表-->
        <v-comment-list :postsData="postsData" v-model="isShowPostsComment" v-on:like="showCommentLike" v-on:refresh="fetchList"></v-comment-list>


        <!--为帖子加评论-->
        <v-comment-add :postsData="postsData" v-model="isShowComment" v-on:refresh="fetchList"></v-comment-add>

        <!--编辑用户-->
        <v-user-detail :userId="userData.id" :category="userCatList" v-model="isShowUser"></v-user-detail>

        <!--为帖子点赞-->
        <v-like-add :postsId="addLikeId" v-model="likeVisible" v-on:refresh="fetchList"></v-like-add>

        <!--增加粉丝-->
        <el-dialog :title="fanData.title" v-model="fanVisible" @close="resetFan" size="tiny">
            <el-form :model="fanData" label-width="80px" :rules="fanRules" ref="fanData" style="margin-bottom: -20px;">
                <el-form-item label="粉丝数量" prop="num" style="margin-bottom: -20px;">
                    <el-input-number placeholder="单次限制最多100个" step="1" :min="1" :max="100"
                                     v-model="fanData.num"></el-input-number>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button size="small" @click.native="fanVisible = false">取消</el-button>
                <el-button size="small" type="primary" @click.native="fanSubmit" :loading="fanData.loading">提交
                </el-button>
            </div>
        </el-dialog>

        <!-- 新增/编辑帖子标签 -->
        <el-dialog title="帖子标签" v-model="tagVisible" @close="resetTag" size="tiny">
            <div style="margin-bottom: 10px;">
                帖子id：{{ tagData.id }}
            </div>
            <el-form :model="tagData" label-width="80px" :rules="tagRules" ref="tagData">
                <el-form-item label="一级标签" prop="level1">
                    <el-select v-model="tagData.level1" placeholder="请选择" @change="fetchTagList(2)">
                        <el-option v-for="item in level1List" :key="item.id" :label="item.tag" :value="item.id">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="二级标签" prop="level2">
                    <el-select v-model="tagData.level2" :disabled="level2Disabled" placeholder="请选择" @change="fetchTagList(3)">
                        <el-option v-for="item in level2List" :key="item.id" :label="item.tag" :value="item.id" >
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="三级标签" prop="level3" style="margin-bottom: -20px;">
                    <el-select v-model="tagData.level3" :disabled="level3Disabled" placeholder="请选择" multiple>
                        <el-option v-for="item in level3List" :key="item.id" :label="item.tag" :value="item.id">
                        </el-option>
                    </el-select>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button size="small" @click.native="tagVisible = false">取消</el-button>
                <el-button size="small" type="primary" @click.native="tagSubmit" :loading="tagData.loading">提交
                </el-button>
            </div>
        </el-dialog>
    </section>
</template>

<script type="es6">
    import util from '../../../api/util'
    import {httpGet, httpPost} from '../../../api/api';
    import vDetail from './postsDetail.vue'
    import vCommentAdd from './commentSource.vue'
    import vCommentList from './postsCommentList.vue'
    import vLikeAdd from './likeAdd.vue'
    import vCommentLike from './commentLike.vue' // 为评论点赞
    import vUserDetail from '../user/userDetail.vue'

    export default {
        components: {
            vDetail,
            vCommentAdd,
            vCommentList,
            vLikeAdd,
            vCommentLike,
            vUserDetail,
        },
        data() {
            return {
                filters: {
                    kw: '',
                    id: '',
                    type: '0', // 默认按帖子搜
                    start: '',
                    end: '',
                    isDel: '',
                    isEssence: '',
                    minLikeCount: '',
                    maxLikeCount: '',
                    checked: ''
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
                // isShowVideo: false, //显示、隐藏话题视频列表
                videoVisible: false,  //播放视频界面 显示、隐藏
                videoData: {}, // 播放的视频信息
                videoHtml: '',
                likeVisible: false, // 显示、隐藏点赞界面
                addLikeId: '',  // 点赞的帖子id
                comLikeVisible: false, // 显示、隐藏评论点赞界面
                commentId: '', // 需要点赞的评论id
                showPopUser: false, // 显示用户详情悬浮
                userData: { // 用户详情
                    id: '',
                    avatar: '',
                    name:'',
                    address:'',
                    category: [],
                    phone: '',
                    registerTime: '',
                    fans: 0,
                    like: 0,
                    posts: 0,
                    follow: 0,
                    isShield: '',
                    userCare: ''
                },
                userCatList: [],
                _timer: '', // 显示用户详情弹窗的定时器
                isShowUser: false, // 显示、隐藏用户编辑页
                isShowFan: false, //显示、隐藏粉丝列表
                isShowFollow: false, //显示、隐藏关注列表
                isShowVideo: false, //显示、隐藏帖子列表
                isShowLike: false, //显示、隐藏喜欢列表
                fanVisible: false,
                fanData: { // 为用户增加粉丝
                    title: '',
                    loading: false,
                    num: 0,
                    id: ''
                },
                tagVisible: false, // 显示、隐藏为帖子添加标签
                tagData: {
                    id: '',
                    level1: '',
                    level2: '',
                    level3: [],
                    loading: false,
                    isEdit: false // 是否为编辑帖子标签
                },
                tagOldData: {
                    level2: '',
                    level3: []
                },
                level1List:[],
                level2List:[],
                level3List:[],
                level2Disabled: true,
                level3Disabled: true,
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
                _self.tableHeight = document.getElementById('container').clientHeight - 124 - 42 - 15;
                let paras = {
                    offset: 0,
                    type: _self.filters.type,
                    size: 10,
                    startTime: _self.filters.start,
                    endTime: _self.filters.end,
                    del: _self.filters.isDel,
                    isEssence: _self.filters.isEssence,
                    minLikeCount: _self.filters.minLikeCount,
                    maxLikeCount: _self.filters.maxLikeCount,
                    kw: '',
                    id: '',
                    checked: _self.filters.checked
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
                this.videoData = row;
                this.videoHtml = '<video style="max-width: 100%;max-height:350px;" controls="controls" autoplay="autoplay">'
                    + '<source src="' + row.videoUrl + '" type="video/mp4">对不起，您的浏览器不支持video标签，无法播放视频。</video>';
            },
            videoClose() {
                this.videoHtml = '';
            },
            showAddLike(row) {
                this.likeVisible = true;
                this.addLikeId = row.id
            },
            handleEssence(row) {
                let _self = this;
                let paras = new FormData();
                paras.append("id", row.id);
                paras.append("status", Number(!row.isEssence));
                httpPost('postsEssence', paras, _self, function (res) {
                    try {
                        let {error, status, data} = res;
                        _self.$message.success('操作成功');
                        // 点赞数少于1000，执行点赞操作
                        if(row.videoInfoPo.likeCount < 1000){
                            let _self = this,
                                num = 1000 + Math.floor(Math.random()*100);
                            let paras = new FormData();
                            paras.append("vpId", row.id);
                            paras.append("num", num);
                            httpPost('postsLike', paras, _self, function (res) {
                                try {
                                } catch (error) {
                                    util.jsErrNotify(error);
                                }
                            })
                            row.videoInfoPo.likeCount += num;
                        }
                        row.isEssence = Number(!row.isEssence);
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
            postsDel(row) { //软删除帖子
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
            },
            noRecommend(row) { // 将帖子加入不推荐队列
                let _self = this;
                let paras = {
                    id: row.id
                };
                let _api = 'postsNoRecommend'; // 默认是加入不推荐的api
                if (row.isNoRecommend == 1) {
                    _api = 'postsNoRecommendDel';
                }
                httpGet(_api, paras, _self, function (res) {
                    _self.tableLoading = false;
                    try {
                        let {error, status, data} = res;
                        _self.$message.success('操作成功');
                        row.isNoRecommend = Number(!row.isNoRecommend);
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            showCommentLike(row) {
                this.comLikeVisible = true;
                this.commentId = row.id
            },
            popUser(uid, index){  // 显示用户详情
                let _self = this,
                    domLinkStyle = _self.$refs['user' + index].childNodes[0].getBoundingClientRect(), // 表格内用户昵称dom
                    domPop = _self.$refs['userDetail']; // 用户详情dom
                // 获取用户详情
                httpGet('userList', {id: uid}, _self, function (res) {
                    try {
                        let data = res.data.content[0];
                        _self.userData = {
                            id: uid,
                            name: data.username,
                            avatar: data.avatarUrl,
                            registerTime: util.timestampFormat(data.createTime),
                            address: data.address,
                            category: data.userAttrNames.join(' , '),
                            phone: data.phone,
                            fans: data.fansCount,
                            like: data.likeCount,
                            posts: data.postCount,
                            follow: data.carsCount,
                            isShield: data.isShield,
                            userCare: data.userCare
                        };
                        domPop.style.top = (domLinkStyle.top - 140) + 'px';
                        domPop.style.left = 270 + 'px';
                        _self.showPopUser = true;
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            hideUser(is){ // 隐藏用户详情
                let _self = this;
                if(!is){ // 隐藏详情
                    _self._timer = setTimeout(function(){
                        _self.showPopUser = is;
                    }, 1000);
                } else { // 不隐藏
                    clearTimeout(_self._timer);
                    _self.showPopUser = is;
                }  
            },
            showUserForm() { //显示用户编辑页
                this.isShowUser = true;
            },
            fetchCat() { // 获取用户分类
                let _self = this;
                let paras = {
                    offset: 0,
                    size: 9999
                };
                httpGet('userCategory', paras, _self, function (res) {
                    try {
                        let {data} = res;
                        _self.userCatList = data.content;
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            checkPost(row){ // 审核帖子
                let _self = this;
                httpGet('postsCheck', {id: row.id, text: '',advice: 0}, _self, function (res) {
                    try {
                        let {error, status, data} = res;
                        row.checked = 1;
                        _self.$message.success('操作成功');
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            careUser() { // 关注用户
                let _self = this;
                let paras = new FormData();
                paras.append("uid", _self.userData.id);
                paras.append("status", Number(!_self.userData.userCare));
                httpPost('userCare', paras, _self, function (res) {
                    try {
                        _self.$message.success('操作成功');
                        _self.userData.userCare = Number(!_self.userData.userCare);
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            shieldUser(){ // 屏蔽该用户
                let _self = this;
                let paras = {
                    uid: _self.userData.id,
                    operation: Number(!_self.userData.isShield)
                };
                httpGet('userShield', paras, _self, function (res) {
                    try {
                        _self.$message.success('操作成功');
                        _self.userData.isShield = Number(!_self.userData.isShield);
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            addFan() { // 显示增加粉丝弹窗
                this.fanVisible = true;
                this.fanData.id = this.userData.id;
                this.fanData.title = '为"' + this.userData.name + '"增加粉丝数量'
            },
            fanSubmit() { // 提交增加的粉丝数
                let _self = this;
                let paras = new FormData();
                paras.append("num", _self.fanData.num);
                paras.append("followId", _self.fanData.id);
                _self.fanData.loading = true;
                httpPost('userFansAdd', paras, _self, function (res) {
                    _self.fanData.loading = false;
                    try {
                        _self.$message.success('成功增加粉丝' + res.data + '个');
                        _self.fanVisible = false;
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                }, function (res) {
                    _self.$message.error(res.data.error);
                    _self.fanData.loading = false;
                })
            },
            resetFan() { // 重置增加粉丝弹窗中的数据
                this.fanData.id = '';
                this.fanData.num = 0;
                this.fanData.loading = false;
            },
            postsTag(row){
                let _self = this;
                _self.tagVisible = true;
                _self.tagData.id = row.id;
                _self.fetchTagList(1);
                httpGet('postsTag', { vpId: row.id }, _self, function (res) {
                    let { data } = res;
                    if(data.length > 0){
                        _self.tagData.isEdit = true; // 更改状态
                        _self.tagData.level1 = data[0].id;
                        _self.tagOldData.level2 = data[1].id;
                        let arr = [];
                        data.slice(2).map(function(item){
                            arr.push(item.id);
                        })
                        _self.tagOldData.level3 = arr;
                    }
                })
            },
            fetchTagList(level){ // 加载标签菜单
                let _self = this;
                // 清空标签选项，并在加载完成前不可选
                if(level == 2){
                    _self.level2Disabled = true;
                    _self.level3Disabled = true;
                    _self.tagData.level2 = '';
                    _self.tagData.level3 = [];
                } else if(level == 3){
                    _self.level3Disabled = true;
                    _self.tagData.level3 = [];
                    if(_self.tagData.level2 == ''){
                        return;
                    }
                }
                httpGet('postsTagLevelList', { level: level }, _self, function (res) {
                    let { data } = res;
                    if(level == 1){
                        _self.level1List = data;
                    } else{
                        let arr = data.filter(function(item){
                            if(item.parentId == _self.tagData['level' + (level - 1)]){
                                return item;
                            }
                        });
                        _self['level'+ level +'List'] = arr; 
                        // 置为可选
                        _self['level' + level + 'Disabled'] = false; 
                        if(_self.tagData.isEdit){ // 编辑状态
                            if(level == 2){
                                _self.tagData.level2 = _self.tagOldData.level2;
                            } else if(level == 3){
                                _self.tagData.level3 = _self.tagOldData.level3;
                                _self.tagData.isEdit = false;
                            }
                        }
                    }
                })
            },
            resetTag(){
                let _self = this;
                _self.level2Disabled = true;
                _self.level3Disabled = true;
                _self.level1List = [];
                _self.level2List = [];
                _self.level3List = [];
                _self.tagData = {
                    id: '',
                    level1: '',
                    level2: '',
                    level3: [],
                    loading: false,
                    isEdit: false
                };
                _self.tagOldData = {
                    level2: '',
                    level3: []
                }
            },
            tagSubmit() { // 提交帖子标签
                let _self = this;
                let arr = [_self.tagData.level1, _self.tagData.level2];
                let paras = new FormData();
                paras.append("tagIds", arr.concat(_self.tagData.level3));
                paras.append("vpId", _self.tagData.id);
                _self.tagData.loading = true;
                httpPost('postsTagRelation', paras, _self, function (res) {
                    _self.tagData.loading = false;
                    try {
                        _self.$message.success('操作成功');
                        _self.tagVisible = false;
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                }, function (res) {
                    _self.$message.error(res.data.error);
                    _self.tagData.loading = false;
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
                window.open(location.origin + '/video/export?startDate=' + _self.excelData.start + '&endDate=' + _self.excelData.end);
            },
            addToRecommend(row){ // 加入推荐池
                let _self = this;
                let paras = new FormData();
                paras.append('vpId', row.id)
                httpPost('postsRecommendSave', paras, _self, function (res) {
                    try {
                        _self.$message.success('操作成功');
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            }
        },
        mounted() {
            if (this.$route.query.uid) {
                this.filters.kw = this.$route.query.uid;
                this.filters.type = '1';
            }
            this.fetchList();
            this.fetchCat();
        }
    }
</script>

<style>
.user-avatar {
    width: 100%;
    height: 100%;
    border-radius: 50%;
}
</style>
