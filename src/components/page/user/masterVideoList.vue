<template>
    <el-dialog :title="title" :value="value" size="large" v-model="visible">
        <!--表格-->
        <el-table v-loading="tableLoading" :data="tableList" stripe border style="width: 100%;">
            <el-table-column prop="uid" label="小号id"></el-table-column>
            <el-table-column prop="id" label="帖子id"></el-table-column>
            <el-table-column prop="coverUrl" label="封面(点击播放)" width="135">
                <template scope="scope">
                    <img @click="playVideo(scope.row)" v-if="scope.row.coverUrl !== ''" style="width: 100%;cursor: pointer;" :src="scope.row.coverUrl" alt="视频封面"/>
                    <span @click="playVideo(scope.row)" v-else>封面为空</span>
                </template>
            </el-table-column>
            <el-table-column prop="videoText" min-width="150" label="视频标题"></el-table-column>
            <el-table-column prop="createTime" label="发帖时间" min-width="180"></el-table-column>
            <el-table-column label="弹幕数">
                <template scope="scope">
                    {{ scope.row.videoInfoPo == null ? '0' : scope.row.videoInfoPo.barrageCount }}
                </template>
            </el-table-column>
            <el-table-column label="赞数">
                <template scope="scope">
                    {{ scope.row.videoInfoPo == null ? '0' : scope.row.videoInfoPo.likeCount }}
                </template>
            </el-table-column>
        </el-table>
        <!--分页-->
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
        name: 'vVideo',
        props: ['value', 'masterData'],
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
                this.title = "小号视频列表，主账号id：'" + this.masterData.uid + '，昵称：' + this.masterData.userName;
                if (this.visible) {
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
                    masterUid: this.masterData.uid
                };
                para.offset = (this.page - 1) * para.size;
                this.tableLoading = true;
                axiosGet('userMasterVideo', para).then((res) => {
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
            playVideo(row){ //播放视频
                this.$emit('preview', row);
            },
            videoClose(){
                this.videoHtml = '';
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
