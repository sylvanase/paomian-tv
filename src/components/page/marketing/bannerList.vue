<template>
    <section>
        <el-tabs v-model="activeName" @tab-click="tabChange">
            <el-tab-pane label="开机广告" name="launch">
                <el-col :span="24" class="toolbar" style="padding-bottom: 0;">
                    <el-form :inline="true">
                        <el-form-item>
                            <el-input v-model="launch.filters.id" placeholder="bannerID"></el-input>
                        </el-form-item>
                        <el-form-item>
                            <el-date-picker v-model="launch.filters.time" type="datetimerange" placeholder="选择时间范围"
                                            align="center" @change="setRange">
                            </el-date-picker>
                        </el-form-item>
                        <el-form-item>
                            <el-button type="primary" @click="launchList">查询</el-button>
                        </el-form-item>
                        <el-form-item>
                            <el-button type="primary" @click="showForm()">新增</el-button>
                        </el-form-item>
                    </el-form>
                </el-col>
                <!--表格-->
                <el-table v-loading="launch.loading" :data="launch.list" stripe border style="width: 100%;">
                    <el-table-column prop="id" label="id" width="80"></el-table-column>
                    <el-table-column prop="iosImageUrl" label="ios开机图" width="135">
                        <template scope="scope">
                            <img v-if="scope.row.iosImageUrl !== ''"
                                 style="width: 100%;vertical-align: middle;margin: 5px 0;" :src="scope.row.iosImageUrl" alt="ios开机图"/>
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
                    <el-table-column label="操作" width="150">
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
                <el-col :span="24" class="toolbar" style="padding-bottom: 0;">
                    <el-form :inline="true">
                        <el-form-item>
                            <el-input v-model="topic.filters.id" placeholder="bannerID"></el-input>
                        </el-form-item>
                        <el-form-item>
                            <el-date-picker type="datetimerange" placeholder="选择时间范围" align="center" @change="setRange">
                            </el-date-picker>
                        </el-form-item>
                        <el-form-item>
                            <el-button type="primary" @click="topicList">查询</el-button>
                        </el-form-item>
                        <el-form-item>
                            <el-button type="primary" @click="showForm()">新增</el-button>
                        </el-form-item>
                    </el-form>
                </el-col>
                <!--表格-->
                <el-table v-loading="topic.loading" :data="topic.list" stripe border style="width: 100%;">
                    <el-table-column prop="id" label="id" width="100"></el-table-column>
                    <el-table-column prop="topicUrl" label="banner图" width="135">
                        <template scope="scope">
                            <img v-if="scope.row.topicUrl !== ''"
                                 style="width: 100%;vertical-align: middle;margin: 5px 0;" :src="scope.row.topicUrl" alt=""/>
                            <span v-else>图片路径缺失</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="appLink" label="外链"></el-table-column>
                    <el-table-column prop="startTime" label="开始时间" width="175"></el-table-column>
                    <el-table-column prop="endTime" label="停止时间" width="175"></el-table-column>
                    <el-table-column label="操作" width="150">
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
            <el-tab-pane label="个人中心" name="personal">个人中心，暂无内容</el-tab-pane>
            <el-tab-pane label="广场" name="square">
                <el-col :span="24" class="toolbar" style="padding-bottom: 0;">
                    <el-form :inline="true">
                        <el-form-item>
                            <el-input v-model="square.filters.id" placeholder="bannerID"></el-input>
                        </el-form-item>
                        <el-form-item>
                            <el-date-picker type="datetimerange" placeholder="选择时间范围" align="center" @change="setRange">
                            </el-date-picker>
                        </el-form-item>
                        <el-form-item>
                            <el-button type="primary" @click="squareList">查询</el-button>
                        </el-form-item>
                        <el-form-item>
                            <el-button type="primary" @click="showForm()">新增</el-button>
                        </el-form-item>
                    </el-form>
                </el-col>
                <!--表格-->
                <el-table v-loading="square.loading" :data="square.list" stripe border style="width: 100%;">
                    <el-table-column prop="id" label="id" width="100"></el-table-column>
                    <el-table-column prop="squareImageUrl" label="banner图" width="135">
                        <template scope="scope">
                            <img v-if="scope.row.squareImageUrl !== ''"
                                 style="width: 100%;vertical-align: middle;margin: 5px 0;" :src="scope.row.squareImageUrl" alt=""/>
                            <span v-else>图片路径缺失</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="appLink" label="外链"></el-table-column>
                    <el-table-column prop="startTime" label="开始时间" width="175"></el-table-column>
                    <el-table-column prop="endTime" label="停止时间" width="175"></el-table-column>
                    <el-table-column label="操作" width="150">
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
        </el-tabs>

        <!--开机页编辑-->
        <v-launch-detail :launchData="launch.formData" v-model="launch.showForm"
                         v-on:refresh="launchList"></v-launch-detail>

        <!--话题页编辑-->
        <v-topic-detail :topicData="topic.formData" v-model="topic.showForm" v-on:refresh="topicList"></v-topic-detail>

        <!--广场页编辑-->
        <v-square-detail :squareData="square.formData" v-model="square.showForm"
                         v-on:refresh="squareList"></v-square-detail>

    </section>
</template>

