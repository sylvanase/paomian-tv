<template>
    <el-dialog :title="title" :value="value" size="large" v-model="visible">
        <!--表格-->
        <el-table v-loading="tableLoading" :data="tableList" stripe border style="width: 100%;">
            <el-table-column prop="id" label="id" min-width="100" fixed></el-table-column>
            <el-table-column prop="username" label="发帖人" min-width="150"></el-table-column>
            <el-table-column prop="videoText" min-width="150" label="视频标题"></el-table-column>
            <el-table-column label="内容">
                <template scope="scope">
                    <el-button size="small" @click="playVideo(scope.row)">播放</el-button>
                </template>
            </el-table-column>
            <el-table-column prop="createTime" label="发帖时间" min-width="180"></el-table-column>
            <el-table-column label="精华" width="80">
                <template scope="scope">
                    <el-tag :type="scope.row.isEssence === 1 ? 'success' : 'danger'"
                            close-transition>{{ scope.row.isEssence === 1 ? 'Yes！' : 'No' }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column label="操作" width="300" fixed="right">
                <template scope="scope">
                    <el-button type="info" size="small" @click="highlight(scope.row)">加精</el-button>
                    <!--<el-button type="info" size="small" @click="highlight(scope.row)">评论</el-button>-->
                    <!--<el-button type="info" size="small" @click="highlight(scope.row)">弹幕</el-button>-->
                    <!--<el-button type="info" size="small" @click="highlight(scope.row)">加10个喜欢</el-button>-->
                    <!--<el-button type="danger" size="small" @click="highlight(scope.row)">隐藏</el-button>-->
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

    </el-dialog>
</template>

<script type="es6">
    import util from '../../../api/util'
    import { axiosGet, axiosDel} from '../../../api/api';
    export default {
        name: 'vVideo',
        props: ['value', 'topicData'],
        data() {
            return {
                title: '',
                visible: false, //默认隐藏
                total: 0, //表格列表数据总数
                page: 1, //当前页，默认为第一页
                tableLoading: true,
                tableList: [],
                videoVisible: false,  //播放视频界面 显示、隐藏
                videoHtml: ''
            }
        },
        computed: {
            detail(){
                this.tableLoading = true;
                this.tableList = [];
                this.title = "话题：'" + this.topicData.name + "'的视频列表";
                if (this.topicData.id) {
                    this.fetchList();
                }
            }
        },
        methods: {
            change() {
                this.visible = false;
            },
            fetchList() {    //获取列表
                let para = {
                    offset: 0,
                    size: 10,
                    id: this.topicData.id
                };
                para.offset = (this.page - 1) * para.size;
                this.tableLoading = true;
                axiosGet('topicVideoList', para).then((res) => {
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
                            item.createTime = util.timestampFormat(item.createTime);
                            return item;
                        });
                        this.tableLoading = false;
                    }
                });
            },
            handleCurrentChange(val) { //翻页
                this.page = val;
                this.fetchList();
            },
            highlight(row){ //加精
                this.$message.error('功能尚未开发');
            },
            playVideo(row){ //播放视频
                this.$emit('preview', row);
            },
            videoClose(){
                this.videoHtml = '';
            }
        },
        watch: {
            detail(val){ //监测详情变化
                console.log(val);
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
