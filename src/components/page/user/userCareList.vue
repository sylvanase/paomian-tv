<template>
    <section>
        <el-col :span="24" class="toolbar" style="padding-bottom: 0;">
            <el-form :inline="true" :model="filters">
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
            </el-form>
        </el-col>
        <!--表格-->
        <el-table v-loading="tableLoading" :data="tableList" stripe border :max-height="tableHeight" style="width: 100%;">
            <el-table-column prop="id" label="uid" width="200" fixed></el-table-column>
            <el-table-column prop="avatarUrl" label="头像" width="136">
                <template scope="scope">
                    <img v-if="scope.row.avatarUrl" class="user-avatar" :src="scope.row.avatarUrl" alt="用户头像"/>
                    <img v-else class="user-avatar" src="../../../../static/img/TV.png" alt="用户头像"/>
                </template>
            </el-table-column>
            <el-table-column prop="username" min-width="150" label="昵称"></el-table-column>
            <el-table-column prop="createTime" label="注册时间" min-width="120"></el-table-column>
            <el-table-column prop="sex" label="性别" width="80">
                <template scope="scope">
                    {{ scope.row.sex == 0 ? '男' : '女' }}
                </template>
            </el-table-column>
            <el-table-column prop="age" label="年龄" width="66"></el-table-column>
            <el-table-column prop="fansCount" label="粉丝" width="120">
                <template scope="scope">
                    {{ scope.row.fansCount ? scope.row.fansCount : '0' }}
                </template>
            </el-table-column>
            <el-table-column prop="carsCount" label="关注">
                <template scope="scope">
                    {{ scope.row.carsCount ? scope.row.carsCount : '0' }}
                </template>
            </el-table-column>
            <el-table-column prop="postCount" label="帖子" width="120">
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
            <el-table-column prop="address" label="地址" min-width="200"></el-table-column>
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
            <el-table-column label="操作" fixed="right" width="170">
                <template scope="scope">
                    <el-button :disabled="!scope.row.postCount" type="info" size="small" @click="showVideo(scope.row)">
                        查看帖子
                    </el-button>
                    <el-button type="danger" size="small" @click="careUser(scope.row)">
                        取关
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

        <!--播放弹窗-->
        <el-dialog title="视频播放" v-model="videoVisible" @close="videoClose()">
            <div style="text-align: center;" v-html="videoHtml"></div>
        </el-dialog>

        <!--用户发帖-->
        <v-video :userId="userId" v-model="isShowVideo" v-on:audio="playVideo" v-on:preview="showBarrage" v-on:like="addLike"></v-video>

        <!--用户喜欢-->
        <v-like :userId="userId" v-model="isShowLike" v-on:audio="playVideo" v-on:preview="showBarrage"></v-like>

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


        <!-- 为帖子增加弹幕 -->
        <el-dialog title="弹幕列表" v-model="isShowBarrage">
            <el-col :span="24" class="toolbar" style="padding-bottom: 0;margin-top: -20px;">
                <el-form :inline="true" :model="barrage.filters">
                    <el-form-item>
                        <el-select v-model="barrage.filters.tag" @change="fetchBarrage" placeholder="请选择" style="width: 150px;">
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
            <!--表格-->
            <el-table v-loading="tableLoading" class="tb-edit" :data="barrage.tableList" stripe border style="width: 100%;"
                      @selection-change="handleSelectionChange" highlight-current-row>
                <el-table-column type="selection" width="55"></el-table-column>
                <el-table-column prop="id" label="id" width="150"></el-table-column>
                <el-table-column prop="text" label="弹幕内容">
                    <template scope="scope">
                        <el-input size="small" minlength="1" v-model.trim="scope.row.text" placeholder="请输入内容" @change="handleEdit(scope.$index, scope.row)"></el-input> <span>{{scope.row.text}}</span>
                    </template>
                </el-table-column>
            </el-table>
            <!--工具条-->
            <el-col :span="24" class="mt-10" style="margin-bottom: 20px;">
                <el-pagination style="float:right;" @current-change="barragePageChange"
                               :page-size="10" :current-page="barrage.page"
                               layout="total, prev, pager, next, jumper" :total="barrage.total">
                </el-pagination>
            </el-col>

        </el-dialog>
    </section>
</template>

