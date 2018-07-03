<template>
    <section>
        <!--顶部工具条-->
        <el-col :span="24" class="toolbar">
            <el-form :inline="true" :model="filters">
                <el-form-item>
                    <el-input v-model="filters.kw" placeholder="ID/关键字" icon="circle-close" :on-icon-click="resetSearch" @keyup.enter.native="fetchList"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-select v-model="filters.status" @change="fetchList" placeholder="视频状态">
                        <el-option v-for="item in options" :key="item.id" :label="item.text" :value="item.id"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-date-picker type="date" placeholder="开始时间" v-model="filters.start"
                                    style="width: 150px;" @change="setStart"></el-date-picker>
                    <span> - </span>
                    <el-date-picker type="date" placeholder="结束时间" v-model="filters.end"
                                    style="width: 150px;" @change="setEnd"></el-date-picker>
                </el-form-item>
                <el-form-item>
                    <el-input v-model="filters.user" placeholder="上传人" @keyup.enter.native="fetchList"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="fetchList">查询</el-button>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="showForm">新增</el-button>
                </el-form-item>
                <el-form-item>
                    <el-button type="info" @click.native="batchVisible = true">批量添加</el-button>
                </el-form-item>
            </el-form>
        </el-col>

        <!--表格-->
        <el-table v-loading="tableLoading" :data="tableList" stripe border :max-height="tableHeight"
                  style="width: 100%;">
            <el-table-column prop="userName" label="上传人" min-width="150" fixed></el-table-column>
            <el-table-column label="封面(点击播放)" width="135">
                <template scope="scope">
                    <img @click="playVideo(scope.row)" v-if="scope.row.coverUrl !== ''"
                         style="width: 100%;cursor: pointer;vertical-align:middle;margin:10px auto;"
                         :src="scope.row.coverUrl" alt="视频封面"/>
                    <span @click="playVideo(scope.row)" v-else>封面为空</span>
                </template>
            </el-table-column>
            <el-table-column prop="title" min-width="150" label="标题"></el-table-column>
            <el-table-column prop="intro" label="简介" min-width="150"></el-table-column>
            <el-table-column prop="createTime" label="上传时间" width="120"></el-table-column>
            <el-table-column label="视频状态" width="120">
                <template scope="scope">
                    <div v-if="scope.row.videoStatus != 0">
                        {{  options[scope.row.videoStatus - 1].text  }}
                    </div>
                </template>
            </el-table-column>
            <el-table-column prop="vv" label="播放数"></el-table-column>
            <el-table-column prop="vvUv" label="UV"></el-table-column>
            <el-table-column prop="clickCnt" label="点击数"></el-table-column>
            <el-table-column prop="shareCnt" label="分享数"></el-table-column>
            <el-table-column prop="shareCntUv" label="分享UV" width="90"></el-table-column>
            <el-table-column prop="likeCnt" label="点赞"></el-table-column>
            <el-table-column prop="commentCnt" label="弹幕"></el-table-column>
            <el-table-column prop="commentCntUv" label="弹幕UV" width="90"></el-table-column>
            <el-table-column prop="biuCnt" label="biu"></el-table-column>
            <el-table-column prop="biuCntUv" label="biu UV" width="90"></el-table-column>
            <el-table-column label="操作" width="100" fixed="right">
                <template scope="scope">
                    <el-button type="danger" :disabled="scope.row.delFlag == 1" size="small" @click="handleDel(scope.row)">
                        {{ scope.row.delFlag == 1 ? '已删除': '删除' }}
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

        <!--  批量添加看点  -->
        <el-dialog title="批量新增看点" v-model="batchVisible" size="tiny" @close="resetBatch">
            <el-form label-width="80px">
                <el-form-item label="表格文件" style="margin-bottom: -10px;">
                    <input type="file" id="comFile" name="excel">
                </el-form-item>
                <el-form-item label="" style="margin-bottom: -20px;text-align: right;">
                    <a href="../../../../static/QQ看点.xlsx" target="_blank" title="">下载示例文件</a>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button size="small" @click.native="batchVisible = false">取消</el-button>
                <el-button size="small" type="primary" @click.native="batchSubmit" :loading="batchLoading">导入</el-button>
            </div>
        </el-dialog>

        <!--新建QQ看点-->
        <el-dialog title="新增QQ看点" v-model="isShowForm" @close="resetFormData">
            <el-form :model="formData" label-width="80px" :rules="formRules" ref="formData" style="margin-bottom: -20px;">
                <el-form-item label="视频id" prop="id">
                    <el-input v-model.trim="formData.id" placeholder="请输入视频id"></el-input>
                </el-form-item>
                <el-form-item label="标题" prop="title">
                    <el-input v-model.trim="formData.title" minlength="6" maxlength="40" placeholder="请输入视频标题"></el-input>
                </el-form-item>
                <el-form-item label="视频简介" prop="text">
                    <el-input type="textarea" :rows="2" placeholder="请输入视频简介" v-model.trim="formData.text" maxlength="100"></el-input>
                </el-form-item>
                <el-form-item label="视频分类" prop="cat">
                    <el-input v-model.trim="formData.cat" placeholder="请输入分类，使用英文逗号“,”隔开"></el-input>
                </el-form-item>
                <el-form-item label="清晰度" required>
                    <el-select v-model="formData.sharpness" placeholder="请选择">
                        <el-option label="480P" value="480P"></el-option>
                        <el-option label="720P" value="720P"></el-option>
                        <el-option label="1080P" value="1080P"></el-option>
                    </el-select>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button size="small" @click.native="isShowForm = false">取消</el-button>
                <el-button size="small" type="primary" @click.native="formSubmit" :loading="formLoading">提交</el-button>
            </div>
        </el-dialog>
    </section>
