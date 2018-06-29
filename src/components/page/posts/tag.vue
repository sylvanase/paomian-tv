<template>
    <section>
        <!--顶部工具条-->
        <el-col :span="24" class="toolbar" style="padding-bottom: 0;">
            <el-form :inline="true">
                <el-form-item>
                    <el-input v-model="filters.kw" placeholder="ID/关键字" icon="circle-close"
                              :on-icon-click="resetSearch" @keyup.enter.native="fetchList"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="fetchList()">查询</el-button>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="showForm(1)">新增分类</el-button>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="showForm(2)">新增二级标签</el-button>
                </el-form-item>
            </el-form>
        </el-col>

        <!--表格-->
        <el-table v-loading="tableLoading" :data="tableList" stripe border :max-height="tableHeight" style="width: 100%;">
            <el-table-column prop="firstTag" label="一级标签"></el-table-column>
            <el-table-column prop="tag" label="二级标签"></el-table-column>
            <el-table-column prop="thirdTag" label="三级标签"></el-table-column>
            <el-table-column label="操作">
                <template scope="scope">
                    <el-button size="small" @click="showForm(3, scope.row)">新增三级标签</el-button>
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

        <!--新建标签-->
        <el-dialog :title="formTitle" v-model="formVisible" @close="resetForm()"> 
            <el-form :model="formData" label-width="80px" :rules="formRules" ref="formData" style="margin-bottom: -20px;">
                <!--  二级标签需要加载一级标签下拉框 -->
                <el-form-item v-if="formData.level == 2" label="分类绑定" prop="parentId">
                    <el-select v-model="formData.parentId" placeholder="请选择">
                        <el-option v-for="item in level1List" :key="item.id" :label="item.tag" :value="item.id">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item :label="formData.label" prop="tag">
                    <el-input v-model.trim="formData.tag" placeholder="请输入标签名称" auto-complete="off"></el-input>
                    <div v-if="formData.level == 3">(多个三级标签请使用中文逗号“，”隔开)</div>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button size="small" @click.native="formVisible = false">取消</el-button>
                <el-button size="small" type="primary" @click.native="formSubmit()" :loading="formLoading">提交</el-button>
            </div>
        </el-dialog>
    </section>
</template>

<script type="es6">
    import util from '../../../api/util'
    import { httpGet, httpPost} from '../../../api/api';

    export default {
        data() {
            return {
                filters:{
                    kw: ''
                },
                total: 0, //表格列表数据总数
                page: 1, //当前页，默认为第一页
                tableHeight: '100%',
                tableLoading: false, //表格的loading符号
                tableList: [], //表格数据
                formTitle: '新增分类', // 默认增加的是一级标签
                formVisible: false,//新增界面是否显示
                formLoading: false,
                formRules: {
                    parent: [
                        {required: true, message: '请选择需要绑定的分类', trigger: 'change', type: 'number'}
                    ],
                    tag: [
                        {required: true, message: '标签名称不能为空', trigger: 'blur'}
                    ]
                },
                formData: {
                    parentId: 0,
                    tag: '',
                    level: 1, // 默认是一级
                    label: '一级标签',
                    tip: '请输入标签名称'
                },
                level1List: []
            }
        },
        methods: {
            handleCurrentChange(val) { //翻页
                this.page = val;
                this.fetchList();
            },
            resetSearch() {
                this.filters.kw = '';
                this.fetchList();
            },
            //获取列表
            fetchList() {
                let _self = this;
                _self.tableHeight = document.getElementById('container').clientHeight - 77 - 42 - 15;
                let para = {
                    offset: 0,
                    size: 10,
                    id: '',
                    kw: ''
                };
                if (isNaN(_self.filters.kw)) { //输入不为数字，值传入kw
                    para.kw = _self.filters.kw;
                } else {
                    para.id = _self.filters.kw;
                }
                para.offset = (_self.page - 1) * para.size;
                _self.tableLoading = true;
                httpGet('postsTagList', para, _self, function (res) {
                    _self.tableLoading = false;
                    try {
                        let { error, status, data } = res;
                        _self.total = data.totalElements;
                        _self.tableList = data.content;
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            showForm (level, row){ // 显示对应级别的标签表单
                this.formVisible = true;
                this.formData.level = level;
                if(level == 2){ 
                    this.fetchLevel1List();
                    this.formTitle = '添加二级标签';
                    this.formData.parentId = '';
                    this.formData.label = '二级标签';
                } else if(level == 3){
                    this.formTitle = '添加三级标签';
                    this.formData.parentId = row.id;
                    this.formData.label = '三级标签';
                } 
            },
            formSubmit(){ // 提交一级标签表格
                let _self = this;
                console.log(_self.formData.parentId);
                _self.$refs.formData.validate((valid) => {
                    if (valid) {
                        let paras = new FormData();
                        paras.append("level", _self.formData.level);
                        paras.append("parentId", _self.formData.parentId);
                        if(_self.formData.level != 3){
                            paras.append("tag", _self.formData.tag);
                        } else{
                            let arr = _self.formData.tag.split('，');
                            paras.append("tags", arr);
                        }
                        _self.formLoading = true;
                        httpPost('postsTagAdd', paras, _self, function (res) {
                            _self.formLoading = false;
                            try {
                                let { error, status,data } = res;
                                _self.$message.success('提交成功');
                                _self.$refs.formData.resetFields();
                                _self.formVisible = false;
                                _self.fetchList();
                            } catch (error) {
                                util.jsErrNotify(error);
                            }
                        })
                    }
                });
            },
            resetForm(level){
                let _self = this;
                _self.formTitle = '新增分类';
                _self.formData = {
                    parentId: 0,
                    tag: '',
                    level: 1, // 默认是一级
                    label: '一级标签',
                    tip: '请输入标签名称'
                };
                _self.$refs.formData.resetFields();
            },
            fetchLevel1List(){
                let _self = this;
                httpGet('postsTagLevelList', { level: 1 }, _self, function (res) {
                    let { data } = res;
                    _self.level1List = data;
                })
            }
        },
        mounted() {
            this.fetchList();
        }
    }

</script>
