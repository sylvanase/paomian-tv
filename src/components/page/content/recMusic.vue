<template>
    <section>
        <!--顶部工具条-->
        <el-col :span="24" class="toolbar">
            <el-form :inline="true" :model="filters">
                <el-form-item>
                    <el-input v-model="filters.kw" placeholder="ID/名称" icon="circle-close" :on-icon-click="resetSearch"
                              @keyup.enter.native="fetchList"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-select v-model="filters.type" @change="fetchList" placeholder="请选择" style="width: 150px;">
                        <el-option label="按音乐搜" value="0"></el-option>
                        <el-option label="按电影搜" value="1"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="fetchList()">查询</el-button>
                </el-form-item>
            </el-form>
        </el-col>

        <!--表格-->
        <el-table v-loading="tableLoading" class="table-expand" :data="tableList" stripe border :max-height="tableHeight"
                  style="width: 100%;">
            <el-table-column prop="id" label="id" width="100"></el-table-column>
            <el-table-column prop="musicName" label="音乐名称"></el-table-column>
            <el-table-column prop="duration" label="时长" width="130"></el-table-column>
            <el-table-column prop="musicAttrs" label="属性">
                <template scope="scope">
                    {{ scope.row.musicAttrs.join(' , ') }}
                </template>
            </el-table-column>
            <el-table-column prop="movieNames" label="相关电影">
                <template scope="scope">
                    {{ scope.row.movieNames.join(' , ') }}
                </template>
            </el-table-column>
            <el-table-column label="使用统计">
                <template scope="scope">
                    {{ scope.row.useCount }}次/{{ scope.row.userCount }}人
                </template>
            </el-table-column>
            <el-table-column label="操作" width="165">
                <template scope="scope">
                    <el-button size="small" @click="playMusic(scope.row)">预览</el-button>
                    <el-button type="danger" size="small" @click="cancelRec(scope.row)">取消推荐</el-button>
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
        <el-dialog :title="musicTitle" v-model="musicVisible" @close="musicClose()">
            <div style="text-align: center;" v-html="musicHtml"></div>
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
                    status: '1',
                    kw: '',
                    id: ''
                },
                total: 0, //表格列表数据总数
                page: 1, //当前页，默认为第一页
                tableHeight: '100%',
                tableLoading: false, //表格的loading符号
                tableList: [], //表格数据
                musicTitle: '音乐播放',
                musicVisible: false,  //播放音乐界面 显示、隐藏
                musicHtml: '',
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
                let paras = new FormData();
                paras.append('size', 10);
                paras.append('offset', (_self.page - 1) * 10);
                if (isNaN(_self.filters.kw)) { //输入不为数字，值传入kw
                    if (_self.filters.type == 0) { // 0为按音乐搜索
                        paras.append('musicName', _self.filters.kw);
                    } else {
                        paras.append('movieName', _self.filters.kw);
                    }
                } else {
                    paras.append('id', _self.filters.kw);
                }
                _self.tableLoading = true;
                httpPost('contentRecMusicList', paras, _self, function (res) {
                    _self.tableLoading = false;
                    try {
                        let {error, status, data} = res;
                        _self.total = data.totalElements;
                        _self.tableList = data.content.map(function (item) {
                            item.duration = util.fileDuration(item.duration);
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
            playMusic(row) { //播放音乐
                this.musicVisible = true;
                this.musicTitle = row.musicName;
                this.musicHtml = '<audio controls="controls" src="' + row.previewUrl + '" autoplay="autoplay" preload="auto"></audio>';
            },
            musicClose() {
                this.musicHtml = '';
            },
            // 取消推荐
            cancelRec(row) {
                let _self = this;
                let para = {
                    operation: 0,
                    id: row.id
                };
                httpGet('contentMusicRec', para, _self, function (res) {
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