</template>

<script type="es6">
    import util from '../../../api/util'
    import {httpGet, httpPost, httpDel} from '../../../api/api';
    
    const statusList = [{
        id: '1', text: '转码中'
    },{
        id: '2', text: '转码失败'
    },{
        id: '3', text: '审核中'
    },{
        id: '4', text: '审核失败'
    },{
        id: '5', text: '已发布'
    },{
        id: '6', text: '已发布，等待看点推荐'
    },{
        id: '7', text: '已发布，已被看点精选'
    },{
        id: '8', text: '已发布，已被看点精选'
    },{
        id: '9', text: '已发布，未被看点推荐'
    },{
        id: '10', text: '已撤回'
    },{
        id: '11', text: '已下架'
    },{
        id: '12', text: '已过期'
    },{
        id: '13', text: '待发送'
    }];

    export default {
        data() {
            return {
                filters: {
                    kw: '',
                    status: '',
                    start: '',
                    end: '',
                    user: ''
                },
                options: statusList,
                total: 0, //表格列表数据总数
                page: 1, //当前页，默认为第一页
                tableHeight: '100%',
                tableLoading: false, //表格的loading符号
                tableList: [], //表格数据
                isShowForm: false,
                formRules: {
                    id: [
                        {required: true, message: '请输入视频id', trigger: 'blur'}
                    ],
                    title: [
                        {required: true, message: '请输入视频标题', trigger: 'blur'},
                        {min: 6, max: 40, message: '长度在 6 到 40 个字符', trigger: 'blur'}
                    ],
                    text:[
                        {required: true, message: '请输入视频简介', trigger: 'blur'},
                        {min: 10, max: 100, message: '长度在 10 到 100 个字符', trigger: 'blur'}
                    ],
                    cat: [
                        {required: true, message: '请输入分类', trigger: 'change'}
                    ]
                },
                formData:{
                    id: '',
                    title:'',
                    text: '',
                    cat: '',
                    sharpness: '480P'
                },
                formLoading: false,
                videoVisible: false,  //播放视频界面 显示、隐藏
                videoHtml: '',
                batchVisible: false, // 显示、隐藏导入表单弹窗
                batchLoading: false
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
                let paras = new FormData();
                paras.append('startTime', _self.filters.start);
                paras.append('endTime', _self.filters.end);
                paras.append('videoStatus', _self.filters.status);
                paras.append('userName', _self.filters.user);
                paras.append('searchKey', _self.filters.kw);
                paras.append('size', 10);
                paras.append('offset', (_self.page - 1) * 10);
                _self.tableLoading = true;
                httpPost('qqWatchList', paras, _self, function (res) {
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
            setStart(val) { //格式化日期控件值
                this.filters.start = val;
            },
            setEnd(val) {
                this.filters.end = val;
            },
            showForm(row) { //显示用户详情表单
                this.isShowForm = true;
            },
            playVideo(row) { //播放视频
                this.videoVisible = true;
                this.videoHtml = '<video style="max-width: 100%;max-height:350px;" controls="controls" autoplay="autoplay">'
                    + '<source src="' + row.videoUrl + '" type="video/mp4">对不起，您的浏览器不支持video标签，无法播放视频。</video>';
            },
            videoClose() {
                this.videoHtml = '';
            },
            handleDel(row) { // 删除看点
                let _self = this;
                let paras = {
                    id: row.id
                };
                _self.tableLoading = true;
                httpDel('qqWatchDel', paras, _self, function (res) {
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
            batchSubmit(){ // 导入看点表格
                let _self = this,
                    file = document.getElementById('comFile').files[0];
                if(file.length == 0){
                    _self.$message.warning('请选择要上传的excel文件');
                }
                let paras = new FormData();
                paras.append("file", file);
                _self.batchLoading = true;
                httpPost('qqWatchFile', paras, _self, function (res) {
                    _self.batchLoading = false;
                    try {
                        _self.$message.success('导入成功');
                        _self.fetchList();
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                },function(res){
                    _self.batchLoading = false;
                    _self.$message.error(res.data.error);
                })
            },
            resetBatch(){ // 重置input
                let _self = this;
                document.getElementById('comFile').value = '';
                _self.batchLoading = false;
            },
            formSubmit(){ //提交表单
                let _self = this;
                _self.$refs.formData.validate((valid) => {
                    if (valid) {
                        let paras = {
                            vpId: _self.formData.id,
                            title: _self.formData.title,
                            intro: _self.formData.text,
                            channel: _self.formData.cat,
                            sharpness: _self.formData.sharpness
                        };
                        _self.formLoading = true;
                        httpPost('qqWatchAdd', paras, _self, function (res) {
                            _self.formLoading = false;
                            try {
                                let { error, status,data } = res;
                                _self.$message.success('提交成功');
                                _self.$refs['formData'].resetFields();
                                _self.visible = false;
                                _self.fetchList();
                            } catch (error) {
                                util.jsErrNotify(error);
                            }
                        })
                    }
                });
            },
            resetFormData(){
                let _self = this;
                _self.formLoading = false;
                _self.formData = {
                    id: '',
                    title:'',
                    text: '',
                    cat: '',
                    sharpness: '480P'
                };
                _self.$refs['formData'].resetFields();
            }
        },
        mounted() {
            this.fetchList();
        }
    }
</script>