<template>
    <el-dialog :title="title" :value="value" size="large" v-model="visible">
        <!--顶部工具条-->
        <el-col :span="24" class="toolbar" style="margin-top:-20px;">
            <el-form :inline="true" :model="filters">
                <el-form-item>
                    <el-select v-model="filters.isEssence" @change="fetchList" style="width: 110px;">
                        <el-option label="精华状态" value=""></el-option>
                        <el-option label="非精" value="0"></el-option>
                        <el-option label="精华" value="1"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-input type="number" v-model="filters.minLikeCount" min="0" max="5000" placeholder="最小赞数"
                              style="width: 100px;"></el-input>
                    <span> - </span>
                    <el-input type="number" v-model="filters.maxLikeCount" min="0" max="5000" placeholder="最大赞数"
                              style="width: 100px;"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="fetchList">查询</el-button>
                </el-form-item>
            </el-form>
        </el-col>
        <!--表格-->
        <el-table v-loading="tableLoading" :data="tableList" stripe border :max-height="tableHeight"
                  style="width: 100%;">
            <el-table-column prop="id" label="id" min-width="100" fixed></el-table-column>
            <el-table-column prop="coverUrl" label="封面(点击播放)" width="135">
                <template scope="scope">
                    <img @click="playVideo(scope.row)" v-if="scope.row.coverUrl !== ''"
                         style="width: 100%;cursor: pointer;" :src="scope.row.coverUrl" alt="视频封面"/>
                    <span @click="playVideo(scope.row)" v-else>封面为空</span>
                </template>
            </el-table-column>
            <el-table-column prop="username" label="发帖人" min-width="150"></el-table-column>
            <el-table-column prop="videoText" min-width="150" label="视频标题"></el-table-column>
            <el-table-column label="喜欢">
                <template scope="scope">
                    {{ scope.row.videoInfoPo == null ? '0' : scope.row.videoInfoPo.likeCount }}
                </template>
            </el-table-column>
            <el-table-column prop="createTime" label="发帖时间" min-width="180"></el-table-column>
            <!--<el-table-column prop="lastBarrageTime" label="最后弹幕时间" min-width="180">
                <template scope="scope">
                    {{ scope.row.lastBarrageTime ? scope.row.lastBarrageTime : '无' }}
                </template>
            </el-table-column>-->
            <el-table-column label="观看量">
                <template scope="scope">
                    {{ scope.row.videoInfoPo == null ? '0' : scope.row.videoInfoPo.viewCount }}
                </template>
            </el-table-column>
            <el-table-column label="观看人数" min-width="100">
                <template scope="scope">
                    {{ scope.row.videoInfoPo == null ? '0' : scope.row.videoInfoPo.viewUserCount }}
                </template>
            </el-table-column>
            <el-table-column label="弹幕数">
                <template scope="scope">
                    {{ scope.row.videoInfoPo == null ? '0' : scope.row.videoInfoPo.barrageCount }}
                </template>
            </el-table-column>
            <el-table-column label="来源">
                <template scope="scope">
                    {{ scope.row.publishType == 1 ? '后台' : '客户端' }}
                </template>
            </el-table-column>
            <el-table-column label="显示">
                <template scope="scope">
                    <el-tag :type="scope.row.isDel == 0 ? 'success' : 'danger'"
                            close-transition>{{ scope.row.isDel == 0 ? '是' : '否' }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column label="精华" width="80">
                <template scope="scope">
                    <el-tag :type="scope.row.isEssence == 1 ? 'success' : 'danger'"
                            close-transition>{{ scope.row.isEssence == 1 ? '是' : '否' }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column label="操作" width="310" fixed="right">
                <template scope="scope">
                    <el-button :type="scope.row.isEssence == 1 ? 'danger' : 'success'" size="small"
                               @click="handleEssence(scope.row)">
                        {{ scope.row.isEssence == 1 ? '取消精华' : '加精' }}
                    </el-button>
                    <el-button size="small" type="success" @click="handleLike(scope.row)">点赞</el-button>
                    <el-button type="info" size="small" @click="postsBarrage(scope.row)">加评论</el-button>
                    <el-button :type="scope.row.isDel == 0 ? 'danger' : 'warning'" size="small"
                               @click="postsDel(scope.row)">
                        {{ scope.row.isDel == 0 ? '删除' : '恢复' }}
                    </el-button>
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
    import {httpGet, httpPost} from '../../../api/api';

    export default {
        name: 'vVideo',
        props: ['value', 'topicData'],
        data() {
            return {
                filters: {
                    isEssence: '',
                    minLikeCount: '',
                    maxLikeCount: ''
                },
                title: '',
                visible: false, //默认隐藏
                total: 0, //表格列表数据总数
                page: 1, //当前页，默认为第一页
                tableLoading: true,
                tableList: [],
                videoVisible: false,  //播放视频界面 显示、隐藏
                videoHtml: '',
                tableHeight: '100%'
            }
        },
        computed: {
            detail() {
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
                let _self = this;
                _self.tableHeight = document.body.clientHeight * 0.8 - 57 - 32 - 60;
                let paras = {
                    offset: 0,
                    size: 10,
                    id: _self.topicData.id,
                    isEssence: _self.filters.isEssence,
                    minLikeCount: _self.filters.minLikeCount,
                    maxLikeCount: _self.filters.maxLikeCount
                };
                paras.offset = (_self.page - 1) * paras.size;
                _self.tableLoading = true;
                httpGet('topicVideoList', paras, _self, function (res) {
                    _self.tableLoading = false;
                    try {
                        let {error, status, data} = res;
                        _self.total = data.totalElements;
                        _self.tableList = data.content.map(function (item) { //格式化显示时间
                            item.createTime = util.timestampFormat(item.createTime);
                            if (item.lastBarrageTime) {
                                item.lastBarrageTime = util.timestampFormat(item.lastBarrageTime);
                            }
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
            playVideo(row) { //播放视频
                this.$emit('preview', row);
            },
            videoClose() {
                this.videoHtml = '';
            },
            handleLike(row) { //点赞
                this.$emit('like', row);
            },
            handleEssence(row) {
                let _self = this;
                let paras = new FormData();
                paras.append("id", row.id);
                paras.append("status", Number(!row.isEssence));
                _self.tableLoading = true;
                httpPost('postsEssence', paras, _self, function (res) {
                    _self.tableLoading = false;
                    try {
                        let {error, status, data} = res;
                        _self.$message.success('操作成功');
                        _self.fetchList();
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            postsBarrage(row) { //查看弹幕
                this.$emit('barrage', row);
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
                        let {error, status, data} = res;
                        _self.$message.success('操作成功');
                        _self.fetchList();
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            }
        },
        watch: {
            detail(val) { //监测详情变化
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
