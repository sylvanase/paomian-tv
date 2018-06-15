<template>
    <el-dialog title="评论库列表" :value="value" v-model="visible" @close="resetFormData">
        <!--表格-->
        <el-table v-loading="tableLoading" class="tb-edit" :data="tableList" stripe border style="width: 100%;">
            <el-table-column prop="id" label="id" width="80"></el-table-column>
            <el-table-column prop="text" label="评论内容"></el-table-column>
            <el-table-column prop="createTime" label="创建时间" width="180"></el-table-column>
            <el-table-column label="操作">
                <template scope="scope">
                    <el-button size="small" @click="editComment(scope.row)">编辑</el-button>
                    <el-button type="danger" size="small" @click="handleDel(scope.row)">删除</el-button>
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
        <div class="mt-10">
            <el-form :model="formData" label-width="80px" :rules="formRules" ref="formData"
                     style="margin-bottom: -20px;">
                <el-form-item label="评论内容" prop="text">
                    <el-input type="textarea" :rows="2" maxlength="128" placeholder="请输入评论内容"
                              v-model="formData.text"></el-input>
                </el-form-item>
                <el-form-item style="margin-bottom: 0;">
                    <el-button size="small" @click.native="cleanComment">清空</el-button>
                    <el-button size="small" type="primary" @click.native="addComment" :loading="formLoading">提交
                    </el-button>
                    <span class="el-upload__tip" style="line-height: 20px;">{{ tips }}</span>
                </el-form-item>
            </el-form>

        </div>
    </el-dialog>
</template>

<script type="es6">
    import util from '../../../api/util'
    import {httpGet, httpPost} from '../../../api/api';

    export default {
        name: 'vCommentAdd',
        props: ['value', 'typeData', 'type'],
        data() {
            return {
                visible: false, //默认隐藏
                showLoading: false,
                tableLoading: false, //表格的loading符号
                tableList: [], //表格数据
                filters: { //搜索筛选条件
                    type: '1',
                    kw: ''
                },
                total: 0, //表格列表数据总数
                page: 1, //当前页，默认为第一页
                formData: { // 为父级增加评论
                    id: '',
                    playIds: [],
                    materialIds: [],
                    musicIds: [],
                    text: ''
                },
                formRules: {
                    text: [
                        {required: true, message: '请输入评论内容', trigger: 'blur'},
                        {min: 1, max: 128, message: '长度在 1 到 128 个字符', trigger: 'blur'}
                    ]
                },
                formLoading: false,
                tips: ''
            }
        },
        computed: {
            detail() { //返回详情
                let _self = this;
                if (!_self.value) { //不显示的时候不请求详细
                    return;
                }
                _self.tableLoading = true;
                if (_self.type == '2') { // 2为剧本
                    _self.formData.playIds.push(_self.typeData.id);
                } else if (_self.type == '3') { // 3是片段
                    _self.formData.materialIds.push(_self.typeData.id);
                } else if (_self.type == '4') { // 4是音乐
                    _self.formData.musicIds.push(_self.typeData.id);
                }
                _self.fetchList();
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
            fetchList() {    //获取评论库列表
                let _self = this;
                let paras = new FormData();
                paras.append('size', 10);
                paras.append('offset', (_self.page - 1) * 10);
                paras.append('id', _self.typeData.id);
                paras.append('searchType', _self.type);
                _self.tableLoading = true;
                httpPost('commentListSearch', paras, _self, function (res) {
                    _self.tableLoading = false;
                    try {
                        let {data} = res;
                        _self.tableList = data.content.map(function (item) {
                            item.createTime = util.timestampFormat(item.createTime);
                            return item;
                        });
                        _self.total = data.totalElements;
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            addComment() {  // 新增评论
                let _self = this;
                let _api = 'commentAdd';
                _self.$refs['formData'].validate((valid) => {
                    if (valid) {
                        let paras = new FormData();
                        paras.append("text", _self.formData.text);
                        paras.append("playIds", _self.formData.playIds);
                        paras.append("materialIds", _self.formData.materialIds);
                        paras.append("musicIds", _self.formData.musicIds);
                        if (_self.formData.id) {
                            paras.append("id", _self.formData.id);
                            _api = 'commentEdit';
                        }
                        _self.formLoading = true;
                        httpPost(_api, paras, _self, function (res) {
                            _self.formLoading = false;
                            try {
                                _self.$message.success('提交成功');
                                _self.$refs['formData'].resetFields();
                                _self.cleanComment();
                                _self.fetchList();
                            } catch (error) {
                                util.jsErrNotify(error);
                            }
                        })
                    } else {
                        return false;
                    }
                });
            },
            editComment(row) { // 指定编辑的评论
                this.formData.id = row.id;
                this.formData.text = row.text;
                this.tips = '（正在编辑id为' + row.id + '的评论内容，取消编辑请点击"清空"）';
            },
            resetFormData() { //关闭表格弹窗，重置表格数据
                this.formData = {
                    id: '', // 评论的id
                    playIds: [],
                    materialIds: [],
                    musicIds: [],
                    text: ''
                };
                this.tips = '';
                this.$refs['formData'].resetFields();
            },
            cleanComment() { //清空评论内容
                this.formData.id = '';
                this.formData.text = '';
                this.tips = '';
            },
            handleDel(row) { //删除评论
                let _self = this;
                _self.$confirm('确认删除该评论吗?', '提示', {
                    type: 'warning'
                }).then(() => {
                    let paras = {
                        id: row.id
                    };
                    httpGet('commentListDel', paras, _self, function (res) {
                        try {
                            _self.$message.success('删除成功');
                            _self.cleanComment();
                            _self.fetchList();
                        } catch (error) {
                            util.jsErrNotify(error);
                        }
                    })
                });
            }
        },
        watch: {
            detail(val) { //监测详情变化
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
    .tb-edit .el-input {
        display: none
    }

    .tb-edit .current-row .el-input {
        display: block
    }

    .tb-edit .current-row .el-input + span {
        display: none
    }
</style>
