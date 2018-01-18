<template>
    <section>
        <!--顶部工具条-->
        <el-col :span="24" class="toolbar" style="padding-bottom: 0;">
            <el-form :inline="true">
                <el-form-item>
                    <el-button type="primary" @click="showForm()">新增</el-button>
                </el-form-item>
            </el-form>
        </el-col>

        <!--表格-->
        <el-table v-loading="tableLoading" :data="tableList" stripe border :max-height="tableHeight" style="width: 100%;">
            <el-table-column prop="id" label="id" width="100"></el-table-column>
            <el-table-column prop="url" label="图片" width="200">
                <template scope="scope">
                    <img v-if="scope.row.url != ''" style="width: 100%;vertical-align:middle;margin:10px auto;" :src="scope.row.url" alt=""/>
                </template>
            </el-table-column>
            <el-table-column prop="url" label="url"></el-table-column>
            <el-table-column prop="createTime" label="上传时间" width="180"></el-table-column>
        </el-table>

        <!--工具条-->
        <el-col :span="24" class="mt-10">
            <el-pagination style="float:right;" @current-change="handleCurrentChange"
                           :page-size="10" :current-page="page"
                           layout="total, prev, pager, next, jumper" :total="total">
            </el-pagination>
        </el-col>

        <!--资源新增-->
        <el-dialog title="上传图片" v-model="formVisible" @close="resetFormData">
            <el-form :model="formData" label-width="80px" style="margin-bottom: -20px;">
                <el-form-item label="图片文件" prop="name" required>
                    <input type="file" name="file" id="imgFile"/>
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
    import util from '../../../api/util'
    import {httpGet, httpPost} from '../../../api/api';

    export default {
        data() {
            return {
                total: 0, //表格列表数据总数
                page: 1, //当前页，默认为第一页
                tableHeight: '100%',
                tableLoading: false, //表格的loading符号
                tableList: [], //表格数据
                formVisible: false,//显示、隐藏编辑页
                formLoading: false
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
                _self.tableHeight = document.getElementById('container').clientHeight - 77 - 42 - 15;
                let paras = {
                    offset: 0,
                    size: 10
                };
                paras.offset = (_self.page - 1) * paras.size;
                _self.tableLoading = true;
                httpGet('contentImgSourceList', paras, _self, function (res) {
                    _self.tableLoading = false;
                    try {
                        let {error, status, data} = res;
                        _self.total = data.totalElements;
                        _self.tableList = data.content.map(function (item) {
                            item.createTime = util.timestampFormat(item.createTime);
                            return item;
                        });
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            showForm() {
                this.formVisible = true;
            },
            formSubmit() { //提交表单
                let _self = this;
                let imgFile = document.getElementById('imgFile');
                let paras = new FormData();
                if (imgFile.files.length == 0) {
                    _self.$message.warning('请选择图片文件');
                    return;
                }
                paras.append("image", imgFile.files[0]);
                _self.formLoading = true;
                httpPost('contentImgSourceAdd', paras, _self, function (res) {
                    _self.formLoading = false;
                    try {
                        _self.$message.success('提交成功');
                        _self.formVisible = false;
                        _self.fetchList();
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            resetFormData() {
                let _self = this;
                _self.formLoading = false;
                document.getElementById('imgFile').value = '';
            }
        },
        mounted() {
            this.fetchList();
        }
    }

</script>
