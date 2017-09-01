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
    import { axiosGet, axiosPost} from '../../../api/api';
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
                let para = {
                    offset: 0,
                    size: 10,
                    tagId: this.filters.tag
                };
                para.offset = (this.page - 1) * para.size;
                this.tableLoading = true;
                axiosGet('barrageList', para).then((res) => {
                    let { error, status,data } = res;
                    if (status !== 0) {
                        if (status == 403) { //返回403时，重新登录
                            sessionStorage.removeItem('user');
                            this.$router.push('/login');
                        } else {
                            this.$message.error(error);
                        }
                    } else {
                        this.tableList = data.content;
                        this.total = data.totalElements;
                        this.tableLoading = false;
                    }
                });
            },
            submit(){ //提交所选弹幕
                let paras = new FormData();
                paras.append("vpId", this.postsData.id);
                paras.append("barrageIds", this.multipleBarrageIds.join(','));
                axiosPost('postsBarrageAdd', paras).then((res) => {
                    let { error, status } = res;
                    if (status !== 0) {
                        if (status == 403) { //返回403时，重新登录
                            sessionStorage.removeItem('user');
                            this.$router.push('/login');
                        } else {
                            this.$message.error(error);
                        }
                    } else {
                        this.$message.success('增加弹幕成功');
                        //this.visible = false;
                    }
                });
            },
            handleTag(){ //加载弹幕标签
                axiosGet('barrageTag', '').then((res) => {
                    let { error, status,data } = res;
                    if (status !== 0) {
                        if (status == 403) { //返回403时，重新登录
                            sessionStorage.removeItem('user');
                            this.$router.push('/login');
                        } else {
                            this.$message.error(error);
                        }
                    } else {
                        this.tagList = data;
                    }
                });
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
                let para = new FormData();
                para.append("id", row.id);
                para.append("text", row.text);
                axiosPost('barrageEdit', para).then((res) => {
                    let { error, status } = res;
                    if (status !== 0) {
                        if (status == 403) { //返回403时，重新登录
                            sessionStorage.removeItem('user');
                            this.$router.push('/login');
                        }else{
                            this.$message.error(error);
                        }
                    }
                });
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
