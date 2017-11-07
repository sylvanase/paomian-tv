<template>
    <el-dialog title="弹幕列表" :value="value" v-model="visible">
        <el-col :span="24" class="toolbar" style="padding-bottom: 0;margin-top: -20px;">
            <el-form :inline="true" :model="filters">
                <el-form-item>
                    <el-select v-model="filters.tag" @change="detail" placeholder="请选择" style="width: 150px;">
                        <el-option label="全部标签" value=""></el-option>
                        <el-option v-for="item in tagList" :key="item.id" :label="item.name"
                                   :value="item.id">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="submit()">提交</el-button>
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
            <el-table-column prop="text" label="弹幕内容">
                <template scope="scope">
                    <el-input size="small" minlength="1" v-model.trim="scope.row.text" placeholder="请输入内容" @change="handleEdit(scope.$index, scope.row)"></el-input> <span>{{scope.row.text}}</span>
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
    import { httpGet, httpPost} from '../../../api/api';
    export default {
        name: 'vBarrage',
        props: ['value', 'postsData'],
        data() {
            return {
                visible: false, //默认隐藏
                showLoading: false,
                tableLoading: false, //表格的loading符号
                tableList: [], //表格数据
                tagList: [],
                filters: { //搜索筛选条件
                    tag: ''
                },
                total: 0, //表格列表数据总数
                page: 1, //当前页，默认为第一页
                multipleBarrageIds: [] //添加的弹幕id集合
            }
        },
        computed: {
            detail(){ //返回详情
                if(!this.value){ //不显示的时候不请求详细
                    return;
                }
                this.tableLoading = true;
                this.tableList = [];
                this.fetchList();
                this.handleTag();
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
            fetchList() {    //获取列表
                let _self = this;
                let paras = {
                    offset: 0,
                    size: 10,
                    tagId: _self.filters.tag
                };
                paras.offset = (_self.page - 1) * paras.size;
                _self.tableLoading = true;
                httpGet('barrageList', paras, _self, function (res) {
                    _self.tableLoading = false;
                    try {
                        let { error, status,data } = res;
                        _self.tableList = data.content;
                        _self.total = data.totalElements;
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            submit(){ //提交所选弹幕
                let _self = this;
                let paras = new FormData();
                paras.append("vpId", _self.postsData.id);
                paras.append("barrageIds", _self.multipleBarrageIds.join(','));
                httpPost('postsBarrageAdd', paras, _self, function (res) {
                    try {
                        let { error, status,data } = res;
                        _self.$message.success('增加弹幕成功');
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            handleTag(){ //加载弹幕标签
                let _self = this;
                httpGet('barrageTag', '', _self, function (res) {
                    _self.tableLoading = false;
                    try {
                        let { error, status,data } = res;
                        _self.tagList = data;
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            handleSelectionChange(val) { //选择弹幕更改时
                //val为对象数组
                this.multipleBarrageIds = []; //先清空数组
                if (val.length !== 0) {
                    for (var i = 0; i < val.length; i++) {
                        this.multipleBarrageIds.push(val[i].id);
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
                        let { error, status,data } = res;
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            }
        },
        watch: {
            detail(val){ //监测详情变化
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
    .tb-edit .current-row .el-input+span {
        display: none
    }
</style>
