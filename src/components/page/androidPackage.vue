<template>
    <section>
        <!--顶部工具条-->
        <el-col :span="24" class="toolbar" style="padding-bottom: 0;">
            <el-form :inline="true" :model="filters">
                <el-form-item>
                    <el-button type="primary" @click="showForm()">新增</el-button>
                </el-form-item>
            </el-form>
        </el-col>

        <!--表格-->
        <el-table v-loading="tableLoading" :data="tableList" stripe border style="width: 100%;">
            <el-table-column prop="id" label="id"></el-table-column>
            <el-table-column prop="createTime" label="创建时间" width="175"></el-table-column>
            <el-table-column prop="size" label="包大小" width="100"></el-table-column>
            <el-table-column label="包信息" min-width="350">
                <template scope="scope">
                    <div class="mb-10">
                        appId: {{ scope.row.appId }}
                    </div>
                    <div class="mb-10">
                        版本: {{ scope.row.version }}
                    </div>
                    <div class="mb-10">
                        版本号: {{ scope.row.versionCode }}
                    </div>
                    <div class="mb-10">
                        md5: {{ scope.row.md5 }}
                    </div>
                    <div>
                        更新日志: {{ scope.row.updateLog }}
                    </div>
                </template>
            </el-table-column>
            <el-table-column label="强制更新" width="100">
                <template scope="scope">
                    <el-tag :type="scope.row.isForce == 1 ? 'success' : 'danger'"
                            close-transition>{{ scope.row.isForce == 1 ? '是' : '否' }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column label="操作" width="150">
                <template scope="scope">
                    <el-button type="info" size="small" @click="downloadApk(scope.row)">下载</el-button>
                    <el-button :type="scope.row.status == 1 ? 'danger' : 'success'" size="small"
                               @click="handleApkStatus(scope.row)">
                        {{ scope.row.status == 1 ? '停用' : '启动' }}
                    </el-button>
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

        <!--新建/编辑-->
        <el-dialog title="上传安卓包" v-model="formVisible">
            <el-form :model="formData" label-width="80px" ref="formData">
                <el-form-item label="包文件">
                    <input type="file" name="file" id="apkFile"/>
                </el-form-item>
                <el-form-item label="强更">
                    <el-switch v-model="formData.force"></el-switch>
                </el-form-item>
                <el-form-item label="启动">
                    <el-switch v-model="formData.status"></el-switch>
                </el-form-item>
                <el-form-item label="更新日志" style="margin-bottom: -20px;">
                    <el-input type="textarea" v-model.trim="formData.des" auto-complete="off"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button size="small" @click.native="formVisible = false">取消</el-button>
                <el-button size="small" type="primary" @click.native="formSubmit" :loading="formLoading">提交</el-button>
            </div>
        </el-dialog>

    </section>
</template>

<script type="es6">
    import util from '../../api/util'
    import { httpGet, httpPost} from '../../api/api';

    export default {
        data() {
            return {
                total: 0, //表格列表数据总数
                page: 1, //当前页，默认为第一页
                tableLoading: false, //表格的loading符号
                tableList: [], //表格数据
                formVisible: false,//新增界面是否显示
                formLoading: false,
                formData: {
                    force: false,
                    status: false,
                    des: ''
                }
            }
        },
        methods: {
            handleCurrentChange(val) { //表格翻页
                this.page = val;
                this.fetchList();
            },
            fetchList() {    //获取列表
                let paras = {
                    offset: 0,
                    size: 10
                };
                let _self = this;
                paras.offset = (_self.page - 1) * paras.size;
                _self.tableLoading = true;
                httpGet('androidApkList', paras, _self, function (res) {
                    _self.tableLoading = false;
                    let { error, status,data } = res;
                    try {
                        _self.total = data.totalElements;
                        _self.tableList = data.content.map(function (item) { //格式化显示时间
                            item.size = util.fileSizeFormat(item.size);
                            if (item.createTime) {
                                item.createTime = util.timestampFormat(item.createTime);
                            }
                            return item;
                        });
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            handleApkStatus(row){ //启动、停止包
                let _self = this;
                let paras = new FormData();
                paras.append("id", row.id);
                paras.append("status", Number(!row.status));
                _self.tableLoading = true;
                httpPost('apkStatus', paras, _self, function (res) {
                    _self.tableLoading = false;
                    // let { error, status } = res;
                    try {
                        _self.$message.success('操作成功');
                        _self.fetchList();
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            downloadApk(row){ // 下载安装包
                window.open(row.apkUrl);
            },
            showForm (){
                this.formVisible = true;
                this.formLoading = false;
                let clearFile = document.getElementById('apkFile');
                if (clearFile) {
                    clearFile.outerHTML = clearFile.outerHTML;
                }
                this.formData = {
                    force: false,
                    status: false,
                    des: ''
                };
            },
            formSubmit(){ //提交表格
                let _self = this;
                let file = document.getElementById('apkFile').files.length;
                if (file == 0) {
                    _self.$message.warning('请选择安装包文件');
                    return;
                }
                _self.formLoading = true;
                let paras = new FormData();
                paras.append("desc", _self.formData.des);
                paras.append("force", Number(_self.formData.force));
                paras.append("status", Number(_self.formData.status));
                paras.append("apkFile", document.getElementById('apkFile').files[0]);
                httpPost('apkAdd', paras, _self, function (res) {
                    _self.formLoading = false;
                    // let { error, status } = res;
                    try {
                        _self.$message.success('提交成功');
                        _self.visible = false;
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

<style>
</style>