<script type="es6">
    import util from '../../../api/util'
    import { httpGet, httpPost} from '../../../api/api';
    import vVideo from './videoList.vue'
    import vLike from './likeList.vue'

    export default {
        components: {
            vVideo,
            vLike
        },
        data() {
            let validateLike = (rule, value, callback) => {
                if (value === '') {
                    callback(new Error('请输入赞数量'));
                } else {
                    if (value > 100) {
                        callback(new Error('数量不能超过1000!'));
                    }
                }
            };
            return {
                filters: { //搜索筛选条件
                    category: '', // 分类
                },
                catSelect: '', // 用户分类列表
                total: 0, //表格列表数据总数
                page: 1, //当前页，默认为第一页
                tableHeight: '100%',
                tableLoading: false, //表格的loading符号
                tableList: [], //表格数据
                userId: '',
                isShowLike: false, //显示、隐藏喜欢列表
                isShowVideo: false, //显示、隐藏帖子列表
                isShowBarrage: false, //显示、隐藏弹幕列表
                videoVisible: false,  //播放视频界面 显示、隐藏
                videoHtml: '',
                barrage: {
                    vpId: '', //视频id
                    tagList:[],
                    total: 0, //表格列表数据总数
                    page: 1, //当前页，默认为第一页
                    tableLoading: false, //表格的loading符号
                    tableList: [], //表格数据
                    filters: { //搜索筛选条件
                        tag: ''
                    },
                    multipleBarrageIds: [] //添加的弹幕id集合
                },
                likeVisible: false,
                likeData: { // 点赞
                    loading: false,
                    num: 0,
                    id: ''
                },
                likeRules: {
                    num: [
                        {validator: validateLike, trigger: 'blur'},
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
                _self.tableHeight = document.getElementById('container').clientHeight - 77 - 42 - 15;
                let paras = {
                    offset: 0,
                    size: 10
                };
                paras.offset = (_self.page - 1) * paras.size;
                _self.tableLoading = true;
                httpGet('userCareOperate', paras, _self, function (res) {
                    _self.tableLoading = false;
                    try {
                        let { error, status,data } = res;
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
            catList(){
                let _self = this;
                let para = {
                    offset: 0,
                    size: 99999
                };
                httpGet('userCategory', para, _self, function (res) {
                    try {
                        let { error, status,data } = res;
                        _self.catSelect = data.content;
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            showVideo (row){ //显示用户帖子列表
                this.isShowVideo = true;
                this.userId = row.id;
            },
            playVideo(row){ //播放视频
                this.videoVisible = true;
                this.videoHtml = '<video style="max-width: 100%;max-height:350px;" controls="controls" autoplay="autoplay">'
                    + '<source src="' + row.videoUrl + '" type="video/mp4">对不起，您的浏览器不支持video标签，无法播放视频。</video>';
            },
            videoClose(){
                this.videoHtml = '';
            },
            showBarrage (row){ //显示弹幕列表
                this.isShowBarrage = true;
                this.fetchBarrage();
                this.barrageTag();
                this.barrage.vpId = row.id;
            },
            showLike (row){ //显示用户喜欢的帖子列表
                this.isShowLike = true;
                this.userId = row.id;
            },
            //运营取关用户
            careUser: function (row) {
                let _self = this;
                _self.tableLoading = true;
                let paras = new FormData();
                paras.append("uid", row.id);
                paras.append("status", Number(!row.userCare));
                httpPost('userCare', paras, _self, function (res) {
                    try {
                        let { error, status,data } = res;
                        _self.$message.success('操作成功');
                        _self.fetchList();
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            /*
             * 处理弹幕开始
             * */
            barragePageChange(val) { //翻页
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
                        let { error, status,data } = res;
                        _self.barrage.tableList = data.content;
                        _self.barrage.total = data.totalElements;
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            submitBarrage(){ //提交所选弹幕
                let _self = this;
                let paras = new FormData();
                paras.append("vpId", this.barrage.vpId);
                paras.append("barrageIds", this.barrage.multipleBarrageIds.join(','));
                httpPost('postsBarrageAdd', paras, _self, function (res) {
                    try {
                        let { error, status,data } = res;
                        _self.$message.success('增加弹幕成功');
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            barrageTag(){ //加载弹幕标签
                let _self = this;
                httpGet('barrageTag', '', _self, function (res) {
                    try {
                        let { error, status,data } = res;
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
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
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
            }
        },
        mounted() {
            this.fetchList();
            this.catList();
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
    .tb-edit .current-row .el-input+span {
        display: none
    }
    .user-avatar {
        width: 100px;
        height: 100px;
        border-radius: 50%;
        margin-top: 10px;
    }
</style>
