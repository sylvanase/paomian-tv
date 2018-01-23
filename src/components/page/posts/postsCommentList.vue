<template>
    <el-dialog title="视频评论列表" size="large" :value="value" v-model="visible">
        <!--表格-->
        <el-table v-loading="tableLoading" class="tb-edit" :data="tableList" stripe border style="width: 100%;">
            <el-table-column prop="id" label="id" width="150"></el-table-column>
            <el-table-column prop="username" label="评论人" width="180"></el-table-column>
            <el-table-column prop="text" label="评论内容"></el-table-column>
            <el-table-column prop="createTime" label="评论时间" width="180"></el-table-column>
            <el-table-column prop="replyCount" label="被回复数" width="120"></el-table-column>
            <el-table-column prop="likeCount" label="被点赞数" width="120"></el-table-column>
            <el-table-column label="操作">
                <template scope="scope">
                    <el-button type="danger" size="small" @click="handleDel(scope.row)">删除</el-button>
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
    import { httpGet} from '../../../api/api';
    export default {
        name: 'vCommentList',
        props: ['value', 'postsData'],
        data() {
            return {
                visible: false, //默认隐藏
                tableLoading: false, //表格的loading符号
                tableList: [], //表格数据
                total: 0, //表格列表数据总数
                page: 1 //当前页，默认为第一页
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
                    id: _self.postsData.id
                };
                paras.offset = (_self.page - 1) * paras.size;
                _self.tableLoading = true;
                httpGet('postsCommentList', paras, _self, function (res) {
                    _self.tableLoading = false;
                    try {
                        let { error, status,data } = res;
                        _self.total = data.totalElements;
                        _self.tableList = data.content.map(function (item) { //格式化显示时间
                            if(item.createTime){
                                item.createTime = util.timestampFormat(item.createTime);
                            }
                            return item;
                        });
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            handleTableDel: function (row) {
                let _self = this;
                _self.$confirm('确认删除该评论吗?', '提示', {
                    type: 'warning'
                }).then(() => {
                    let paras = {
                        id: row.id
                    };
                    _self.tableLoading = true;
                    httpGet('commentRobotDel', paras, _self, function (res) {
                        _self.tableLoading = false;
                        try {
                            _self.$message.success('删除成功');
                            _self.fetchList();
                        } catch (error) {
                            util.jsErrNotify(error);
                        }
                    })
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

<style scoped>
table img{
    max-width: 100px;
    margin-top: 5px;
}
</style>
