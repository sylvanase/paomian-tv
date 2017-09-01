<template>
    <el-dialog title="视频弹幕列表" size="large" :value="value" v-model="visible">
        <!--表格-->
        <el-table v-loading="tableLoading" class="tb-edit" :data="tableList" stripe border style="width: 100%;">
            <el-table-column prop="id" label="id" width="150"></el-table-column>
            <el-table-column prop="username" label="发送人" width="180">
            </el-table-column>
            <el-table-column prop="createTime" label="创建时间" width="180">
            </el-table-column>
            <el-table-column prop="text" label="弹幕内容">
                <template scope="scope">
                    <div v-html="scope.row.text"></div>
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
    import { axiosGet} from '../../../api/api';
    export default {
        name: 'vBarrageList',
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
                let para = {
                    offset: 0,
                    size: 10,
                    id: this.postsData.id
                };
                para.offset = (this.page - 1) * para.size;
                this.tableLoading = true;
                axiosGet('postsBarrageList', para).then((res) => {
                    let { error, status,data } = res;
                    if (status !== 0) {
                        if (status == 403) { //返回403时，重新登录
                            sessionStorage.removeItem('user');
                            this.$router.push('/login');
                        } else {
                            this.$message.error(error);
                        }
                    } else {
                        this.total = data.totalElements;
                        this.tableList = data.content.map(function (item) { //格式化显示时间
                            if(item.createTime){
                                item.createTime = util.timestampFormat(item.createTime);
                            }
                            item.text = item.text.replace(/http:\/\/([^\s]*).gif/g,'<img src="http://$1.gif">');
                            item.text = item.text.replace(/http:\/\/([^\s]*).jpg/g,'<img src="http://$1.jpg">');
                            item.text = item.text.replace(/http:\/\/([^\s]*).png/g,'<img src="http://$1.png">');
                            item.text = item.text.replace(/http:\/\/([^\s]*).jpeg/g,'<img src="http://$1.jpeg">');
                            return item;
                        });
                        this.tableLoading = false;
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
table img{
    max-width: 100px;
    margin-top: 5px;
}
</style>
