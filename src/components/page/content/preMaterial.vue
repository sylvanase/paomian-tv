<template>
    <section>
        <!--顶部工具条-->
        <el-col :span="24" class="toolbar" style="padding-bottom: 0;">
            <el-form :inline="true" :model="filters">
                <el-form-item>
                    <el-input v-model="filters.kw" placeholder="ID/名称" icon="circle-close" :on-icon-click="resetSearch"
                              @keyup.enter.native="fetchList"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-select v-model="filters.type" @change="fetchList" placeholder="请选择" style="width: 150px;">
                        <el-option label="按片段搜" value="0"></el-option>
                        <el-option label="按电影搜" value="1"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="fetchList()">查询</el-button>
                </el-form-item>
            </el-form>
        </el-col>

        <!--表格-->
        <el-table v-loading="tableLoading" class="table-expand" :data="tableList" stripe border :max-height="tableHeight" style="width: 100%;">
            <el-table-column prop="id" label="id" width="100"></el-table-column>
            <el-table-column prop="name" label="片段名称"></el-table-column>
            <el-table-column prop="typeStr" label="片段类型" width="100">
            </el-table-column>
            <el-table-column label="相关电影">
                <template scope="scope">
                    {{ scope.row.movieNames.join(' , ') }}
                </template>
            </el-table-column>
            <el-table-column label="片段属性">
                <template scope="scope">
                    {{ scope.row.attributeNames.join(' , ') }}
                </template>
            </el-table-column>

            <el-table-column label="使用统计">
                <template scope="scope">
                    {{ scope.row.useCount }}次/{{ scope.row.userCount }}人
                </template>
            </el-table-column>
            <el-table-column label="操作" width="165">
                <template scope="scope">
                    <el-button size="small" @click="playVideo(scope.row)">预览</el-button>
                    <el-button type="danger" size="small" @click="cancelPre(scope.row)">取消前置</el-button>
                </template>
            </el-table-column>
        </el-table>

        <!--工具条-->
        <el-col :span="24" class="mt-10">
            <el-pagination style="float:right;" @current-change="handleCurrentChange"
                           :page-size="10" :current-page="page"
                           layout="total, prev, pager, next, jumper" :total="total">
            </el-pagination>
        </el-col>

        <!--播放弹窗-->
        <el-dialog title="剧本预览" v-model="videoVisible" @close="videoClose()">
            <div style="text-align: center;" v-html="videoHtml"></div>
        </el-dialog>
    </section>
</template>

<script type="es6">
    import util from '../../../api/util'
    import {httpGet, httpDel, httpPost} from '../../../api/api';

    export default {
        data() {
            return {
                filters: { //搜索筛选条件
                    type: '0',
                    kw: '',
                    id: ''
                },
                total: 0, //表格列表数据总数
                page: 1, //当前页，默认为第一页
                tableHeight: '100%',
                tableLoading: false, //表格的loading符号
                tableList: [], //表格数据
                videoVisible: false,  //播放视频界面 显示、隐藏
                videoHtml: ''
            }
        },
        methods: {
            handleCurrentChange(val) { //翻页
                this.page = val;
                this.fetchList();
            },
            fetchList() { //获取列表
                let _self = this;
                _self.tableHeight = document.getElementById('container').clientHeight - 77 - 42 - 15;
                let paras = {
                    type: _self.filters.type,
                    offset: 0,
                    size: 10,
                    id: '',
                    name: ''
                };
                if (isNaN(_self.filters.kw)) { //输入不为数字，值传入kw
                    paras.name = _self.filters.kw;
                } else {
                    paras.id = _self.filters.kw;
                }
                paras.offset = (_self.page - 1) * paras.size;
                _self.tableLoading = true;
                httpGet('contentPreMaterialList', paras, _self, function (res) {
                    _self.tableLoading = false;
                    try {
                        let {error, status, data} = res;
                        _self.total = data.totalElements;
                        _self.tableList = data.content.map(function (item) {
                            if (item.showType == 0) {
                                item.typeStr = '横竖屏';
                            } else if (item.showType == 1) {
                                item.typeStr = '横屏';
                            } else {
                                item.typeStr = '竖屏';
                            }
                            return item;
                        });
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            resetSearch() {
                this.filters.kw = '';
                this.fetchList();
            },
            playVideo(row) { //播放视频
                let _self = this;
                let _url = '';
                if(row.previewUrl == ''){
                    _self.$message.warning('本条数据视频链接为空');
                    return;
                }
                if (row.showType == 0 || row.showType == 2) { //横竖屏的播放竖屏资源
                    _url = row.vertVideoUrl;
                } else {
                    _url = row.horiVideoUrl;
                }
                this.videoVisible = true;
                this.videoHtml = '<video style="max-width: 100%;max-height:350px;" controls="controls" autoplay="autoplay">'
                    + '<source src="' + _url + '" type="video/mp4">对不起，您的浏览器不支持video标签，无法播放视频。</video>';
            },
            videoClose() {
                this.videoHtml = '';
            },
            // 取消前置
            cancelPre(row) {
                let _self = this;
                let para = {
                    operation: 0,
                    id: row.id
                };
                httpGet('contentPreMaterial', para, _self, function (res) {
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
        mounted() {
            this.fetchList();
        }
    }

</script>
