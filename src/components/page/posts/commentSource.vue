<template>
    <el-dialog title="弹幕列表" :value="value" v-model="visible">
        <el-col :span="24" class="toolbar" style="padding-bottom: 0;margin-top: -20px;">
            <el-form :inline="true" :model="filters">
                <el-form-item>
                    <el-input v-model="filters.kw" placeholder="帖子ID/关键字" icon="circle-close"
                              :on-icon-click="resetSearch" @keyup.enter.native="fetchList"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-select v-model="filters.type" @change="fetchList" placeholder="请选择">
                        <el-option label="按评论分类搜" value="1"></el-option>
                        <el-option label="按剧本搜" value="2"></el-option>
                        <el-option label="按片段搜" value="3"></el-option>
                        <el-option label="按音乐搜" value="4"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="fetchList()">查询</el-button>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="submit()">提交</el-button>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="addComment()">新增</el-button>
                </el-form-item>
                <el-form-item>
                    <span>（点击弹幕内容，即可对其进行编辑操作）</span>
                </el-form-item>
            </el-form>
        </el-col>
        <!--表格-->
        <el-table v-loading="tableLoading" class="tb-edit" :data="tableList" stripe border style="width: 100%;"
                  @selection-change="handleSelectionChange" highlight-current-row>
            <el-table-column type="selection" width="55"></el-table-column>
            <el-table-column prop="id" label="id" width="150"></el-table-column>
            <el-table-column prop="text" label="评论内容">
                <template scope="scope">
                    <el-input size="small" minlength="1" v-model.trim="scope.row.text" placeholder="请输入内容"
                              @change="handleEdit(scope.row)"></el-input>
                    <span>{{scope.row.text}}</span>
                </template>
            </el-table-column>
        </el-table>
        <!--工具条-->
        <el-col :span="24" class="mt-10" style="margin-bottom: 20px;">
            <el-pagination style="float:right;" @current-change="handleCurrentChange"
                           :page-size="10" :current-page="page"
                           layout="total, prev, pager, next, jumper" :total="total">
            </el-pagination>
        </el-col>
    </el-dialog>
</template>

<script type="es6">
    import util from '../../../api/util'
    import {httpGet, httpPost} from '../../../api/api';

    export default {
        name: 'vCommentAdd',
        props: ['value', 'postsData'],
        data() {
            return {
                visible: false, //默认隐藏
                showLoading: false,
                tableLoading: false, //表格的loading符号
                tableList: [], //表格数据
                filters: { //搜索筛选条件
                    type: 1,
                    kw: ''
                },
                total: 0, //表格列表数据总数
                page: 1, //当前页，默认为第一页
                multipleCommentIds: [] //添加的弹幕id集合
            }
        },
        computed: {
            detail() { //返回详情
                if (!this.value) { //不显示的时候不请求详细
                    return;
                }
                this.tableLoading = true;
                this.tableList = [];
                this.fetchList();
            }
        },
        methods: {
            handleCurrentChange(val) { //翻页
                this.page = val;
                this.fetchList();
            },
            change() {
                this.visible = false;
            },
            resetSearch() {
                this.filters.kw = '';
                this.fetchList();
            },
            fetchList() {    //获取评论库列表
                let _self = this;
                let paras = {
                    offset: 0,
                    size: 10,
                    searchType: _self.filters.type
                };
                if (isNaN(_self.filters.kw)) { //输入不为数字，值传入kw
                    paras.keyWord = _self.filters.kw;
                } else {
                    paras.id = _self.filters.kw;
                }
                paras.offset = (_self.page - 1) * paras.size;
                _self.tableLoading = true;
                httpGet('commentListSearch', paras, _self, function (res) {
                    _self.tableLoading = false;
                    try {
                        let {error, status, data} = res;
                        _self.tableList = data.content;
                        _self.total = data.totalElements;
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            submit() { //提交所选弹幕
                let _self = this;
                let paras = new FormData();
                paras.append("vpId", _self.postsData.id);
                paras.append("barrageIds", _self.multipleCommentIds.join(','));
                httpPost('postsBarrageAdd', paras, _self, function (res) {
                    try {
                        _self.$message.success('增加评论成功');
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            handleSelectionChange(val) { //选择评论更改时
                //val为对象数组
                this.multipleBarrageIds = []; //先清空数组
                if (val.length !== 0) {
                    for (var i = 0; i < val.length; i++) {
                        this.multipleCommentIds.push(val[i].id);
                    }
                }
            },
            handleEdit(row) { // 编辑评论
                let _self = this;
                let paras = {
                    id: row.id,
                    text: row.text
                }
                httpGet('commentEdit', paras, _self, function (res) {
                    try {

                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            }
        },
        watch: {
            detail(val) { //监测详情变化
            },
            value(val) {
                this.visible = val;
            },
            visible(val) {
                this.$emit('input', val);
            }
        },
        mounted() {
            if (this.value) {
                this.visible = true;
            }
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

    .tb-edit .current-row .el-input + span {
        display: none
    }
</style>
