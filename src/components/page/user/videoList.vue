<template>
    <el-dialog title="用户发帖列表" :value="value" size="large" v-model="visible">
        <!--表格-->
        <el-table v-loading="tableLoading" :data="tableList" stripe border style="width: 100%;">
            <el-table-column prop="id" label="id" width="180" fixed></el-table-column>
            <el-table-column prop="coverUrl" label="封面(点击播放)" width="135">
                <template scope="scope">
                    <img @click="playVideo(scope.row)" v-if="scope.row.coverUrl !== ''" style="width: 100%;cursor: pointer;" :src="scope.row.coverUrl" alt="视频封面"/>
                    <span @click="playVideo(scope.row)" v-else>封面为空</span>
                </template>
            </el-table-column>
            <el-table-column prop="videoText" width="200" label="视频简介"></el-table-column>
            <el-table-column prop="createTime" label="发布时间" width="175"></el-table-column>
            <el-table-column label="观看" width="120">
                <template scope="scope">
                    {{ scope.row.videoInfoPo ? scope.row.videoInfoPo.viewCount : '0' }}次/{{ scope.row.videoInfoPo ? scope.row.videoInfoPo.viewUserCount : '0'}}人
                </template>
            </el-table-column>
            <el-table-column label="喜欢" width="120">
                <template scope="scope">
                    {{ scope.row.videoInfoPo ? scope.row.videoInfoPo.likeCount : '0' }}次/{{ scope.row.videoInfoPo ? scope.row.videoInfoPo.likeCount : '0'}}人
                </template>
            </el-table-column>
            <el-table-column label="弹幕" width="120">
                <template scope="scope">
                    {{ scope.row.videoInfoPo ? scope.row.videoInfoPo.barrageCount : '0' }}次/{{ scope.row.videoInfoPo ? scope.row.videoInfoPo.barrageUserCount : '0'}}人
                </template>
            </el-table-column>
            <el-table-column label="操作" width="180" fixed="right">
                <template scope="scope">
                    <div>
                        <el-button :type="scope.row.isEssence == 1 ? 'danger' : 'success'" size="small" @click="handleEssence(scope.row)">
                            {{ scope.row.isEssence == 1 ? '取精' : '加精' }}
                        </el-button>
                        <el-button size="small" type="success" @click="handleLike(scope.row)">100个赞</el-button>
                    </div>
                    <div class="mt-10">
                        <!--<el-button type="info" size="small" @click="highlight(scope.row)">评论</el-button>-->
                        <el-button type="info" size="small" @click="postsBarrage(scope.row)">加弹幕</el-button>
                        <el-button :type="scope.row.isDel == 0 ? 'danger' : 'warning'" size="small"
                                   @click="postsDel(scope.row)">
                            {{ scope.row.isDel == 0 ? '删除' : '恢复' }}
                        </el-button>
                    </div>
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
    import { httpGet, httpPost} from '../../../api/api';
    export default {
        name: 'vVideo',
        props: ['value', 'userId'],
        data() {
            return {
                visible: false, //默认隐藏
                total: 0, //表格列表数据总数
                page: 1, //当前页，默认为第一页
                tableLoading: true,
                tableList: []
            }
        },
        computed: {
            detail(){
                if(!this.value){ //不显示的时候不请求详细
                    return;
                }
                this.tableLoading = true;
                this.tableList = [];
                if (this.userId) {
                    this.fetchList();
                }
            }
        },
        methods: {
            change() {
                this.visible = false;
            },
            fetchList() {    //获取列表
                let _self = this;
                let paras = {
                    offset: 0,
                    size: 10,
                    uid: _self.userId
                };
                paras.offset = (_self.page - 1) * paras.size;
                _self.tableLoading = true;
                httpGet('userVideoList', paras, _self, function (res) {
                    _self.tableLoading = false;
                    try {
                        let { error, status,data } = res;
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
            handleCurrentChange(val) { //翻页
                this.page = val;
                this.fetchList();
            },
            handleLike(row){ //点赞
                let _self = this;
                let paras = new FormData();
                paras.append("vpId", row.id);
                paras.append("num", 100);
                httpPost('postsLike', paras, _self, function (res) {
                    _self.tableLoading = false;
                    try {
                        let { error, status,data } = res;
                        _self.$message.success(data);
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            handleEssence(row){
                let _self = this;
                let paras = new FormData();
                paras.append("id", row.id);
                paras.append("status", Number(!row.isEssence));
                _self.tableLoading = true;
                httpPost('postsEssence', paras, _self, function (res) {
                    _self.tableLoading = false;
                    try {
                        _self.$message.success('操作成功');
                        _self.fetchList();
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            postsBarrage(row){ //查看弹幕
                this.$emit('preview', row);
            },
            postsDel: function (row) { //软删除帖子
                let _self = this;
                let paras = new FormData();
                paras.append("id", row.id);
                paras.append("status", Number(!row.isDel));
                _self.tableLoading = true;
                httpPost('postsStatus', paras, _self, function (res) {
                    _self.tableLoading = false;
                    try {
                        _self.$message.success('操作成功');
                        _self.fetchList();
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            playVideo(row){ //播放视频
                this.$emit('audio', row);
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
