<template>
    <section>
        <el-tabs v-model="activeName" @tab-click="tabChange">
            <el-tab-pane label="开机广告" name="launch">
                <el-col :span="24" class="toolbar">
                    <el-form :inline="true">
                        <el-form-item>
                            <el-input v-model="launch.filters.id" placeholder="bannerID" icon="circle-close"
                                      :on-icon-click="resetSearch" @keyup.enter.native="fetchList"></el-input>
                        </el-form-item>
                        <!--<el-form-item>
                            <el-date-picker v-model="launch.filters.time" type="datetimerange" placeholder="选择时间范围"
                                            align="center" @change="setRange">
                            </el-date-picker>
                        </el-form-item>-->
                        <el-form-item>
                            <el-button type="primary" @click="fetchList">查询</el-button>
                        </el-form-item>
                        <el-form-item>
                            <el-button type="primary" @click="showForm()">新增</el-button>
                        </el-form-item>
                    </el-form>
                </el-col>
                <!--表格-->
                <el-table v-loading="launch.loading" :data="launch.list" stripe border :max-height="launch.height"
                          style="width: 100%;">
                    <el-table-column prop="id" label="id" width="80"></el-table-column>
                    <el-table-column prop="iosImageUrl" label="ios开机图" width="160">
                        <template scope="scope">
                            <img v-if="scope.row.iosImageUrl !== ''"
                                 style="width: 100%;vertical-align: middle;margin: 5px 0;" :src="scope.row.iosImageUrl"
                                 alt="ios开机图"/>
                            <span v-else>图片路径缺失</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="androidImageUrl" label="android开机图" width="135">
                        <template scope="scope">
                            <img v-if="scope.row.androidImageUrl !== ''"
                                 style="width: 100%;vertical-align: middle;" :src="scope.row.androidImageUrl"
                                 alt="android开机图"/>
                            <span v-else>图片路径缺失</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="appLink" label="外链"></el-table-column>
                    <el-table-column prop="startTime" label="开始时间" width="175"></el-table-column>
                    <el-table-column prop="endTime" label="停止时间" width="175"></el-table-column>
                    <el-table-column label="操作" width="140">
                        <template scope="scope">
                            <el-button size="small" @click="showForm(scope.row)">编辑</el-button>
                            <el-button type="danger" size="small" @click="bannerDel(scope.row)">删除</el-button>
                        </template>
                    </el-table-column>
                </el-table>
                <!--分页-->
                <el-col :span="24" class="mt-10">
                    <el-pagination style="float:right;" @current-change="handleCurrentChange"
                                   :page-size="launch.size" :current-page="launch.page"
                                   layout="total, prev, pager, next, jumper" :total="launch.total">
                    </el-pagination>
                </el-col>
            </el-tab-pane>
            <el-tab-pane label="话题列表" name="topic">
                <el-col :span="24" class="toolbar">
                    <el-form :inline="true">
                        <el-form-item>
                            <el-input v-model="topic.filters.id" placeholder="bannerID" icon="circle-close"
                                      :on-icon-click="resetSearch" @keyup.enter.native="fetchList"></el-input>
                        </el-form-item>
                        <!--<el-form-item>
                            <el-date-picker type="datetimerange" placeholder="选择时间范围" align="center" @change="setRange">
                            </el-date-picker>
                        </el-form-item>-->
                        <el-form-item>
                            <el-button type="primary" @click="fetchList">查询</el-button>
                        </el-form-item>
                        <el-form-item>
                            <el-button type="primary" @click="showForm()">新增</el-button>
                        </el-form-item>
                    </el-form>
                </el-col>
                <!--表格-->
                <el-table v-loading="topic.loading" :data="topic.list" stripe border :max-height="topic.height"
                          style="width: 100%;">
                    <el-table-column prop="id" label="id" width="80"></el-table-column>
                    <el-table-column prop="topicUrl" label="banner图" width="240">
                        <template scope="scope">
                            <img v-if="scope.row.topicUrl !== ''"
                                 style="width: 100%;vertical-align: middle;margin: 5px 0;" :src="scope.row.topicUrl"
                                 alt=""/>
                            <span v-else>图片路径缺失</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="appLink" label="外链"></el-table-column>
                    <el-table-column prop="startTime" label="开始时间" width="175"></el-table-column>
                    <el-table-column prop="endTime" label="停止时间" width="175"></el-table-column>
                    <el-table-column label="操作" width="140">
                        <template scope="scope">
                            <el-button size="small" @click="showForm(scope.row)">编辑</el-button>
                            <el-button type="danger" size="small" @click="bannerDel(scope.row)">删除</el-button>
                        </template>
                    </el-table-column>
                </el-table>
                <!--分页-->
                <el-col :span="24" class="mt-10">
                    <el-pagination style="float:right;" @current-change="handleCurrentChange"
                                   :page-size="topic.size" :current-page="topic.page"
                                   layout="total, prev, pager, next, jumper" :total="topic.total">
                    </el-pagination>
                </el-col>
            </el-tab-pane>
            <!--<el-tab-pane label="个人中心" name="personal">个人中心，暂无内容</el-tab-pane>-->
            <el-tab-pane label="广场" name="square">
                <el-col :span="24" class="toolbar">
                    <el-form :inline="true">
                        <el-form-item>
                            <el-input v-model="square.filters.id" placeholder="bannerID" icon="circle-close"
                                      :on-icon-click="resetSearch" @keyup.enter.native="fetchList"></el-input>
                        </el-form-item>
                        <!--<el-form-item>
                            <el-date-picker type="datetimerange" placeholder="选择时间范围" align="center" @change="setRange">
                            </el-date-picker>
                        </el-form-item>-->
                        <el-form-item>
                            <el-button type="primary" @click="fetchList">查询</el-button>
                        </el-form-item>
                        <el-form-item>
                            <el-button type="primary" @click="showForm()">新增</el-button>
                        </el-form-item>
                    </el-form>
                </el-col>
                <!--表格-->
                <el-table v-loading="square.loading" :data="square.list" stripe border :max-height="square.height"
                          style="width: 100%;">
                    <el-table-column prop="id" label="id" width="80"></el-table-column>
                    <el-table-column prop="squareImageUrl" label="banner图" width="240">
                        <template scope="scope">
                            <img v-if="scope.row.squareImageUrl !== ''"
                                 style="width: 100%;vertical-align: middle;margin: 5px 0;"
                                 :src="scope.row.squareImageUrl" alt=""/>
                            <span v-else>图片路径缺失</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="appLink" label="外链"></el-table-column>
                    <el-table-column prop="startTime" label="开始时间" width="175"></el-table-column>
                    <el-table-column prop="endTime" label="停止时间" width="175"></el-table-column>
                    <el-table-column label="操作" width="140">
                        <template scope="scope">
                            <el-button size="small" @click="showForm(scope.row)">编辑</el-button>
                            <el-button type="danger" size="small" @click="bannerDel(scope.row)">删除</el-button>
                        </template>
                    </el-table-column>
                </el-table>
                <!--分页-->
                <el-col :span="24" class="mt-10">
                    <el-pagination style="float:right;" @current-change="handleCurrentChange"
                                   :page-size="square.size" :current-page="square.page"
                                   layout="total, prev, pager, next, jumper" :total="square.total">
                    </el-pagination>
                </el-col>
            </el-tab-pane>
            <el-tab-pane label="营销弹窗" name="pop">
                <el-col :span="24" class="toolbar">
                    <el-form :inline="true">
                        <el-form-item>
                            <el-input v-model="pop.filters.id" placeholder="ID" icon="circle-close"
                                      :on-icon-click="resetSearch" @keyup.enter.native="fetchList"></el-input>
                        </el-form-item>
                        <el-form-item>
                            <el-button type="primary" @click="fetchList">查询</el-button>
                        </el-form-item>
                        <el-form-item>
                            <el-button type="primary" @click="showForm()">新增</el-button>
                        </el-form-item>
                    </el-form>
                </el-col>
                <!--表格-->
                <el-table v-loading="pop.loading" :data="pop.list" stripe border :max-height="pop.height"
                          style="width: 100%;">
                    <el-table-column prop="id" label="id" width="80"></el-table-column>
                    <el-table-column prop="imageUrl" label="弹窗图" width="240">
                        <template scope="scope">
                            <img v-if="scope.row.imageUrl !== ''"
                                 style="width: 100%;vertical-align: middle;margin: 5px 0;"
                                 :src="scope.row.imageUrl" alt=""/>
                            <span v-else>图片路径缺失</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="appLink" label="外链"></el-table-column>
                    <el-table-column prop="startTime" label="开始时间" width="175"></el-table-column>
                    <el-table-column prop="endTime" label="停止时间" width="175"></el-table-column>
                    <el-table-column label="操作" width="140">
                        <template scope="scope">
                            <el-button size="small" @click="showForm(scope.row)">编辑</el-button>
                            <el-button type="danger" size="small" @click="bannerDel(scope.row)">删除</el-button>
                        </template>
                    </el-table-column>
                </el-table>
                <!--分页-->
                <el-col :span="24" class="mt-10">
                    <el-pagination style="float:right;" @current-change="handleCurrentChange"
                                   :page-size="pop.size" :current-page="pop.page"
                                   layout="total, prev, pager, next, jumper" :total="pop.total">
                    </el-pagination>
                </el-col>
            </el-tab-pane>
            <el-tab-pane label="页面素材配置" name="material">
                <el-col :span="24" class="toolbar">
                    <el-form :inline="true">
                        <el-form-item>
                            <el-input v-model="material.filters.id" placeholder="ID" icon="circle-close"
                                      :on-icon-click="resetSearch" @keyup.enter.native="materialList"></el-input>
                        </el-form-item>
                        <el-form-item>
                            <el-select v-model="material.filters.type" @change="materialList" placeholder="请选择"
                                       style="width: 200px;">
                                <el-option label="全部" value=""></el-option>
                                <el-option label="拍摄按钮" value="1"></el-option>
                                <el-option label="个人中心拍摄引导" value="2"></el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item>
                            <el-button type="primary" @click="materialList">查询</el-button>
                        </el-form-item>
                        <el-form-item>
                            <el-button type="primary" @click="showForm()">新增</el-button>
                        </el-form-item>
                    </el-form>
                </el-col>
                <el-table v-loading="material.loading" :data="material.list" stripe border :max-height="material.height"
                          style="width: 100%;">
                    <el-table-column prop="id" label="id" width="80"></el-table-column>
                    <el-table-column prop="imageUrl" label="素材预览" width="170">
                        <template scope="scope">
                            <img v-if="scope.row.imageUrl !== ''"
                                 style="width: 100%;vertical-align: middle;margin: 5px 0;"
                                 :src="scope.row.imageUrl" alt=""/>
                            <span v-else>图片路径缺失</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="status" label="状态">
                        <template scope="scope">
                            {{ scope.row.status == 1 ? '上线' : '下线' }}
                        </template>
                    </el-table-column>
                    <el-table-column prop="type" label="类型">
                        <template scope="scope">
                            {{ scope.row.type == 1 ? '拍摄按钮' : '个人中心拍摄引导' }}
                        </template>
                    </el-table-column>
                    <el-table-column prop="startTime" label="开始时间" width="175"></el-table-column>
                    <el-table-column prop="endTime" label="停止时间" width="175"></el-table-column>
                    <el-table-column label="操作" width="140">
                        <template scope="scope">
                            <el-button :type="scope.row.status == 1 ? 'danger':'success'" size="small"
                                       @click="materialOnline(scope.row)">
                                {{ scope.row.status == 1 ? '下线':'上线' }}
                            </el-button>
                            <!-- 上线状态 删除按钮不可用，且有提示 -->
                            <template v-if="scope.row.status == 1">
                                <el-tooltip class="item" effect="dark" content="请先下线该素材" placement="bottom-end">
                                    <el-button size="small">删除</el-button>
                                </el-tooltip>
                            </template>
                            <template v-else>
                                <el-button type="danger" size="small" @click="bannerDel(scope.row)">删除</el-button>
                            </template>
                        </template>
                    </el-table-column>
                </el-table>
                <!--分页-->
                <el-col :span="24" class="mt-10">
                    <el-pagination style="float:right;" @current-change="handleCurrentChange"
                                   :page-size="material.size" :current-page="material.page"
                                   layout="total, prev, pager, next, jumper" :total="material.total">
                    </el-pagination>
                </el-col>
            </el-tab-pane>
            <el-tab-pane label="悬浮窗管理" name="window">
                <el-col :span="24" class="toolbar">
                    <el-form :inline="true">
                        <el-form-item>
                            <el-input v-model="window.filters.id" placeholder="ID" icon="circle-close"
                                      :on-icon-click="resetSearch" @keyup.enter.native="windowList"></el-input>
                        </el-form-item>
                        <el-form-item>
                            <el-button type="primary" @click="windowList">查询</el-button>
                        </el-form-item>
                        <el-form-item>
                            <el-button type="primary" @click="showForm()">新增</el-button>
                        </el-form-item>
                    </el-form>
                </el-col>
                <el-table v-loading="window.loading" :data="window.list" stripe border :max-height="window.height"
                          style="width: 100%;">
                    <el-table-column prop="id" label="id" width="80"></el-table-column>
                    <el-table-column prop="imageUrl" label="悬浮窗素材" width="170">
                        <template scope="scope">
                            <img v-if="scope.row.imageUrl !== ''"
                                 style="width: 100%;vertical-align: middle;margin: 5px 0;"
                                 :src="scope.row.imageUrl" alt=""/>
                            <span v-else>图片路径缺失</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="status" label="状态" width="80">
                        <template scope="scope">
                            {{ scope.row.status == 1 ? '上线' : '下线' }}
                        </template>
                    </el-table-column>
                    <el-table-column prop="link" label="外链"></el-table-column>
                    <el-table-column prop="startTime" label="开始时间" width="175"></el-table-column>
                    <el-table-column prop="endTime" label="停止时间" width="175"></el-table-column>
                    <el-table-column label="操作" width="140">
                        <template scope="scope">
                            <el-button :type="scope.row.status == 1 ? 'danger':'success'" size="small"
                                       @click="windowOnline(scope.row)">
                                {{ scope.row.status == 1 ? '下线':'上线' }}
                            </el-button>
                            <!-- 上线状态 删除按钮不可用，且有提示 -->
                            <template v-if="scope.row.status == 1">
                                <el-tooltip class="item" effect="dark" content="请先下线该素材" placement="bottom-end">
                                    <el-button size="small">删除</el-button>
                                </el-tooltip>
                            </template>
                            <template v-else>
                                <el-button type="danger" size="small" @click="bannerDel(scope.row)">删除</el-button>
                            </template>
                        </template>
                    </el-table-column>
                </el-table>
                <!--分页-->
                <el-col :span="24" class="mt-10">
                    <el-pagination style="float:right;" @current-change="handleCurrentChange"
                                   :page-size="window.size" :current-page="window.page"
                                   layout="total, prev, pager, next, jumper" :total="window.total">
                    </el-pagination>
                </el-col>
            </el-tab-pane>
        </el-tabs>

        <!--开机页编辑-->
        <v-launch-detail :launchData="launch.formData" v-model="launch.showForm"
                         v-on:refresh="fetchList"></v-launch-detail>

        <!--话题页编辑-->
        <v-topic-detail :topicData="topic.formData" v-model="topic.showForm" v-on:refresh="fetchList"></v-topic-detail>

        <!--广场页编辑-->
        <v-square-detail :squareData="square.formData" v-model="square.showForm"
                         v-on:refresh="fetchList"></v-square-detail>

        <!--营销弹窗编辑-->
        <v-pop-detail :popData="pop.formData" v-model="pop.showForm"
                      v-on:refresh="fetchList"></v-pop-detail>

        <!--页面素材编辑-->
        <v-material-detail :materialData="material.formData" v-model="material.showForm"
                           v-on:refresh="materialList"></v-material-detail>

        <!--页面素材时间更新-->
        <v-material-update :materialData="material.formData" v-model="material.showUpdateForm"
                           v-on:refresh="materialList"></v-material-update>

        <!--悬浮窗编辑-->
        <v-window-detail :windowData="window.formData" v-model="window.showForm"
                         v-on:refresh="windowList"></v-window-detail>

        <!--悬浮窗时间更新-->
        <v-window-update :windowData="window.formData" v-model="window.showUpdateForm"
                         v-on:refresh="windowList"></v-window-update>

    </section>
