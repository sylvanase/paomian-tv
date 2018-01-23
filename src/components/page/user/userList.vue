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
                    <router-link :to="{ name: '帖子列表', params: { uid: scope.row.id }}">{{ scope.row.username }}
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
            <el-table-column label="操作" width="280" fixed="right">
                <template scope="scope">
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

        <el-dialog title="用户详情" v-model="isShowForm" @close="resetFormData">
            <el-form :model="formData" label-width="80px" ref="formData" v-loading="showLoading">
                <el-form-item label="用户头像" prop="coverId">
                    <div class="avatar-uploader" style="width: 80%;" @click="chooseFile">
                        <div class="el-upload el-upload--text">
                            <i v-show="avatarLoading" class="el-icon-loading avatar-uploader-icon"></i>
                            <i v-show="!formData.coverImgUrl && !avatarLoading"
                               class="el-icon-plus avatar-uploader-icon"></i>
                            <img v-show="formData.coverImgUrl && !avatarLoading" :src="formData.coverImgUrl"
                                 class="avatar">
                            <input type="file" id="cover" class="el-upload__input" @change="fileChange">
                        </div>
                    </div>
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
                <el-form-item label="用户分类" prop="catIds">
                    <template>
                        <el-select style="width: 50%;" filterable v-model="formData.catIds" multiple
                                   placeholder="选择用户分类">
                            <el-option v-for="item in catList" :key="item.id" :label="item.name"
                                       :value="item.id">
                            </el-option>
                        </el-select>
                    </template>
                </el-form-item>
                <template v-if="formData.imei.length > 0" v-for="item in formData.imei">
                    <el-form-item label="设备类型">
                        <span>{{ item.name }}</span>
                    </el-form-item>
                    <el-form-item label="设备号">
                        <span>{{ item.uuid }}</span>
                    </el-form-item>
                </template>
                <el-form-item label="手机号" prop="phone">
                    <el-input style="width: 200px;" v-model.trim="formData.phone" auto-complete="off"></el-input>
                    <el-button class="ml-10" size="small" @click.native="phoneUpdate">更换</el-button>
                    <el-button class="ml-10" size="small" @click.native="phoneUnbind">解绑</el-button>
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

        <!--用户粉丝-->
        <v-fan :userId="userId" v-model="isShowFan" v-on:preview="showForm"></v-fan>

        <!--用户关注-->
        <v-follow :userId="userId" v-model="isShowFollow" v-on:preview="showForm"></v-follow>

        <!--用户发帖-->
        <v-video :userId="userId" v-model="isShowVideo" v-on:audio="playVideo" v-on:preview="showComment"
                 v-on:like="addLike"></v-video>

        <!--用户喜欢-->
        <v-like :userId="userId" v-model="isShowLike" v-on:audio="playVideo" v-on:preview="showComment"
                v-on:like="addLike"></v-like>

        <!--为帖子加评论-->
        <v-comment-add :postsData="postsData" v-model="isShowComment" v-on:refresh="fetchList"></v-comment-add>
    </section>
</template>

