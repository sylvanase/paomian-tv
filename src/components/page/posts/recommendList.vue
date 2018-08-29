<template>
    <section>
        <!--顶部工具条-->
        <el-col :span="24" class="toolbar">
            <el-form :inline="true" :model="filters">
                <el-form-item>
                    <el-input v-model="filters.kw" placeholder="ID" icon="circle-close"
                              :on-icon-click="resetSearch" @keyup.enter.native="fetchList"></el-input>
                </el-form-item>
                <!-- <el-form-item>
                    <el-date-picker type="datetime" placeholder="开始时间" v-model="filters.start"
                                    style="width: 200px;" @change="setStart"></el-date-picker>
                    <span> - </span>
                    <el-date-picker type="datetime" placeholder="结束时间" v-model="filters.end"
                                    style="width: 200px;" @change="setEnd"></el-date-picker>
                </el-form-item> -->
                <el-form-item>
                    <el-button type="primary" @click="fetchList">查询</el-button>
                </el-form-item>
            </el-form>
        </el-col>

        <!--表格-->
        <el-table v-loading="tableLoading" :data="tableList" stripe border :max-height="tableHeight"
                  style="width: 100%;">
            <el-table-column prop="strVpId" label="帖子id" width="180"></el-table-column>
            <el-table-column label="帖子描述">
                <template scope="scope">
                    {{ scope.row.topicName ? '#'+ scope.row.topicName + '#' : '' }}{{ scope.row.videoText }}
                </template>
            </el-table-column>
            <el-table-column prop="createTime" label="发帖时间" width="180"></el-table-column>
            <el-table-column label="操作">
                <template scope="scope">
                    <el-button size="small" type="danger" @click="handleDel(scope.row)">移出</el-button>
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
    </section>
</template>

<script type="es6">
    import util from '../../../api/util'
    import {httpGet, httpPost, httpDel} from '../../../api/api';
    
    export default {
        data() {
            return {
                filters: {
                    kw: '',
                    id: '',
                    start: '',
                    end: '',
                },
                total: 0, //表格列表数据总数
                page: 1, //当前页，默认为第一页
                tableHeight: '100%',
                tableLoading: false, //表格的loading符号
                tableList: [], //表格数据
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
                    id: _self.filters.kw
                };
                paras.offset = (_self.page - 1) * paras.size;
                _self.tableLoading = true;
                httpGet('postsRecommendList', paras, _self, function (res) {
                    _self.tableLoading = false;
                    try {
                        let {error, status, data} = res;
                        _self.total = data.totalElements;
                        _self.tableList = data.content.map(function (item) { //格式化显示时间
                            item.createTime = util.timestampFormat(item.createTime);
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
            handleDel(row) {
                let _self = this;
                httpDel('postsRecommendDel', {id: row.id}, _self, function (res) {
                    try {
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
            }
        },
        mounted() {
            this.fetchList();
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
