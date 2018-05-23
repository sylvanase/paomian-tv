<template>
    <section>
        <!--顶部工具条-->
        <el-col :span="24" class="toolbar">
            <el-form :inline="true" :model="filters">
                <el-form-item>
                    <el-input v-model="filters.kw" placeholder="帖子ID" icon="circle-close" :on-icon-click="resetSearch" @keyup.enter.native="fetchList"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-date-picker type="datetime" placeholder="开始时间" v-model="filters.start"
                                    style="width: 190px;" @change="setStart"></el-date-picker>
                    <span> - </span>
                    <el-date-picker type="datetime" placeholder="结束时间" v-model="filters.end"
                                    style="width: 190px;" @change="setEnd"></el-date-picker>
                </el-form-item>
                <el-form-item>
                    <el-select v-model="filters.status" @change="fetchList" style="width: 150px;">
                        <el-option label="全部处理状态" value=""></el-option>
                        <el-option label="检测成功" value="0"></el-option>
                        <el-option label="请求重复" value="110"></el-option>
                        <el-option label="参数错误" value="120"></el-option>
                        <el-option label="解析错误" value="130"></el-option>
                        <el-option label="数据类型错误" value="140"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-select v-model="filters.isDel" @change="fetchList" style="width: 150px;">
                        <el-option label="全部封禁状态" value=""></el-option>
                        <el-option label="正常" value="0"></el-option>
                        <el-option label="已封禁" value="1"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-select v-model="filters.checked" @change="fetchList" style="width: 150px;">
                        <el-option label="全部审核状态" value=""></el-option>
                        <el-option label="未审核" value="0"></el-option>
                        <el-option label="已审核" value="1"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-select v-model="filters.suspicion" @change="fetchList" style="width: 150px;">
                        <el-option label="全部嫌疑状态" value=""></el-option>
                        <el-option label="正常" value="0"></el-option>
                        <el-option label="违规" value="1"></el-option>
                        <el-option label="待定" value="2"></el-option>
                    </el-select>
                </el-form-item>
                <!-- <el-form-item>
                    <el-select v-model="filters.level" @change="fetchList" style="width: 110px;">
                        <el-option label="全部级别" value=""></el-option>
                        <el-option label="正常" value="0"></el-option>
                        <el-option label="不确定" value="1"></el-option>
                        <el-option label="确定" value="2"></el-option>
                    </el-select>
                </el-form-item> -->
                <el-form-item>
                    <el-button type="primary" @click="fetchList">查询</el-button>
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
                         style="width: 100%;cursor: pointer;vertical-align: middle;margin: 10px 0;"
                         :src="scope.row.coverUrl" alt="视频封面"/>
                    <span @click="playVideo(scope.row)" v-else>封面为空</span>
                </template>
            </el-table-column>
            <el-table-column prop="username" label="发帖人" min-width="150"></el-table-column>
            <el-table-column prop="createTime" label="发帖时间" min-width="180"></el-table-column>
            <el-table-column prop="videoText" min-width="200" label="帖子描述"></el-table-column>
            <el-table-column label="已封禁" width="100">
                <template scope="scope">
                    <el-tag :type="scope.row.isDel == 1 ? 'success' : 'danger'"
                            close-transition>{{ scope.row.isDel == 1 ? '是' : '否' }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="status" label="监测状态" width="130"></el-table-column>
            <el-table-column prop="level" label="嫌疑类型" width="130"></el-table-column>
            <el-table-column label="操作" fixed="right" width="140">
                <template scope="scope">
                    <el-button-group>
                        <el-button :type="scope.row.isDel == 0 ? 'danger' : ''" size="small"
                                   @click="blockedVideo(scope.row)">
                            {{ scope.row.isDel == 0 ? '封禁' : '解封' }}
                        </el-button>
                        <el-button :disabled="scope.row.checked == 1 ? true : false" size="small" type="danger" @click.native="showCheck(scope.row, scope.$index)">
                            {{ scope.row.checked == 1 ? '已审核' : '审核' }}
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
        <!--播放弹窗-->
        <el-dialog title="视频播放" v-model="videoVisible" @close="videoClose()">
            <div style="text-align: center;" v-html="videoHtml"></div>
        </el-dialog>

        <!--审核意见-->
        <el-dialog title="审核意见" v-model="checkVisible" size="tiny">
            <el-form label-width="80px" style="margin-bottom: -20px;">
                <el-form-item label="审核意见">
                    <el-select v-model="checkAdvice" style="width: 150px;">
                        <el-option label="正常" value="0"></el-option>
                        <el-option label="违规" value="1"></el-option>
                    </el-select>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button size="small" @click.native="checkVisible = false">取消</el-button>
                <el-button size="small" type="primary" @click.native="checkPost">提交</el-button>
            </div>
        </el-dialog>
    </section>
</template>

<script type="es6">
    import util from '../../../api/util'
    import {httpGet, httpPost} from '../../../api/api';

    export default {
        data() {
            return {
                filters: {
                    kw: '',
                    status: '',
                    level: '',
                    start: '',
                    end: '',
                    suspicion: '', // 嫌疑
                    checked: '',
                    isDel: '',
                    checked: ''
                },
                total: 0, //表格列表数据总数
                page: 1, //当前页，默认为第一页
                tableHeight: '100%',
                tableLoading: false, //表格的loading符号
                videoVisible: false,  //播放视频界面 显示、隐藏
                videoHtml: '',
                checkAdvice: '0',
                checkVisible: false,
                checkId: {}
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
                    id: _self.filters.kw,
                    status: _self.filters.status,
                    startTime: _self.filters.start,
                    endTime: _self.filters.end,
                    suspicion: _self.filters.suspicion, // 嫌疑
                    checked: _self.filters.checked,
                    isDel: _self.filters.isDel,
                    checked: _self.filters.checked
                    //level: _self.filters.level
                };
                paras.offset = (_self.page - 1) * paras.size;
                _self.tableLoading = true;
                httpGet('postsCheckList', paras, _self, function (res) {
                    _self.tableLoading = false;
                    try {
                        let {error, status, data} = res;
                        _self.total = data.totalElements;
                        _self.tableList = data.content.map(function (item) { //格式化显示时间
                            item.createTime = util.timestampFormat(item.createTime);
                            item.level = util.postsLevel(item.level);
                            item.status = util.postsStatus(item.status);
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
            playVideo(row) { //播放视频
                this.videoVisible = true;
                this.videoHtml = '<video style="max-width: 100%;max-height:350px;" controls="controls" autoplay="autoplay">'
                    + '<source src="' + row.videoUrl + '" type="video/mp4">对不起，您的浏览器不支持video标签，无法播放视频。</video>';
            },
            videoClose() {
                this.videoHtml = '';
            },
            blockedVideo(row) { // 封禁帖子
                let _self = this;
                if(row.isDel == 0){ // 未封禁，需要进行封禁操作
                    let paras = new FormData();
                    paras.append("vpId", row.id);
                    _self.tableLoading = true;
                    httpPost('postsBlocked', paras, _self, function (res) {
                        _self.tableLoading = false;
                        try {
                            let {error, status, data} = res;
                            _self.$message.success('操作成功');
                            row.isDel = Number(!row.isDel);
                        } catch (error) {
                            util.jsErrNotify(error);
                        }
                    })
                } else { // 封禁帖子
                    let paras = {
                        vpId: row.id
                    };
                    _self.tableLoading = true;
                    httpGet('postsUnblock', paras, _self, function (res) {
                        _self.tableLoading = false;
                        try {
                            let {error, status, data} = res;
                            _self.$message.success('操作成功');
                            row.isDel = Number(!row.isDel);
                        } catch (error) {
                            util.jsErrNotify(error);
                        }
                    })
                } 
            },
            setStart(val) { //格式化日期控件值
                this.filters.start = val;
            },
            setEnd(val) {
                this.filters.end = val;
            },
            showCheck(row, index){
                this.checkVisible = true;
                this.checkId = row;
                this.checkId.index = index;
            },
            checkPost(){ // 审核帖子
                let _self = this,
                    index = _self.checkId.index,
                    _id = _self.checkId.id;
                httpGet('postsCheck', {id: _id, text: '', advice: _self.checkAdvice}, _self, function (res) {
                    try {
                        let {error, status, data} = res;
                        _self.$message.success('操作成功');
                        if( _self.checkAdvice == 1){ // 审核意见为违规，封禁改贴
                            _self.tableList[index].isDel = 1;
                        }
                        console.log(index);
                        console.log(_self.tableList[index].isDel);
                        _self.tableList[index].checked = 1;
                        console.log(_self.tableList[index].checked);
                        _self.checkVisible = false;
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
        },
        mounted() {
            this.fetchList();
        }
    }
</script>

<style scoped>
</style>
