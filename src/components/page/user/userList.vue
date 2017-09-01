<template>
    <section>
        <!--顶部工具条-->
        <el-col :span="24" class="toolbar" style="padding-bottom: 0;">
            <el-form :inline="true" :model="filters">
                <el-form-item>
                    <el-input v-model="filters.kw" placeholder="ID/昵称"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-select v-model="filters.sex" @change="fetchList" placeholder="请选择" style="width: 120px;">
                        <el-option label="全部性别" value=""></el-option>
                        <el-option label="男" value="0"></el-option>
                        <el-option label="女" value="1"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-input type="number" v-model="filters.phone" placeholder="手机号码"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-select v-model="filters.os" @change="fetchList" placeholder="请选择" style="width: 120px;">
                        <el-option label="全部系统" value=""></el-option>
                        <el-option label="android" value="0"></el-option>
                        <el-option label="iOS" value="1"></el-option>
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
                    <el-select v-model="filters.city" style="width: 180px;" filterable placeholder="请选择城市">
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
        <el-table v-loading="tableLoading" :data="tableList" stripe border style="width: 100%;">
            <el-table-column prop="id" label="uid" min-width="100" fixed></el-table-column>
            <el-table-column prop="avatarUrl" label="头像" width="136">
                <template scope="scope">
                    <img v-if="scope.row.avatarUrl !== ''" class="user-avatar" :src="scope.row.avatarUrl" alt="用户头像"/>
                    <img v-else class="user-avatar" src="../../../../static/img/TV.png" alt="用户头像"/>
                </template>
            </el-table-column>
            <el-table-column prop="username" min-width="150" label="昵称"></el-table-column>
            <el-table-column prop="createTime" label="注册时间" min-width="120"></el-table-column>
            <el-table-column prop="sex" label="性别" width="80">
                <template scope="scope">
                    {{ scope.row.sex === 0 ? '男' : '女' }}
                </template>
            </el-table-column>
            <el-table-column prop="age" label="年龄"></el-table-column>
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
            <el-table-column label="设备" width="100">
                <template scope="scope">
                    {{ scope.row.registerDevice === 0 ? 'android' : 'ios' }}
                </template>
            </el-table-column>
            <!--<el-table-column prop="level" label="类型"></el-table-column>-->
            <el-table-column prop="userStatus" label="用户状态" width="130">
                <template scope="scope">
                    <el-tag :type="scope.row.userStatus == 0 ? 'success' : 'danger'"
                            close-transition>{{ scope.row.userStatus === 0 ? '正常' : '已删除' }}
                    </el-tag>
                    <el-tag :type="scope.row.userCare == 1 ? 'success' : 'danger'"
                            close-transition>{{ scope.row.userCare === 1 ? '已关注' : '未关注' }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column label="操作" width="210" fixed="right">
                <template scope="scope">
                    <el-button size="small" @click="showForm(scope.row)">查看</el-button>
                    <el-button :type="scope.row.userStatus == 0 ? 'danger' : 'warning'" size="small"
                               @click="userDel(scope.row)">
                        {{ scope.row.userStatus === 0 ? '删除' : '恢复' }}
                    </el-button>
                    <el-button :type="scope.row.userCare == 1 ? 'danger' : 'info'" size="small"
                               @click="careUser(scope.row)">
                        {{ scope.row.userCare === 1 ? '取关' : '关注' }}
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

        <el-dialog title="用户详情" v-model="isShowForm">
            <el-form :model="formData" label-width="80px" ref="formData" v-loading="showLoading">
                <el-form-item label="用户头像" prop="coverId">
                    <el-upload style="width: 80%;" :disabled="avatarDisabled" class="avatar-uploader" ref="upload"
                               action="" :show-file-list="false" :on-change="avatarChange" :auto-upload="false">
                        <img v-if="formData.coverImgUrl" v-model="formData.coverId" :src="formData.coverImgUrl"
                             class="avatar">
                        <i v-else class="el-icon-plus avatar-uploader-icon"></i>
                    </el-upload>
                    <el-button :loading="avatarLoading" class="mb-10" type="primary" size="small" @click="submitUpload">
                        上传
                    </el-button>
                    <el-button type="danger" size="small" @click="resetCoverImg">删除</el-button>
                </el-form-item>
                <el-form-item label="uid">
                    {{ formData.id }}
                </el-form-item>
                <el-form-item label="注册时间">
                    {{ formData.time }}
                </el-form-item>
                <el-form-item label="昵称" prop="name">
                    <el-input disabled="true" v-model.trim="formData.name" style="width: 200px;"
                              auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="地址">
                    <el-select v-model="formData.regionId" @change="fetchCity" style="width: 200px;margin-right: 10px;"
                               filterable placeholder="请选择地区">
                        <el-option label="无" value="0"></el-option>
                        <el-option v-for="item in regionList" :key="item.regionId" :label="item.regionName"
                                   :value="item.regionId+''"></el-option>
                    </el-select>
                    <el-select v-model="formData.cityId" style="width: 200px;" filterable placeholder="请选择城市">
                        <el-option label="无" value="0"></el-option>
                        <el-option v-for="item in cityList" :key="item.cityId" :label="item.cityName"
                                   :value="item.cityId+''"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="手机号" prop="phone">
                    <el-input style="width: 200px;" v-model.trim="formData.phone" auto-complete="off"></el-input>
                    <el-button class="ml-10" size="small" @click.native="phoneUpdate">更换</el-button>
                </el-form-item>
                <el-form-item label="QQ">
                    <template v-if="formData.qq">
                        <el-tag type="success" style="margin-right: 10px;">已绑定</el-tag>
                        <el-button type="danger" :plain="true" class="ml-10" size="small"
                                   @click.native="unbindThird('0')">
                            解绑
                        </el-button>
                    </template>
                    <template v-else>
                        <el-tag :type="danger">未绑定</el-tag>
                    </template>
                </el-form-item>
                <el-form-item label="微信" prop="wechat">
                    <template v-if="formData.wechat">
                        <el-tag type="success" style="margin-right: 10px;">已绑定</el-tag>
                        <el-button type="danger" :plain="true" class="ml-10" size="small"
                                   @click.native="unbindThird('1')">
                            解绑
                        </el-button>
                    </template>
                    <template v-else>
                        <el-tag :type="danger" close-transition>未绑定</el-tag>
                    </template>
                </el-form-item>
                <el-form-item label="微博" style="margin-bottom: -20px;">
                    <template v-if="formData.weibo">
                        <el-tag type="success" style="margin-right: 10px;">已绑定</el-tag>
                        <el-button type="danger" :plain="true" class="ml-10" size="small"
                                   @click.native="unbindThird('2')">
                            解绑
                        </el-button>
                    </template>
                    <template v-else>
                        <el-tag :type="danger" close-transition>未绑定</el-tag>
                    </template>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button size="small" @click.native="isShowForm = false">取消</el-button>
                <el-button size="small" type="primary" @click.native="formSubmit" :loading="formLoading">提交</el-button>
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

        <!--用户详情-->
        <!--<v-detail :userData="userData" v-model="isShowForm" v-on:refresh="fetchList"></v-detail>-->

        <!--用户粉丝-->
        <v-fan :userId="userId" v-model="isShowFan" v-on:preview="showForm"></v-fan>

        <!--用户关注-->
        <v-follow :userId="userId" v-model="isShowFollow" v-on:preview="showForm"></v-follow>

        <!--用户发帖-->
        <v-video :userId="userId" v-model="isShowVideo" v-on:preview="showBarrage"></v-video>

        <!--用户喜欢-->
        <v-like :userId="userId" v-model="isShowLike" v-on:preview="showBarrage"></v-like>

    </section>
</template>

<script type="es6">
    import util from '../../../api/util'
    import { avatarUploadApi, axiosGet, axiosPost, axiosDel} from '../../../api/api';
    //import vDetail from './userDetail.vue'
    import vFan from './fansList.vue'
    import vFollow from './followList.vue'
    import vVideo from './videoList.vue'
    import vLike from './likeList.vue'

    export default {
        components: {
            //vDetail,
            vFan,
            vFollow,
            vVideo,
            vLike
        },
        data() {
            return {
                filters: {
                    kw: '',
                    sex: '',
                    phone: '',
                    start: '',
                    end:'',
                    region: '0',
                    city:'0',
                    os: ''
                },
                total: 0, //表格列表数据总数
                page: 1, //当前页，默认为第一页
                tableLoading: false, //表格的loading符号
                tableList: [], //表格数据
                isShowForm: false,
                formLoading: false,
                showLoading: true,
                avatarLoading: false,
                avatarDisabled: false,
                formData: {
                    id: '',
                    name: '',
                    coverId: '',
                    coverImgUrl: '',
                    time: '',
                    regionId: '0',
                    cityId: '0',
                    os: '',
                    imei: '',
                    phone: '',
                    qq: '',
                    wechat: '',
                    weibo: '',
                    count: 0
                },
                regionList: [],
                cityList: [],
                cityFilterList: [],
                userData: {},
                userId: '', //用户id
                isShowFan: false, //显示、隐藏粉丝列表
                isShowFollow: false, //显示、隐藏关注列表
                isShowVideo: false, //显示、隐藏帖子列表
                isShowLike: false, //显示、隐藏喜欢列表
                isShowBarrage: false, //显示、隐藏弹幕列表
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
                }
            }
        },
        methods: {
            handleCurrentChange(val) { //翻页
                this.page = val;
                this.fetchList();
            },
            fetchList() {    //获取列表
                let para = {
                    offset: 0,
                    size: 10,
                    id: '',
                    username: '',
                    sex: this.filters.sex,
                    phone: this.filters.phone,
                    registerDevice: this.filters.os,
                    startTime: this.filters.start,
                    endTime: this.filters.end,
                    cityId: this.filters.city
                };
                if (isNaN(this.filters.kw)) { //输入不为数字，值传入kw
                    para.username = this.filters.kw;
                } else {
                    para.id = this.filters.kw;
                }
                para.offset = (this.page - 1) * para.size;
                this.tableLoading = true;
                axiosGet('userList', para).then((res) => {
                    let { error, status,data } = res;
                    if (status !== 0) {
                        if (status == 403) { //返回403时，重新登录
                            sessionStorage.removeItem('user');
                            this.$router.push('/login');
                        } else {
                            this.$message.error(error);
                        }
                    } else {
                        this.total = data.totalElements;
                        this.tableList = data.content.map(function (item) { //格式化显示时间
                            item.createTime = util.timestampFormat(item.createTime, 'YYYY-MM-DD');
                            return item;
                        });
                        this.tableLoading = false;
                    }
                });
            },
            setStart(val){ //格式化日期控件值
                this.filters.start = val;
            },
            setEnd(val){
                this.filters.end = val;
            },
            showForm (row){ //显示用户详情表单
                this.isShowForm = true;
                this.userData = row;
                this.showLoading = true;
                this.formData = {
                    id: '',
                    name: '',
                    coverId: '',
                    coverImgUrl: '',
                    time: '',
                    regionId: '0',
                    cityId: '0',
                    os: '',
                    imei: '',
                    phone: '',
                    qq: '',
                    wechat: '',
                    weibo: '',
                    count: 0
                };
                //this.fetchRegion();
                if (this.userData.id) {
                    axiosGet('userDetail', {uid: this.userData.id}).then((res) => {
                        let { error, status, data } = res;
                        if (status !== 0) {
                            if (status == 403) { //返回403时，重新登录
                                sessionStorage.removeItem('user');
                                this.$router.push('/login');
                            } else {
                                this.$message.error(error);
                            }
                        } else {
                            this.showLoading = false;
                            this.formData = {
                                id: data.id,
                                name: data.username,
                                coverId: data.avatarUrl,
                                coverImgUrl: data.fullUrl,
                                time: util.timestampFormat(data.createTime),
                                regionId: data.countryId + '',
                                cityId: data.cityId + '',
                                os: '',
                                imei: '',
                                phone: data.phone,
                                qq: data.qqBind,
                                wechat: data.wxBind,
                                weibo: data.wbBind,
                                count: 0
                            }
                        }
                    });
                }
            },
            showFan (row){ //显示用户粉丝列表
                this.isShowFan = true;
                this.userId = row.id;
            },
            showFollow (row){ //显示用户关注列表
                this.isShowFollow = true;
                this.userId = row.id;
            },
            showVideo (row){ //显示用户帖子列表
                this.isShowVideo = true;
                this.userId = row.id;
            },
            showLike (row){ //显示用户喜欢的帖子列表
                this.isShowLike = true;
                this.userId = row.id;
            },
            showBarrage (row){ //显示弹幕列表
                this.isShowBarrage = true;
                this.fetchBarrage();
                this.barrageTag();
                this.barrage.vpId = row.id;
            },
            //软删除用户
            userDel: function (row) {
                if (row.userStatus == 1) { //原来是删除状态，现执行恢复操作
                    this.tableLoading = true;
                    let paras = new FormData();
                    paras.append("uid", row.id);
                    paras.append("status", 0);
                    axiosPost('userStatus', paras).then((res) => {
                        this.tableLoading = false;
                        let { error, status } = res;
                        if (status !== 0) {
                            if (status == 403) { //返回403时，重新登录
                                sessionStorage.removeItem('user');
                                this.$router.push('/login');
                            } else {
                                this.$message.error(error);
                            }
                        } else {
                            this.$message.success('恢复成功');
                            this.fetchList();
                        }
                    });
                } else { //删除用户
                    this.$confirm('确认删除该用户吗?', '提示', {
                        type: 'warning'
                    }).then(() => {
                        this.tableLoading = true;
                        let paras = new FormData();
                        paras.append("uid", row.id);
                        paras.append("status", 1);
                        axiosPost('userStatus', paras).then((res) => {
                            this.tableLoading = false;
                            let { error, status } = res;
                            if (status !== 0) {
                                if (status == 403) { //返回403时，重新登录
                                    sessionStorage.removeItem('user');
                                    this.$router.push('/login');
                                } else {
                                    this.$message.error(error);
                                }
                            } else {
                                this.$message.success('删除成功');
                                this.fetchList();
                            }
                        });
                    });
                }
            },
            //运营关注用户
            careUser: function (row) {
                this.tableLoading = true;
                let paras = new FormData();
                paras.append("uid", row.id);
                paras.append("status", Number(!row.userCare));
                axiosPost('userCare', paras).then((res) => {
                    this.tableLoading = false;
                    let { error, status } = res;
                    if (status !== 0) {
                        if (status == 403) { //返回403时，重新登录
                            sessionStorage.removeItem('user');
                            this.$router.push('/login');
                        } else {
                            this.$message.error(error);
                        }
                    } else {
                        this.$message.success('操作成功');
                        this.fetchList();
                    }
                });
            },
            fetchRegion() { //获取省列表
                axiosGet('regionList').then((res) => {
                    let { error, status, data } = res;
                    if (status !== 0) {
                        if (status == 403) { //返回403时，重新登录
                            sessionStorage.removeItem('user');
                            this.$router.push('/login');
                        } else {
                            this.$message.error(error);
                        }
                    } else {
                        this.regionList = data;
                    }
                });
            },
            fetchCity: function(id){ //根据省id获取城市列表
                this.formData.count = this.formData.count + 1;
                if (id) {
                    axiosGet('cityList', {regionId: id}).then((res) => {
                        let { error, status, data } = res;
                        if (status !== 0) {
                            if (status == 403) { //返回403时，重新登录
                                sessionStorage.removeItem('user');
                                this.$router.push('/login');
                            } else {
                                this.$message.error(error);
                            }
                        } else {
                            this.cityList = data;
                            if(this.formData.count > 1){
                                this.formData.cityId = '0';
                            }
                        }
                    });
                }
            },
            fetchCityFilter: function(){ //根据省id获取城市列表
                axiosGet('cityList', {regionId: this.filters.region}).then((res) => {
                    let { error, status, data } = res;
                    if (status !== 0) {
                        if (status == 403) { //返回403时，重新登录
                            sessionStorage.removeItem('user');
                            this.$router.push('/login');
                        } else {
                            this.$message.error(error);
                        }
                    } else {
                        this.cityFilterList = data;

                    }
                });
            },
            formSubmit(){ //提交表单
                this.formLoading = true;
                let paras = new FormData();
                paras.append("avatar", this.formData.coverId);
                paras.append("uid", this.formData.id);
                paras.append("username", this.formData.name);
                paras.append("regionId", this.formData.regionId);
                paras.append("cityId", this.formData.cityId);
                axiosPost('userEdit', paras).then((res) => {
                    this.formLoading = false;
                    let { error, status } = res;
                    if (status !== 0) {
                        if (status == 403) { //返回403时，重新登录
                            sessionStorage.removeItem('user');
                            this.$router.push('/login');
                        } else {
                            this.$message.error(error);
                        }
                    } else {
                        this.$message.success('提交成功');
                        this.isShowForm = false;
                        this.fetchList();
                    }
                });
            },
            /*
             * 封面选择相关操作
             * */
            avatarChange(file){ //更改图片时,重置预览文件路径
                this.formData.coverImgUrl = file.url;
            },
            resetCoverImg(){ //删除封面
                this.formData.coverImgUrl = '';
                this.formData.coverId = '';
            },
            beforeAvatarUpload(file) { //上传前校验
                const isType = file.type.substring(0, 5);
                const isJPG = isType === 'image';
                const isLt2M = file.size / 1024 / 1024 <= 10;

                if (!isJPG) {
                    this.$message.warning('封面文件必须是图片类型!');
                }
                if (!isLt2M) {
                    this.$message.warning('上传图片大小不能超过 10MB!');
                }
                return isJPG && isLt2M;
            },
            submitUpload() { //上传图片
                let file = document.getElementsByName('file')[0].files;
                if (file.length == 0) { //file为空，提示并返回
                    this.$message.warning('请选择文件');
                    return;
                }
                var imgFile = document.getElementsByName('file')[0].files[0];
                if (!this.beforeAvatarUpload(imgFile)) {
                    return;
                }
                let para = new FormData();
                para.append("imageFile", imgFile);
                avatarUploadApi(para).then((res) => {
                    this.avatarDisabled = true;
                    this.avatarLoading = true;
                    let { error, status, data } = res;
                    if (status !== 0) {
                        if (status == 403) { //返回403时，重新登录
                            sessionStorage.removeItem('user');
                            this.$router.push('/login');
                        } else {
                            this.$message.error(error);
                        }
                    } else {
                        //上传图片成功回调
                        this.handleAvatarSuccess(data);
                    }
                });
            },
            handleAvatarSuccess(res) { //上传成功后操作
                this.$message.success('上传图片成功');
                this.avatarDisabled = false;
                this.avatarLoading = false;
                this.formData.coverId = res.url;
            },
            phoneUpdate(){ //更换手机号
                let paras = new FormData();
                paras.append("uid", this.userData.id);
                paras.append("mobile", this.formData.phone);
                axiosPost('userPhoneUpdate', paras).then((res) => {
                    let { error, status } = res;
                    if (status !== 0) {
                        if (status == 403) { //返回403时，重新登录
                            sessionStorage.removeItem('user');
                            this.$router.push('/login');
                        } else {
                            this.$message.error(error);
                        }
                    } else {
                        this.$message.success('更换成功');
                    }
                });
            },
            unbindThird(type){ //第三方账号解绑
                this.$confirm('确认解绑吗?', '提示', {
                    type: 'warning'
                }).then(() => {
                    let para = {
                        uid: this.userData.id,
                        snsType: type
                    };
                    axiosDel('userUnbind', para).then((res) => {
                        let { error, status } = res;
                        if (status !== 0) {
                            if (status == 403) { //返回403时，重新登录
                                sessionStorage.removeItem('user');
                                this.$router.push('/login');
                            } else {
                                this.$message.error(error);
                            }
                        } else {
                            this.$message.success('解绑成功');
                            if (type == 0) {
                                this.formData.qq = '';
                            } else if (type == 1) {
                                this.formData.wechat = '';
                            } else if (type == 2) {
                                this.formData.weibo = '';
                            }
                        }
                    });
                });
            },
            /*
             * 处理弹幕开始
             * */
            barragePageChange(val) { //翻页
                this.barrage.page = val;
                this.fetchBarrage();
            },
            fetchBarrage() {    //获取弹幕列表
                let para = {
                    offset: 0,
                    size: 10,
                    tagId: this.barrage.filters.tag
                };
                para.offset = (this.barrage.page - 1) * para.size;
                this.barrage.tableLoading = true;
                axiosGet('barrageList', para).then((res) => {
                    let { error, status,data } = res;
                    if (status !== 0) {
                        if (status == 403) { //返回403时，重新登录
                            sessionStorage.removeItem('user');
                            this.$router.push('/login');
                        } else {
                            this.$message.error(error);
                        }
                    } else {
                        this.barrage.tableList = data.content;
                        this.barrage.total = data.totalElements;
                        this.barrage.tableLoading = false;
                    }
                });
            },
            submitBarrage(){ //提交所选弹幕
                let paras = new FormData();
                paras.append("vpId", this.barrage.vpId);
                paras.append("barrageIds", this.barrage.multipleBarrageIds.join(','));
                axiosPost('postsBarrageAdd', paras).then((res) => {
                    let { error, status } = res;
                    if (status !== 0) {
                        if (status == 403) { //返回403时，重新登录
                            sessionStorage.removeItem('user');
                            this.$router.push('/login');
                        } else {
                            this.$message.error(error);
                        }
                    } else {
                        this.$message.success('增加弹幕成功');
                    }
                });
            },
            barrageTag(){ //加载弹幕标签
                axiosGet('barrageTag', '').then((res) => {
                    let { error, status,data } = res;
                    if (status !== 0) {
                        if (status == 403) { //返回403时，重新登录
                            sessionStorage.removeItem('user');
                            this.$router.push('/login');
                        } else {
                            this.$message.error(error);
                        }
                    } else {
                        this.barrage.tagList = data;
                    }
                });
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
                let para = new FormData();
                para.append("id", row.id);
                para.append("text", row.text);
                axiosPost('barrageEdit', para).then((res) => {
                    let { error, status } = res;
                    if (status !== 0) {
                        if (status == 403) { //返回403时，重新登录
                            sessionStorage.removeItem('user');
                            this.$router.push('/login');
                        }else{
                            this.$message.error(error);
                        }
                    }
                });
            }
        },
        mounted() {
            this.fetchList();
            this.fetchRegion();
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

    /*
        封面选择部分
    */
    .avatar-uploader .el-upload {
        border: 1px dashed #d9d9d9;
        border-radius: 6px;
        cursor: pointer;
        position: relative;
        overflow: hidden;
        background-color: #fff;
        box-sizing: border-box;
        width: 360px;
        height: 180px;
        text-align: center;

    }

    .avatar-uploader .el-upload:hover {
        border-color: #20a0ff;
    }

    .avatar-uploader-icon {
        font-size: 28px;
        color: #8c939d;
        width: 178px;
        height: 178px;
        line-height: 178px;
        text-align: center;
    }

    .avatar {
        max-width: 100%;
        max-height: 100%;
        display: block;
        margin: 0 auto;
    }

    .tb-edit .el-input {
        display: none
    }
    .tb-edit .current-row .el-input {
        display: block
    }
    .tb-edit .current-row .el-input+span {
        display: none
    }
</style>
