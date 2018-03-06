<template>
    <section>
        <!--顶部工具条-->
        <el-col :span="24" class="toolbar">
            <el-form :inline="true" :model="filters">
                <el-form-item>
                    <el-button type="primary" @click="showForm()">新增</el-button>
                </el-form-item>
            </el-form>
        </el-col>

        <!--表格-->
        <el-table v-loading="tableLoading" :data="tableList" :max-height="tableHeight" stripe border
                  style="width: 100%;margin-top:10px;">
            <el-table-column prop="id" label="id" width="80"></el-table-column>
            <el-table-column prop="name" label="渠道名称"></el-table-column>
            <el-table-column prop="channel" label="广告标识"></el-table-column>
            <el-table-column prop="remark" label="备注"></el-table-column>
            <el-table-column label="推广链接">
                <template scope="scope">
                    <el-button class="js-copy-link" :data-clipboard-text="scope.row.linkUrl" size="small">复制</el-button>
                </template>
            </el-table-column>
            <el-table-column prop="apkName" label="包名"></el-table-column>
            <el-table-column prop="createTime" label="创建时间" width="175"></el-table-column>
            <el-table-column label="操作" width="140">
                <template scope="scope">
                    <el-button size="small" @click="showForm(scope.row)">编辑</el-button>
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

        <!--链接编辑-->
        <v-detail :linkData="linkData" v-model="isShowForm" v-on:refresh="fetchList"></v-detail>

    </section>
</template>

<script type="es6">
    import util from '../../../api/util'
    import {httpGet, httpPost} from '../../../api/api';
    import Clipboard from 'clipboard'
    import vDetail from './linkDetail.vue'

    export default {
        components: {
            vDetail
        },
        data() {
            return {
                total: 0, //表格列表数据总数
                page: 1, //当前页，默认为第一页
                tableHeight: '100%',
                tableLoading: false, //表格的loading符号
                tableList: [], //表格数据
                isShowForm: false, //显示、隐藏编辑页
                linkData: {}
            }
        },
        methods: {
            handleCurrentChange(val) { //翻页
                this.page = val;
                this.fetchList();
            },
            fetchList() {    //获取列表
                let _self = this;
                _self.tableHeight = document.getElementById('container').clientHeight - 50 - 42 - 15;
                let paras = {
                    offset: 0,
                    size: 10
                };
                paras.offset = (_self.page - 1) * paras.size;
                _self.tableLoading = true;
                httpGet('linkList', paras, _self, function (res) {
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
            showForm(row) { //显示详情表单
                this.isShowForm = true;
                this.linkData = row;
            },
            handleDel(row) { //删除链接
                let _self = this;
                _self.$confirm('确认删除该推广链接吗?', '提示', {
                    type: 'warning'
                }).then(() => {
                    _self.tableLoading = true;
                    httpGet('linkDel', {id: row.id}, _self, function (res) {
                        _self.tableLoading = false;
                        try {
                            let {error, status, data} = res;
                            _self.$message.success('操作成功');
                            _self.fetchList();
                        } catch (error) {
                            util.jsErrNotify(error);
                        }
                    })
                });
            }
        },
        mounted() {
            this.fetchList();
            const clipboard = new Clipboard('.js-copy-link');
            clipboard.on('success', function (e) {
                console.info('Text:', e.text);
            });
            clipboard.on('error', function (e) {
                console.log(e);
            });
        }
    }
</script>

<style>
</style>
