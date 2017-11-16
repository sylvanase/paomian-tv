<template>
    <section>
        <!--顶部工具条-->
        <el-col :span="24" class="toolbar" style="padding-bottom: 0;">
            <el-form :inline="true" :model="filters">
                <el-form-item>
                    <el-select v-model="filters.type" @change="fetchList" placeholder="请选择" style="width: 150px;">
                        <el-option label="音乐属性" value="0"></el-option>
                        <el-option label="片段属性" value="1"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-select v-model="filters.status" @change="fetchList" placeholder="请选择" style="width: 100px;">
                        <el-option label="全部" value=""></el-option>
                        <el-option label="在线" value="1"></el-option>
                        <el-option label="离线" value="0"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="showForm('-1')">新增</el-button>
                </el-form-item>
            </el-form>
        </el-col>

        <!--表格-->
        <el-table v-loading="tableLoading" :data="tableList" stripe border style="width: 100%;">
            <el-table-column prop="id" label="id" width="100"></el-table-column>
            <el-table-column prop="name" label="属性名称"></el-table-column>
            <el-table-column prop="countNum" label="数量"></el-table-column>
            <el-table-column prop="status" label="状态" width="80">
                <template scope="scope">
                    <el-tag :type="scope.row.status == 1 ? 'success' : 'danger'"
                            close-transition>{{ scope.row.status == 1 ? '在线' : '离线' }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column label="操作" width="380">
                <template scope="scope">
                    <el-button size="small" @click="showForm(scope.row)">编辑</el-button>
                    <el-button type="danger" size="small" @click="handleTableDel(scope.$index, scope.row)">删除
                    </el-button>
                    <el-button :type="scope.row.status == 1 ? 'danger' : 'success'" size="small"
                               @click="handleTableLine(scope.$index, scope.row)">
                        {{ scope.row.status == 1 ? '下线' : '上线' }}
                    </el-button>
                    <template v-if="scope.row.status == 1">
                        <el-button type="success" size="small" @click="handleTableShift(scope.row,'up')">
                            上移
                        </el-button>
                        <el-button type="danger" size="small" @click="handleTableShift(scope.row,'down')">
                            下移
                        </el-button>
                        <el-button type="warning" size="small" @click="handleTableShift(scope.row,'top')">
                            置顶
                        </el-button>
                    </template>
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

        <!--属性编辑-->
        <v-detail :attrData="attrData" v-model="isShowForm" v-on:refresh="fetchList"></v-detail>

    </section>
</template>

<script type="es6">
    import util from '../../../api/util'
    import { httpGet, httpDel, httpPost } from '../../../api/api'
    import vDetail from './attrDetail.vue'

    export default {
        components: {
            vDetail
        },
        data() {
            return {
                filters: { //列表筛选条件
                    type: '0',
                    status: ''
                },
                total: 0, //表格列表数据总数
                page: 1, //当前页，默认为第一页
                tableLoading: false, //表格的loading符号
                tableList: [], //表格数据
                isShowForm: false, //显示、隐藏编辑页
                attrData: {}
            }
        },
        methods: {
            handleCurrentChange(val) { //翻页
                this.page = val;
                this.fetchList();
            },
            //获取列表
            fetchList() {
                let _self = this;
                let paras = {
                    offset: 0,
                    size: 10,
                    type: _self.filters.type,
                    status: _self.filters.status
                };
                paras.offset = (_self.page - 1) * paras.size;
                _self.tableLoading = true;
                httpGet('contentAttrList', paras, _self, function (res) {
                    _self.tableLoading = false;
                    try {
                        let { error, status,data } = res;
                        _self.total = data.totalElements;
                        _self.tableList = data.content;
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            showForm (row){ //显示表单
                this.isShowForm = true;
                this.attrData = row;
            },
            //删除表格数据
            handleTableDel: function (index, row) {
                this.$confirm('确认删除该记录吗?', '提示', {
                    type: 'warning'
                }).then(() => {
                    let _self = this;
                    let paras = {id: row.id, type: row.attributeTypeEnum};
                    _self.tableLoading = true;
                    httpDel('contentAttrDel', paras, _self, function (res) {
                        _self.tableLoading = false;
                        try {
                            let { error, status,data } = res;
                            _self.$message.success('删除成功');
                            _self.fetchList();
                        } catch (error) {
                            util.jsErrNotify(error);
                        }
                    })
                });
            },
            handleTableLine(index, row){
                let _self = this;
                let paras = new FormData();
                paras.append("id", row.id);
                paras.append("status", Number(!row.status));
                paras.append("type", row.attributeTypeEnum);
                httpPost('contentAttrStatus', paras, _self, function (res) {
                    try {
                        _self.$message.success('操作成功');
                        _self.fetchList();
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            handleTableShift(row, operate){
                let _self = this;
                let paras = new FormData();
                paras.append("id", row.id);
                paras.append("operate", operate);
                paras.append("type", row.attributeTypeEnum);
                paras.append("currRank", row.priority);
                httpPost('contentAttrShift', paras, _self, function (res) {
                    try {
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
