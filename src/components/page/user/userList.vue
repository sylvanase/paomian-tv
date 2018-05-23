<template>
    <section>
        <!--顶部工具条-->
        <el-col :span="24" class="toolbar">
            <el-form :inline="true" :model="filters">
                <el-form-item>
                    <el-input v-model="filters.kw" placeholder="ID/昵称" icon="circle-close" :on-icon-click="resetSearch"
                              @keyup.enter.native="fetchList"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-select v-model="filters.sex" @change="fetchList" placeholder="请选择" style="width: 120px;">
                        <el-option label="全部性别" value=""></el-option>
                        <el-option label="男" value="0"></el-option>
                        <el-option label="女" value="1"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-input type="number" v-model="filters.phone" placeholder="手机号码" icon="circle-close"
                              :on-icon-click="resetSearchPhone" @keyup.enter.native="fetchList"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-select v-model="filters.os" @change="fetchList" placeholder="请选择" style="width: 120px;">
                        <el-option label="全部系统" value=""></el-option>
                        <el-option label="android" value="1"></el-option>
                        <el-option label="iOS" value="2"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-date-picker type="date" placeholder="注册开始时间" v-model="filters.start"
                                    style="width: 150px;" @change="setStart"></el-date-picker>
                    <span> - </span>
                    <el-date-picker type="date" placeholder="注册结束时间" v-model="filters.end"
                                    style="width: 150px;" @change="setEnd"></el-date-picker>
                </el-form-item>
                <el-form-item>
                    <el-select v-model="filters.region" @change="fetchCityFilter" style="width: 180px;"
                               filterable placeholder="请选择地区">
                        <el-option label="全部地区" value="0"></el-option>
                        <el-option v-for="item in regionList" :key="item.regionId" :label="item.regionName"
                                   :value="item.regionId"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-select v-model="filters.city" style="width: 180px;" @change="fetchList" filterable
                               placeholder="请选择城市">
                        <el-option label="全部城市" value="0"></el-option>
                        <el-option v-for="item in cityFilterList" :key="item.cityId" :label="item.cityName"
                                   :value="item.cityId"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="fetchList">查询</el-button>
                </el-form-item>
            </el-form>
        </el-col>

        <!--表格-->
        <el-table v-loading="tableLoading" :data="tableList" stripe border :max-height="tableHeight"
                  style="width: 100%;">
            <el-table-column prop="id" label="uid" min-width="100" fixed></el-table-column>
            <el-table-column prop="avatarUrl" label="头像" width="136">
                <template scope="scope">
                    <img v-if="scope.row.avatarUrl !== ''" class="user-avatar" :src="scope.row.avatarUrl" alt="用户头像"/>
                    <img v-else class="user-avatar" src="../../../../static/img/TV.png" alt="用户头像"/>
                </template>
            </el-table-column>
            <el-table-column prop="username" min-width="150" label="昵称">
                <template scope="scope">
                    <router-link :to="{ name: '帖子列表', query: { uid: scope.row.id }}">{{ scope.row.username }}
                    </router-link>
                </template>
            </el-table-column>
            <el-table-column label="用户分类" min-width="150">
                <template scope="scope">
                    {{ scope.row.userAttrNames ? scope.row.userAttrNames.join(' , ') : '无' }}
                </template>
            </el-table-column>
            <el-table-column prop="createTime" label="注册时间" min-width="120"></el-table-column>
            <el-table-column prop="fansCount" label="粉丝" sortable width="120">
                <template scope="scope">
                    <el-button v-if="scope.row.fansCount" size="small" @click="showFan(scope.row)">{{
                        scope.row.fansCount
                        }}
                    </el-button>
                    <span v-else>0</span>
                </template>
            </el-table-column>
            <el-table-column prop="carsCount" label="关注">
                <template scope="scope">
                    <el-button v-if="scope.row.carsCount" size="small" @click="showFollow(scope.row)">{{
                        scope.row.carsCount
                        }}
                    </el-button>
                    <span v-else>0</span>
                </template>
            </el-table-column>
            <el-table-column prop="postCount" label="帖子" sortable width="120">
                <template scope="scope">
                    <el-button v-if="scope.row.postCount" size="small" @click="showVideo(scope.row)">{{
                        scope.row.postCount
                        }}
                    </el-button>
                    <span v-else>0</span>
                </template>
            </el-table-column>
            <el-table-column prop="likeCount" label="喜欢">
                <template scope="scope">
                    <el-button v-if="scope.row.likeCount" size="small" @click="showLike(scope.row)">{{
                        scope.row.likeCount
                        }}
                    </el-button>
                    <span v-else>0</span>
                </template>
            </el-table-column>
            <el-table-column prop="sex" label="性别" width="80">
                <template scope="scope">
                    {{ scope.row.sex == 0 ? '男' : '女' }}
                </template>
            </el-table-column>
            <el-table-column prop="age" label="年龄"></el-table-column>
            <el-table-column prop="address" label="地址" min-width="200"></el-table-column>
            <el-table-column prop="phone" label="手机" min-width="150"></el-table-column>
            <el-table-column label="QQ" width="90">
                <template scope="scope">
                    <el-tag :type="scope.row.qqBind ? 'success' : 'danger'"
                            close-transition>{{ scope.row.qqBind ? '已绑定' : '未绑定' }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column label="微信" width="90">
                <template scope="scope">
                    <el-tag :type="scope.row.wxBind ? 'success' : 'danger'"
                            close-transition>{{ scope.row.wxBind ? '已绑定' : '未绑定' }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column label="微博" width="90">
                <template scope="scope">
                    <el-tag :type="scope.row.wbBind ? 'success' : 'danger'"
                            close-transition>{{ scope.row.wbBind ? '已绑定' : '未绑定' }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column label="注册设备" width="100">
                <template scope="scope">
                    {{ scope.row.registerDevice == 1 ? 'android' : 'ios' }}
                </template>
            </el-table-column>
            <el-table-column prop="userStatus" label="用户状态" width="130">
                <template scope="scope">
                    <el-tag :type="scope.row.userStatus == 0 ? 'success' : 'danger'"
                            close-transition>{{ scope.row.userStatus == 0 ? '正常' : '已删除' }}
                    </el-tag>
                    <el-tag :type="scope.row.userCare == 1 ? 'success' : 'danger'"
                            close-transition>{{ scope.row.userCare == 1 ? '已关注' : '未关注' }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column label="操作" width="300" fixed="right">
                <template scope="scope">
                    <el-button-group>
                        <el-button size="small" @click="showForm(scope.row)">编辑</el-button>
                        <el-button :type="scope.row.userStatus == 0 ? 'danger' : 'warning'" size="small"
                                   @click="userDel(scope.row)">
                            {{ scope.row.userStatus == 0 ? '删除' : '恢复' }}
                        </el-button>
                        <el-button :type="scope.row.userCare == 1 ? 'danger' : 'info'" size="small"
                                   @click="careUser(scope.row)">
                            {{ scope.row.userCare == 1 ? '取关' : '关注' }}
                        </el-button>
                        <el-button size="small" @click="addFan(scope.row)">加粉丝</el-button>
                        <el-button :disabled="scope.row.isShield == 1 ? true : false" size="small" type="danger" @click="shieldUser(scope.row)">
                            {{ scope.row.isShield == 1 ? '取消屏蔽' : '屏蔽' }}
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

        <!-- 为帖子增加弹幕 功能暂时废除 -->
        <!--<el-dialog title="弹幕列表" v-model="isShowBarrage">
            <el-col :span="24" class="toolbar" style="padding-bottom: 0;margin-top: -20px;">
                <el-form :inline="true" :model="barrage.filters">
                    <el-form-item>
                        <el-select v-model="barrage.filters.tag" @change="fetchBarrage" placeholder="请选择"
                                   style="width: 150px;">
                            <el-option label="全部标签" value=""></el-option>
                            <el-option v-for="item in barrage.tagList" :key="item.id" :label="item.name"
                                       :value="item.id">
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="submitBarrage()">提交</el-button>
                    </el-form-item>
                    <el-form-item>
                        <span>（点击弹幕内容，即可对其进行编辑操作）</span>
                    </el-form-item>
                </el-form>
            </el-col>
            &lt;!&ndash;表格&ndash;&gt;
            <el-table v-loading="tableLoading" class="tb-edit" :data="barrage.tableList" stripe border
                      style="width: 100%;"
                      @selection-change="handleSelectionChange" highlight-current-row>
                <el-table-column type="selection" width="55"></el-table-column>
                <el-table-column prop="id" label="id" width="150"></el-table-column>
                <el-table-column prop="text" label="弹幕内容">
                    <template scope="scope">
                        <el-input size="small" minlength="1" v-model.trim="scope.row.text" placeholder="请输入内容"
                                  @change="handleEdit(scope.$index, scope.row)"></el-input>
                        <span>{{scope.row.text}}</span>
                    </template>
                </el-table-column>
            </el-table>
            &lt;!&ndash;工具条&ndash;&gt;
            <el-col :span="24" class="mt-10" style="margin-bottom: 20px;">
                <el-pagination style="float:right;" @current-change="barragePageChange"
                               :page-size="10" :current-page="barrage.page"
                               layout="total, prev, pager, next, jumper" :total="barrage.total">
                </el-pagination>
            </el-col>

        </el-dialog>-->

        <!--播放弹窗-->
        <el-dialog title="视频播放" v-model="videoVisible" @close="videoClose()">
            <div style="text-align: center;" v-html="videoHtml"></div>
        </el-dialog>

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

        <!--用户粉丝-->
        <v-fan :userId="userId" v-model="isShowFan" v-on:preview="showForm"></v-fan>

        <!--用户关注-->
        <v-follow :userId="userId" v-model="isShowFollow" v-on:preview="showForm"></v-follow>

        <!--用户发帖-->
        <v-video :userId="userId" v-model="isShowVideo" v-on:audio="playVideo" v-on:preview="showComment"
                 v-on:like="showAddLike"></v-video>

        <!--用户喜欢-->
        <v-like :userId="userId" v-model="isShowLike" v-on:audio="playVideo" v-on:preview="showComment"
                v-on:like="showAddLike"></v-like>

        <!--编辑用户-->
        <v-detail :userId="userDetail" :category="catList" v-model="isShowForm" v-on:refresh="fetchList"></v-detail>

        <!--为帖子加评论-->
        <v-comment-add :postsData="postsData" v-model="isShowComment" v-on:refresh="fetchList"></v-comment-add>

        <!--为帖子点赞-->
        <v-like-add :postsId="addLikeId" v-model="likeVisible" v-on:refresh="fetchList"></v-like-add>
    </section>
</template>

<script type="es6">
    import util from '../../../api/util'
    import {httpGet, httpPost, httpDel} from '../../../api/api';
    import vDetail from './userDetail.vue'
    import vFan from './fansList.vue'
    import vFollow from './followList.vue'
    import vVideo from './videoList.vue'
    import vLike from './likeList.vue'
    import vCommentAdd from '../posts/commentSource.vue'
    import vLikeAdd from '../posts/likeAdd.vue'

    export default {
        components: {
            vFan,
            vFollow,
            vVideo,
            vLike,
            vDetail,
            vCommentAdd,
            vLikeAdd
        },
        data() {
            let validateNum = (rule, value, callback) => {
                if (value === '') {
                    callback(new Error('请输入粉丝数量'));
                } else {
                    if (value > 100) {
                        callback(new Error('数量不能超过100!'));
                    }
                }
            };
            return {
                filters: {
                    kw: '',
                    sex: '',
                    phone: '',
                    start: '',
                    end: '',
                    region: '0',
                    city: '0',
                    os: ''
                },
                total: 0, //表格列表数据总数
                page: 1, //当前页，默认为第一页
                tableHeight: '100%',
                tableLoading: false, //表格的loading符号
                tableList: [], //表格数据
                isShowForm: false,
                userDetail: '',
                regionList: [],
                cityFilterList: [],
                catList: [],
                userId: '', //用户id
                isShowFan: false, //显示、隐藏粉丝列表
                isShowFollow: false, //显示、隐藏关注列表
                isShowVideo: false, //显示、隐藏帖子列表
                isShowLike: false, //显示、隐藏喜欢列表
                isShowComment: false, //显示、隐藏评论库列表
                likeVisible: false, // 显示、隐藏点赞界面
                addLikeId: '', // 点赞的帖子id
                videoVisible: false,  //播放视频界面 显示、隐藏
                videoHtml: '',
                fanVisible: false,
                fanData: { // 为用户增加粉丝
                    title: '',
                    loading: false,
                    num: 0,
                    id: ''
                },
                fanRules: {
                    num: [
                        {validator: validateNum, trigger: 'blur'},
                        /*{ min: 6, max: 20, message: '密码长度在6到20个字符'}*/
                    ],
                },
                postsData: {}
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
                    id: '',
                    username: '',
                    sex: _self.filters.sex,
                    phone: _self.filters.phone,
                    registerDevice: _self.filters.os,
                    startTime: _self.filters.start,
                    endTime: _self.filters.end,
                    regionId: _self.filters.region,
                    cityId: _self.filters.city
                };
                if (isNaN(_self.filters.kw)) { //输入不为数字，值传入kw
                    paras.username = _self.filters.kw;
                } else {
                    paras.id = _self.filters.kw;
                }
                paras.offset = (_self.page - 1) * paras.size;
                _self.tableLoading = true;
                httpGet('userList', paras, _self, function (res) {
                    _self.tableLoading = false;
                    try {
                        let {error, status, data} = res;
                        _self.total = data.totalElements;
                        _self.tableList = data.content.map(function (item) { //格式化显示时间
                            item.createTime = util.timestampFormat(item.createTime, 'YYYY-MM-DD');
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
            resetSearchPhone() {
                this.filters.phone = '';
                this.fetchList();
            },
            setStart(val) { //格式化日期控件值
                this.filters.start = val;
            },
            setEnd(val) {
                this.filters.end = val;
            },
            showForm(row) { //显示用户详情表单
                this.isShowForm = true;
                this.userDetail = row.id;
            },

            showFan(row) { //显示用户粉丝列表
                this.isShowFan = true;
                this.userId = row.id;
            },
            showFollow(row) { //显示用户关注列表
                this.isShowFollow = true;
                this.userId = row.id;
            },
            showVideo(row) { //显示用户帖子列表
                this.isShowVideo = true;
                this.userId = row.id;
            },
            showLike(row) { //显示用户喜欢的帖子列表
                this.isShowLike = true;
                this.userId = row.id;
            },
            playVideo(row) { //播放视频
                this.videoVisible = true;
                this.videoHtml = '<video style="max-width: 100%;max-height:350px;" controls="controls" autoplay="autoplay">'
                    + '<source src="' + row.videoUrl + '" type="video/mp4">对不起，您的浏览器不支持video标签，无法播放视频。</video>';
            },
            videoClose() {
                this.videoHtml = '';
            },
            showComment(row) { //显示评论列表
                this.isShowComment = true;
                this.postsData = row
                /*this.fetchBarrage();
                this.barrageTag();
                this.barrage.vpId = row.id;*/
            },
            showAddLike(row) {
                this.likeVisible = true;
                this.addLikeId = row.id
            },
            userDel(row) { // 删除用户
                let _self = this;
                let paras = new FormData();
                paras.append("uid", row.id);
                paras.append("status", Number(!row.userStatus));
                _self.tableLoading = true;
                httpPost('userStatus', paras, _self, function (res) {
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
            careUser(row) { // 关注用户
                let _self = this;
                let paras = new FormData();
                paras.append("uid", row.id);
                paras.append("status", Number(!row.userCare));
                _self.tableLoading = true;
                httpPost('userCare', paras, _self, function (res) {
                    _self.tableLoading = false;
                    try {
                        _self.$message.success('操作成功');
                        _self.fetchList();
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            fetchRegion() { //获取省列表
                let _self = this;
                httpGet('regionList', '', _self, function (res) {
                    try {
                        let {error, status, data} = res;
                        _self.regionList = data;
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            fetchCityFilter() { //根据省id获取城市列表
                let _self = this;
                _self.filters.city = '0';
                httpGet('cityList', {regionId: _self.filters.region}, _self, function (res) {
                    try {
                        let {error, status, data} = res;
                        _self.cityFilterList = data;
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
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
                        _self.catList = data.content;
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },

            /*
             * 处理弹幕开始
             * */
            /*barragePageChange(val) { //翻页
                this.barrage.page = val;
                this.fetchBarrage();
            },
            fetchBarrage() {    //获取弹幕列表
                let _self = this;
                let paras = {
                    offset: 0,
                    size: 10,
                    tagId: _self.barrage.filters.tag
                };
                paras.offset = (_self.barrage.page - 1) * paras.size;
                _self.barrage.tableLoading = true;
                httpGet('barrageList', paras, _self, function (res) {
                    _self.barrage.tableLoading = false;
                    try {
                        let {error, status, data} = res;
                        _self.barrage.tableList = data.content;
                        _self.barrage.total = data.totalElements;
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            submitBarrage() { //提交所选弹幕
                let _self = this;
                let paras = new FormData();
                paras.append("vpId", _self.barrage.vpId);
                paras.append("barrageIds", _self.barrage.multipleBarrageIds.join(','));
                httpPost('postsBarrageAdd', paras, _self, function (res) {
                    try {
                        let {error, status, data} = res;
                        _self.$message.success('增加弹幕成功');
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            barrageTag() { //加载弹幕标签
                let _self = this;
                httpGet('barrageTag', '', _self, function (res) {
                    try {
                        let {error, status, data} = res;
                        _self.barrage.tagList = data;
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            handleSelectionChange(val) { //选择弹幕更改时
                //val为对象数组
                this.barrage.multipleBarrageIds = []; //先清空数组
                if (val.length !== 0) {
                    for (var i = 0; i < val.length; i++) {
                        this.barrage.multipleBarrageIds.push(val[i].id);
                    }
                }
            },
            handleEdit(index, row) {
                let _self = this;
                let paras = new FormData();
                paras.append("id", row.id);
                paras.append("text", row.text);
                httpPost('barrageEdit', paras, _self, function (res) {
                    try {
                        let {error, status, data} = res;
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },*/
            addFan(row) { // 显示增加粉丝弹窗
                this.fanVisible = true;
                this.fanData.id = row.id;
                this.fanData.title = '为"' + row.username + '"增加粉丝数量'
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
                        _self.fetchList();
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
            shieldUser(row){ // 屏蔽该用户
                let _self = this;
                let paras = {
                    uid: row.id,
                    operation: Number(!row.isShield)
                };
                httpGet('userShield', paras, _self, function (res) {
                    try {
                        let {error, status, data} = res;
                        _self.$message.success('操作成功');
                        row.isShield = Number(!row.isShield);
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            }
        },
        mounted() {
            if (this.$route.query.uid) {
//                this.filters.kw = this.$route.params.uid;
                this.filters.kw = this.$route.query.uid;
            }
            this.fetchList();
            this.fetchRegion();
            this.fetchCat();
        }
    }
</script>

<style>
    .user-avatar {
        width: 100px;
        height: 100px;
        border-radius: 50%;
        margin-top: 10px;
    }

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