</template>

<script type="es6">
    import util from '../../../api/util'
    import {httpGet, httpPost} from '../../../api/api';

    import vLaunchDetail from './launchDetail.vue'
    import vTopicDetail from './topicDetail.vue'
    import vSquareDetail from './squareDetail.vue'
    import vPopDetail from './popDetail.vue'
    import vMaterialDetail from './materialDetail.vue'
    import vMaterialUpdate from './materialUpdate.vue'
    import vWindowDetail from './windowDetail.vue'
    import vWindowUpdate from './windowUpdate.vue'

    export default {
        components: {
            vLaunchDetail,
            vTopicDetail,
            vSquareDetail,
            vPopDetail,
            vMaterialDetail,
            vMaterialUpdate,
            vWindowDetail,
            vWindowUpdate
        },
        data() {
            return {
                activeName: 'launch', //默认显示第一页
                tabArg: ['launch', 'topic', 'personal', 'square', 'pop', 'material', 'window'],
                launch: { // 开机页数据
                    loading: false,
                    list: [],
                    height: '100%',
                    total: 0,
                    page: 1,
                    size: 10,
                    filters: {
                        id: '',
                        start: '',
                        end: '',
                        time: ''
                    },
                    formData: {},
                    showForm: false
                },
                topic: { // 话题页数据
                    loading: false,
                    list: [],
                    height: '100%',
                    total: 0,
                    page: 1,
                    size: 10,
                    filters: {
                        id: '',
                        start: '',
                        end: '',
                        time: ''
                    },
                    formData: {},
                    showForm: false
                },
                personal: { // 个人页数据
                    loading: false,
                    list: [],
                    height: '100%',
                    total: 0,
                    page: 1,
                    size: 10,
                    filters: {
                        id: '',
                        start: '',
                        end: '',
                        time: ''
                    },
                    formData: {},
                    showForm: false
                },
                square: { // 广场页数据
                    loading: false,
                    height: '100%',
                    list: [],
                    total: 0,
                    page: 1,
                    size: 10,
                    filters: {
                        id: '',
                        start: '',
                        end: '',
                        time: ''
                    },
                    formData: {},
                    showForm: false
                },
                pop: { // 营销弹窗数据
                    loading: false,
                    height: '100%',
                    list: [],
                    total: 0,
                    page: 1,
                    size: 10,
                    filters: {
                        id: '',
                        start: '',
                        end: '',
                        time: ''
                    },
                    formData: {},
                    showForm: false
                },
                material: { // 页面素材配置数据
                    loading: false,
                    height: '100%',
                    list: [],
                    total: 0,
                    page: 1,
                    size: 10,
                    filters: {
                        id: '',
                        type: ''
                    },
                    formData: {},
                    showForm: false,
                    showUpdateForm: false
                },
                window: { // 悬浮窗数据
                    loading: false,
                    height: '100%',
                    list: [],
                    total: 0,
                    page: 1,
                    size: 10,
                    filters: {
                        id: ''
                    },
                    formData: {},
                    showForm: false,
                    showUpdateForm: false
                }
            }
        },
        methods: {
            tabChange(tab) {
                const _self = this;
                let _name = tab.name;
                _self[_name].page = 1;
                if (_name == 'material') { // 页面素材配置
                    _self[_name].filters = {
                        id: '',
                        type: ''
                    };
                    _self.materialList();
                } else if (_name == 'window') {
                    _self[_name].filters = {
                        id: ''
                    };
                    _self.windowList();
                } else {
                    _self[_name].filters = {
                        id: '',
                        start: '',
                        end: '',
                        time: ''
                    };
                    _self.fetchList();
                }

            },
            resetSearch() { // 重置查询条件
                const _self = this;
                let _name = _self.activeName;
                _self[_name].filters.id = '';
                if (_name == 'material') {
                    _self.materialList();
                } else if (_name == 'window') {
                    _self.windowList();
                } else {
                    _self.fetchList();
                }
            },
            handleCurrentChange(val) { //翻页
                const _self = this;
                let _name = _self.activeName; // 获取当前tab的name，根据name进行后续操作
                _self[_name].page = val; // 将所有tab下的page重置为1
                if (_name == 'material') {
                    _self.materialList();
                } else if (_name == 'window') {
                    _self.windowList();
                } else {
                    _self.fetchList();
                }
            },
            setRange(val) { //格式化日期控件值
                const _self = this;
                let _name = _self.activeName; // 获取当前tab的name，根据name进行后续操作
                _self[_name].filters.start = val.substring(0, 19);
                _self[_name].filters.end = val.substring(22);
            },
            fetchList() {    // 获取表格数据
                const _self = this;
                let _name = _self.activeName; // 获取当前tab的name，根据name进行后续操作
                if (_name == 'personal') { //个人中心暂无数据
                    return;
                }
                _self[_name].height = document.getElementById('container').clientHeight - 77 - 42 - 15 - 42;
                let paras = new FormData();
                paras.append('size', _self[_name].size);
                paras.append('offset', (_self[_name].page - 1) * _self[_name].size);
                paras.append('id', _self[_name].filters.id);
                _self[_name].loading = true;
                httpPost(_name + 'BannerList', paras, _self, function (res) {
                    _self[_name].loading = false;
                    try {
                        let {error, status, data} = res;
                        _self[_name].total = data.totalElements;
                        _self[_name].list = data.content.map(function (item) { //格式化显示时间
                            item.startTime = util.timestampFormat(item.startTime);
                            item.endTime = util.timestampFormat(item.endTime);
                            return item;
                        });
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                }, function (res) {
                    _self[_name].loading = false;
                    _self.$message.error(res.data.error);
                })
            },
            showForm(row) { // 根据当前显示tab显示对应的类型表单
                const _self = this;
                let _name = _self.activeName; // 获取当前tab的name，根据name进行后续操作
                _self[_name].formData = row; // 对应tab的表格数据赋值
                _self[_name].showForm = true; // 对应tab的表格显示
            },
            bannerDel(row) {
                const _self = this;
                let _name = _self.activeName; // 获取当前tab的name，根据name进行后续操作
                let paras = {
                    id: row.id
                };
                _self[_name].tableLoading = true;
                httpGet(_name + 'BannerDel', paras, _self, function (res) {
                    _self[_name].tableLoading = false;
                    try {
                        if (_name == 'material') {
                            _self.materialList();
                        } else if (_name == 'window') {
                            _self.windowList();
                        } else {
                            _self.fetchList();
                        }
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            materialList() {    // 获取页面素材数据
                const _self = this;
                let _name = _self.activeName; // 获取当前tab的name，根据name进行后续操作
                _self[_name].height = document.getElementById('container').clientHeight - 77 - 42 - 15 - 42;
                let paras = {
                    id: _self[_name].filters.id,
                    type: _self[_name].filters.type,
                    size: _self[_name].size,
                    offset: (_self[_name].page - 1) * _self[_name].size
                };
                _self[_name].loading = true;
                httpGet(_name + 'BannerList', paras, _self, function (res) {
                    _self[_name].loading = false;
                    try {
                        let {error, status, data} = res;
                        _self[_name].total = data.totalElements;
                        _self[_name].list = data.content.map(function (item) { //格式化显示时间
                            item.startTime = util.timestampFormat(item.startTime);
                            item.endTime = util.timestampFormat(item.endTime);
                            return item;
                        });
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                }, function (res) {
                    _self[_name].loading = false;
                    _self.$message.error(res.data.error);
                })
            },
            materialOnline(row) { // 页面素材上下线
                const _self = this;
                let paras = {
                    id: row.id,
                    operation: Number(!row.status),
                    type: row.type
                };
                let timestamp1 = new Date(row.endTime), timestamp2 = new Date();
                let d = timestamp1.getTime() - timestamp2.getTime();
                if (d < 0 && row.status == 0) { // 上线操作且结束时间早与现在时间，弹出修改时间框
                    _self.material.formData = row;
                    _self.material.showUpdateForm = true;
                    return;
                }
                httpGet('materialOnline', paras, _self, function (res) {
                    try {
                        let {error, status, data} = res;
                        row.status = Number(!row.status);
                        _self.$message.success('操作成功');
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })

            },
            windowList() {    // 获取悬浮窗数据
                const _self = this;
                let _name = _self.activeName; // 获取当前tab的name，根据name进行后续操作
                _self[_name].height = document.getElementById('container').clientHeight - 77 - 42 - 15 - 42;
                let paras = {
                    id: _self[_name].filters.id,
                    size: _self[_name].size,
                    offset: (_self[_name].page - 1) * _self[_name].size
                };
                _self[_name].loading = true;
                httpGet(_name + 'BannerList', paras, _self, function (res) {
                    _self[_name].loading = false;
                    try {
                        let {error, status, data} = res;
                        _self[_name].total = data.totalElements;
                        _self[_name].list = data.content.map(function (item) { //格式化显示时间
                            item.startTime = util.timestampFormat(item.startTime);
                            item.endTime = util.timestampFormat(item.endTime);
                            return item;
                        });
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                }, function (res) {
                    _self[_name].loading = false;
                    _self.$message.error(res.data.error);
                })
            },
            windowOnline(row) { // 悬浮窗上下线
                const _self = this;
                let paras = {
                    id: row.id,
                    operation: Number(!row.status)
                };
                let timestamp1 = new Date(row.endTime), timestamp2 = new Date();
                let d = timestamp1.getTime() - timestamp2.getTime();
                if (d < 0 && row.status == 0) { // 上线操作且结束时间早与现在时间，弹出修改时间框
                    _self.window.formData = row;
                    _self.window.showUpdateForm = true;
                    return;
                }
                httpGet('windowOnline', paras, _self, function (res) {
                    try {
                        let {error, status, data} = res;
                        _self.windowList();
                        _self.$message.success('操作成功');
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
    .el-tabs__header {
        margin-bottom: 0;
    }
</style>