<script type="es6">
    import util from '../../../api/util'
    import { httpGet, httpPost} from '../../../api/api';

    import vLaunchDetail from './launchDetail.vue'
    import vTopicDetail from './topicDetail.vue'
    import vSquareDetail from './squareDetail.vue'

    export default {
        components: {
            vLaunchDetail,
            vTopicDetail,
            vSquareDetail
        },
        data() {
            return {
                activeName: 'launch', //默认显示第一页
                launch: { // 开机页数据
                    loading: false,
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
                topic: { // 话题页数据
                    loading: false,
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
                personal: { // 个人页数据
                    loading: false,
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
                square: { // 广场页数据
                    loading: false,
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
                }
            }
        },
        methods: {
            tabChange(tab){
                const _self = this;
                let _name = tab.name;
                _self.launch.page = 1; // 将所有tab下的page重置为1
                _self.topic.page = 1;
                _self.personal.page = 1;
                _self.square.page = 1;
                _self.launch.filters = {
                    id: '',
                    start: '',
                    end: '',
                    time: ''
                }
                _self.topic.filters = {
                    id: '',
                    start: '',
                    end: '',
                    time: ''
                }
                _self.personal.filters = {
                    id: '',
                    start: '',
                    end: '',
                    time: ''
                }
                _self.square.filters = {
                    id: '',
                    start: '',
                    end: '',
                    time: ''
                }
                if (_name == 'launch') {
                    _self.launchList();
                }
                if (_name == 'topic') {
                    _self.topicList();
                }
                if (_name == 'personal') {
                    _self.personalList();
                }
                if (_name == 'square') {
                    _self.squareList();
                }
            },
            handleCurrentChange(val) { //翻页
                const _self = this;
                let _name = _self.activeName; // 获取当前tab的name，根据name进行后续操作
                _self[_name].page = val; // 将所有tab下的page重置为1
                if (_name == 'launch') {
                    _self.launchList();
                }
                if (_name == 'topic') {
                    _self.topicList();
                }
                if (_name == 'personal') {
                    _self.personalList();
                }
                if (_name == 'square') {
                    _self.squareList();
                }
            },
            setRange(val){ //格式化日期控件值
                const _self = this;
                let _name = _self.activeName; // 获取当前tab的name，根据name进行后续操作
                _self[_name].filters.start = val.substring(0, 19);
                _self[_name].filters.end = val.substring(22);
            },
            launchList() {    //获取开机页列表
                let _self = this;
                let paras = new FormData();
                paras.append('size', _self.launch.size);
                paras.append('offset', (_self.launch.page - 1) * _self.launch.size);
                paras.append('id', _self.launch.filters.id);
                paras.append('startTime', _self.launch.filters.start);
                paras.append('endTime', _self.launch.filters.end);
                _self.launch.loading = true;
                httpPost('launchBannerList', paras, _self, function (res) {
                    _self.launch.loading = false;
                    try {
                        let { error, status,data } = res;
                        _self.launch.total = data.totalElements;
                        _self.launch.list = data.content.map(function (item) { //格式化显示时间
                            item.startTime = util.timestampFormat(item.startTime);
                            item.endTime = util.timestampFormat(item.endTime);
                            return item;
                        });
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            topicList() {    // 获取话题页列表
                let _self = this;
                let paras = new FormData();
                paras.append('size', _self.topic.size);
                paras.append('offset', (_self.topic.page - 1) * _self.topic.size);
                paras.append('id', _self.topic.filters.id);
                paras.append('startTime', _self.topic.filters.start);
                paras.append('endTime', _self.topic.filters.end);
                _self.topic.loading = true;
                httpPost('topicBannerList', paras, _self, function (res) {
                    _self.topic.loading = false;
                    try {
                        let { error, status,data } = res;
                        _self.topic.total = data.totalElements;
                        _self.topic.list = data.content.map(function (item) { //格式化显示时间
                            item.startTime = util.timestampFormat(item.startTime);
                            item.endTime = util.timestampFormat(item.endTime);
                            return item;
                        });
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            personalList() {    // 获取个人页列表
                console.log('personal')
            },
            squareList() {    // 获取广场页列表
                let _self = this;
                let paras = new FormData();
                paras.append('size', _self.square.size);
                paras.append('offset', (_self.square.page - 1) * _self.square.size);
                paras.append('id', _self.square.filters.id);
                paras.append('startTime', _self.square.filters.start);
                paras.append('endTime', _self.square.filters.end);
                _self.topic.loading = true;
                httpPost('squareBannerList', paras, _self, function (res) {
                    _self.square.loading = false;
                    try {
                        let { error, status,data } = res;
                        _self.square.total = data.totalElements;
                        _self.square.list = data.content.map(function (item) { //格式化显示时间
                            item.startTime = util.timestampFormat(item.startTime);
                            item.endTime = util.timestampFormat(item.endTime);
                            return item;
                        });
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            showForm (row){ // 根据当前显示tab显示对应的类型表单
                const _self = this;
                let _name = _self.activeName; // 获取当前tab的name，根据name进行后续操作
                _self[_name].formData = row; // 对应tab的表格数据赋值
                _self[_name].showForm = true; // 对应tab的表格显示
            },
            bannerDel (row){
                const _self = this;
                let _name = _self.activeName; // 获取当前tab的name，根据name进行后续操作
                _self.$message.warning('该功能尚未提供接口');
            }
        },
        mounted() {
            this.launchList();
        }
    }
</script>

<style>
</style>