<script type="es6">
    import util from '../../../api/util'
    import {httpGet, httpPost, httpDel} from '../../../api/api';
    //import vDetail from './userDetail.vue'
    import vFan from './fansList.vue'
    import vFollow from './followList.vue'
    import vVideo from './videoList.vue'
    import vLike from './likeList.vue'
    import vCommentAdd from '../posts/commentSource.vue'

    export default {
        components: {
            vFan,
            vFollow,
            vVideo,
            vLike,
            vCommentAdd
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
                formLoading: false,
                showLoading: true,
                avatarLoading: false,
                formData: {
                    id: '',
                    name: '',
                    coverId: '',
                    coverImgUrl: '',
                    time: '',
                    regionId: '0',
                    cityId: '0',
                    os: '',
                    imei: [],
                    phone: '',
                    qq: '',
                    wechat: '',
                    weibo: '',
                    count: 0,
                    catIds: []
                },
                regionList: [],
                cityList: [],
                cityFilterList: [],
                catList: [],
                userData: {},
                userId: '', //用户id
                isShowFan: false, //显示、隐藏粉丝列表
                isShowFollow: false, //显示、隐藏关注列表
                isShowVideo: false, //显示、隐藏帖子列表
                isShowLike: false, //显示、隐藏喜欢列表
                isShowComment: false, //显示、隐藏评论库列表
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
                let _self = this;
                _self.isShowForm = true;
                _self.userData = row;
                _self.showLoading = true;
                if (_self.userData.id) {
                    httpGet('userDetail', {uid: _self.userData.id}, _self, function (res) {
                        _self.showLoading = false;
                        try {
                            let {data} = res;
                            _self.formData = {
                                id: data.id,
                                name: data.username,
                                coverId: data.avatarUrl,
                                coverImgUrl: data.fullUrl,
                                time: util.timestampFormat(data.createTime),
                                regionId: data.countryId + '',
                                cityId: data.cityId + '',
                                os: '',
                                imei: data.userDevicePoList,
                                phone: data.phone,
                                qq: data.qqBind,
                                wechat: data.wxBind,
                                weibo: data.wbBind,
                                count: 0,
                                catIds: data.userAttrIds
                            };
                        } catch (error) {
                            util.jsErrNotify(error);
                        }
                    })
                }
            },
            resetFormData() { //关闭表格弹窗，重置表格数据
                this.formData = {
                    id: '',
                    name: '',
                    coverId: '',
                    coverImgUrl: '',
                    time: '',
                    regionId: '0',
                    cityId: '0',
                    os: '',
                    imei: [],
                    phone: '',
                    qq: '',
                    wechat: '',
                    weibo: '',
                    count: 0,
                    catIds: []
                };
                this.showLoading = false;
                this.formLoading = false;
                document.getElementById('cover').value = '';
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
            showComment(row) { //显示弹幕列表
                this.isShowComment = true;
                this.postsData = row
                /*this.fetchBarrage();
                this.barrageTag();
                this.barrage.vpId = row.id;*/
            },
            //软删除用户
            userDel: function (row) {
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
            //运营关注用户
            careUser: function (row) {
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
            fetchCity: function (id) { //根据省id获取城市列表
                let _self = this;
                _self.formData.count = _self.formData.count + 1;
                if (id) {
                    httpGet('cityList', {regionId: id}, _self, function (res) {
                        try {
                            let {error, status, data} = res;
                            _self.cityList = data;
                            if (_self.formData.count > 1) {
                                _self.formData.cityId = '0';
                            }
                        } catch (error) {
                            util.jsErrNotify(error);
                        }
                    })
                }
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
            fetchCat() {
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
            formSubmit() { //提交表单
                let _self = this;
                let paras = new FormData();
                paras.append("avatar", _self.formData.coverId);
                paras.append("uid", _self.formData.id);
                paras.append("username", _self.formData.name);
                paras.append("regionId", _self.formData.regionId);
                paras.append("cityId", _self.formData.cityId);
                paras.append("userAttrIds", _self.formData.catIds);
                _self.formLoading = true;
                httpPost('userEdit', paras, _self, function (res) {
                    _self.formLoading = false;
                    try {
                        _self.$message.success('提交成功');
                        _self.isShowForm = false;
                        _self.fetchList();
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            /*
             * 封面选择相关操作
             * */
            chooseFile() { //触发选择文件
                let fileDom = document.getElementById('cover');
                fileDom.click();
            },
            fileChange() { // 文件变更后操作
                let fileDom = document.getElementById('cover');
                let _self = this;
                if (fileDom.value) { // 如果文件不为空，进行校验和上传操作
                    const _verify = util.imgFileCheck(fileDom);
                    if (_verify) { //文件校验通过，进行上传操作
                        let paras = new FormData();
                        paras.append("imageFile", fileDom.files[0]);
                        _self.avatarLoading = true;
                        httpPost('avatarUpload', paras, _self, function (res) {
                            _self.avatarLoading = false;
                            try {
                                let {error, status, data} = res;
                                _self.formData.coverId = data.url;
                                _self.formData.coverImgUrl = URL.createObjectURL(fileDom.files[0]);
                            } catch (error) {
                                util.jsErrNotify(error);
                            }
                        }, function (res) { // 上传失败回调
                            _self.avatarLoading = false;
                            fileDom.value = '';
                            _self.$message.error('上传失败，请重新选择文件');
                        })
                    }
                }
            },
            resetCoverImg() { //删除封面
                this.formData.coverImgUrl = '';
                this.formData.coverId = '';
                document.getElementById('cover').value = '';
            },
            phoneUpdate() { //更换手机号
                let _self = this;
                let paras = new FormData();
                paras.append("uid", _self.userData.id);
                paras.append("mobile", _self.formData.phone);
                httpPost('userPhoneUpdate', paras, _self, function (res) {
                    try {
                        _self.$message.success('更换成功');
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            phoneUnbind() { //用户手机解锁
                this.$confirm('确认将该用户手机解绑吗?', '提示', {
                    type: 'warning'
                }).then(() => {
                    let _self = this;
                    let paras = {
                        uid: _self.userData.id,
                        mobile: _self.userData.phone
                    };
                    httpGet('userMobileUnbind', paras, _self, function (res) {
                        try {
                            _self.$message.success('解绑成功');
                            _self.userData.phone = '';
                        } catch (error) {
                            util.jsErrNotify(error);
                        }
                    })
                });
            },
            unbindThird(type) { //第三方账号解绑
                this.$confirm('确认解绑吗?', '提示', {
                    type: 'warning'
                }).then(() => {
                    let _self = this;
                    let paras = {
                        uid: _self.userData.id,
                        snsType: type
                    };
                    httpDel('userUnbind', paras, _self, function (res) {
                        try {
                            _self.$message.success('解绑成功');
                            if (type == 0) {
                                _self.formData.qq = '';
                            } else if (type == 1) {
                                _self.formData.wechat = '';
                            } else if (type == 2) {
                                _self.formData.weibo = '';
                            }
                        } catch (error) {
                            util.jsErrNotify(error);
                        }
                    })
                });
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
            if (this.$route.params.uid) {
                this.filters.kw = this.$route.params.uid;
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
