<template>
    <section>
        <!--顶部工具条-->
        <el-col :span="24" class="toolbar">
            <el-form :inline="true" :model="filters">
                <el-form-item>
                    <el-input v-model="filters.kw" placeholder="用户ID/昵称" icon="circle-close"
                              :on-icon-click="resetSearch"
                              @keyup.enter.native="fetchList"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="fetchList">查询</el-button>
                </el-form-item>
            </el-form>
        </el-col>
        <!--表格-->
        <el-table v-loading="tableLoading" :data="tableList" stripe border :max-height="tableHeight"
                  style="width: 100%;margin-top: 10px;">
            <el-table-column prop="id" label="id" width="100" fixed></el-table-column>
            <el-table-column prop="text" label="评论内容" width="300"></el-table-column>
            <el-table-column prop="username" label="评论人" width="150"></el-table-column>
            <el-table-column prop="uid" label="uid" width="150"></el-table-column>
            <el-table-column prop="createTime" label="评论时间" min-width="180"></el-table-column>
            <el-table-column prop="vpId" label="视频id" min-width="150"></el-table-column>
            <el-table-column prop="replyCount" label="被回复数" min-width="120">
                <template scope="scope">
                    <el-button v-if="scope.row.replyCount" size="small" @click="showReply(scope.row)">
                        {{ scope.row.replyCount }}
                    </el-button>
                    <span v-else>0</span>
                </template>
            </el-table-column>
            <el-table-column prop="likeCount" label="被点赞数" min-width="120"></el-table-column>
            <el-table-column label="状态" min-width="100">
                <template scope="scope">
                    <el-tag :type="scope.row.status == 1 ? 'success' : 'danger'"
                            close-transition>{{ scope.row.status == 1 ? '已回复' : '未回复' }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column label="操作" width="100" fixed="right">
                <template scope="scope">
                    <el-button type="danger" size="small" @click="handleDel(scope.row)">删除</el-button>
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

        <!--回复列表-->
        <v-reply :commentData="commentData" v-model="isShowReply" v-on:refresh="fetchList"></v-reply>

    </section>
</template>

<script type="es6">
    import util from '../../../api/util'
    import {httpGet, httpPost} from '../../../api/api'
    import vReply from './replyList.vue'

    export default {
        components: {
            vReply
        },
        data() {
            return {
                filters: {
                    kw: ''
                },
                total: 0, //表格列表数据总数
                page: 1, //当前页，默认为第一页
                tableHeight: '100%',
                tableLoading: false, //表格的loading符号
                tableList: [], // 表格数据
                commentData: {}, // 需要显示回复列表的评论id
                isShowReply: false // 显示回复列表
            }
        },
        methods: {
            handleCurrentChange(val) { //翻页
                this.page = val;
                this.fetchList();
            },
            resetSearch() {
                this.filters.kw = '';
                this.fetchList();
            },
            fetchList() {    //获取列表
                let _self = this;
                _self.tableHeight = document.getElementById('container').clientHeight - 77 - 42 - 15;
                let paras = {
                    offset: 0,
                    size: 10,
                    id: '',
                    keyWord: ''
                };
                if (isNaN(_self.filters.kw)) { //输入不为数字，值传入kw
                    paras.keyWord = _self.filters.kw;
                } else {
                    paras.id = _self.filters.kw;
                }
                paras.offset = (_self.page - 1) * paras.size;
                _self.tableLoading = true;
                httpGet('commentRobotList', paras, _self, function (res) {
                    _self.tableLoading = false;
                    try {
                        let {error, status, data} = res;
                        _self.total = data.totalElements;
                        _self.tableList = data.content.map(function (item) {
                            item.createTime = util.timestampFormat(item.createTime);
                            return item;
                        });
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            showReply(row) { // 显示回复列表
                this.isShowReply = true;
                this.commentData = row;
            },
            handleDel(row) { //删除评论
                let _self = this;
                _self.$confirm('确认删除该评论吗?', '提示', {
                    type: 'warning'
                }).then(() => {
                    let paras = {
                        id: row.id
                    };
                    httpGet('commentListDel', paras, _self, function (res) {
                        try {
                            _self.$message.success('删除成功');
                        } catch (error) {
                            util.jsErrNotify(error);
                        }
                    })
                });
            }
        },
        mounted() {
            this.fetchList();
        }
    }
</script>

<style>
</style>
