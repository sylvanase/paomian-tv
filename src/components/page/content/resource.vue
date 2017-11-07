<template>
    <section>
        <!--顶部工具条-->
        <el-col :span="24" class="toolbar" style="padding-bottom: 0;">
            <el-form :inline="true" :model="filters">
                <el-form-item>
                    <el-input v-model="filters.kw" placeholder="ID/名称"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="fetchList">查询</el-button>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="showForm('-1')">新增</el-button>
                </el-form-item>
            </el-form>
        </el-col>

        <!--表格-->
        <el-table v-loading="tableLoading" :data="tableList" stripe border style="width: 100%;">
            <el-table-column prop="id" label="id" width="100"></el-table-column>
            <el-table-column prop="name" label="资源名称"></el-table-column>
            <el-table-column prop="size" label="文件大小" width="150"></el-table-column>
            <el-table-column prop="duration" label="时长" width="150"></el-table-column>
            <el-table-column label="封面" width="150">
                <template scope="scope">
                    <el-button size="small" @click="previewCover(scope.row, 0)">静态</el-button>
                    <el-button type="info" size="small" @click="previewCover(scope.row, 1)">动态
                    </el-button>
                </template>
            </el-table-column>
            <el-table-column label="操作" width="200">
                <template scope="scope">
                    <el-button type="info" size="small" @click="playVideo(scope.$index, scope.row)">播放</el-button>
                    <el-button size="small" @click="showForm(scope.$index, scope.row)">编辑</el-button>
                    <el-button type="danger" size="small" @click="handleTableDel(scope.$index, scope.row)">删除
                    </el-button>
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

        <!--新建/编辑-->
        <el-dialog :title="formTitle" v-model="formVisible" @close="closeForm()">
            <el-form :model="formData" label-width="80px" :rules="formRules" ref="formData">
                <el-form-item label="资源名称" prop="name">
                    <el-input v-model.trim="formData.name" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="视频文件" prop="videoObj" required style="margin-bottom: -20px;">
                    <input type="file" name="file" id="videoFile" @change="changeFile"/>
                    <el-button style="margin-left: 10px;" size="small" type="success" @click="submitUploadKs">上传到服务器
                    </el-button>
                    <el-progress style="width: 70%;" :percentage="fileUpload.percentage"></el-progress>
                    <div>(编辑状态若未选择新视频上传，视为使用原视频文件)</div>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button size="small" @click.native="formVisible = false">取消</el-button>
                <el-button size="small" type="primary" @click.native="formSubmit" :loading="formLoading">提交</el-button>
            </div>
        </el-dialog>

        <!--播放弹窗-->
        <el-dialog title="视频播放" v-model="videoVisible" @close="videoClose()">
            <div style="text-align: center;" v-html="videoHtml"></div>
        </el-dialog>
        <!--预览封面-->
        <el-dialog title="封面预览" v-model="coverVisible" @close="coverClose()">
            <div style="text-align: center;" v-html="coverHtml"></div>
        </el-dialog>
    </section>
</template>
<script type="es6">
    import util from '../../../api/util'
    import { httpGet, httpDel, httpPost} from '../../../api/api';
    import  Ks3 from '../../../../static/js/ksyun/ks3jssdk.js'

    export default {
        data() {
            return {
                filters: { //列表筛选条件
                    kw: ''
                },
                total: 0, //表格列表数据总数
                page: 1, //当前页，默认为第一页
                tableLoading: false, //表格的loading符号
                tableList: [], //表格数据
                formTitle: '',
                formVisible: false,//新增界面是否显示
                formLoading: false,
                //formSelect: false,
                formRules: {
                    name: [
                        {required: true, message: '请输入资源名称', trigger: 'blur'},
                        {min: 1, max: 32, message: '长度在 1 到 32 个字符', trigger: 'blur'}
                    ]
                },
                //新增界面数据
                formData: {
                    id: '',
                    name: '',
                    videoObj: ''
                },
                videoVisible: false,  //播放视频界面 显示、隐藏
                videoHtml: '',
                coverVisible: false,  //预览封面界面 显示、隐藏
                coverHtml: '',
                fileUpload: {
                    percentage: 0,
                    name: ''
                }
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
                    id: '',
                    kw: ''
                };
                if (isNaN(_self.filters.kw)) { //输入不为数字，值传入kw
                    paras.kw = _self.filters.kw;
                } else {
                    paras.id = _self.filters.kw;
                }
                paras.offset = (_self.page - 1) * paras.size;
                _self.tableLoading = true;
                httpGet('contentSourceList', paras, _self, function (res) {
                    _self.tableLoading = false;
                    try {
                        let { error, status,data } = res;
                        _self.total = data.totalElements;
                        _self.tableList = data.content.map(function (item) {
                            item.size = util.fileSizeFormat(item.size);
                            item.duration = util.fileDuration(item.duration);
                            return item;
                        });
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })


            },
            showForm (index, row){ //显示表单 资源库只有新增操作
                this.formVisible = true;
                if (index == -1) { //索引为-1时，新增操作
                    this.formTitle = '新增视频资源';
                } else {
                    this.formTitle = '编辑视频资源';
                    this.formData = {
                        id: row.id,
                        name: row.name,
                        videoObj: row.objectKey
                    };
                }

            },
            closeForm(){ //关闭表格页时，重置所有表格的参数
                this.formData = {
                    id: '',
                    name: '',
                    videoObj: ''
                };
                let clearFile = document.getElementById('videoFile');
                if (clearFile) {
                    //clearFile.outerHTML = clearFile.outerHTML;
                    clearFile.value = '';
                }
                this.fileUpload.percentage = 0;
                this.$refs['formData'].resetFields();
            },
            formSubmit(){ //提交表格
                this.$refs.formData.validate((valid) => {
                    if (valid) {
                        let _self = this;
                        if (_self.formData.videoObj == '' && _self.formData.id == '') {
                            _self.$message.warning('请选择视频文件');
                            return;
                        }
                        let paras = new FormData(),
                            api = 'videoUpload';
                        paras.append("objectKey", _self.formData.videoObj);
                        paras.append("name", _self.formData.name);
                        if (_self.formData.id !== '') { //id不为空，提交参数增加id，且更改接口地址
                            paras.append("id", _self.formData.id);
                            api = 'contentSourceEdit';
                        }
                        _self.formLoading = true;
                        httpPost(api, paras, _self, function (res) {
                            _self.formLoading = false;
                            try {
                                _self.$message.success('提交成功');
                                _self.$refs['formData'].resetFields(); //重置表单并移除校验结果
                                _self.formVisible = false;
                                _self.fetchList();
                            } catch (error) {
                                util.jsErrNotify(error);
                            }
                        })
                    }
                });
            },
            handleTableDel: function (index, row) { //删除表格数据
                let _self = this;
                _self.tableLoading = true;
                httpDel('contentSourceDel', {id: row.id}, _self, function (res) {
                    _self.tableLoading = false;
                    try {
                        _self.$message.success('删除成功');
                        _self.fetchList();
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            playVideo(index, row){ //播放视频
                this.videoVisible = true;
                this.videoHtml = '<video style="max-width: 100%;max-height:350px;" poster="' + row.coverUrl + '" controls="controls" autoplay="autoplay">'
                    + '<source src="' + row.url + '" type="video/mp4">对不起，您的浏览器不支持video标签，无法播放视频。</video>';
            },
            videoClose(){
                this.videoHtml = '';
            },
            previewCover(row, type){ //预览封面弹窗
                if (type == 0) { //0为静态封面
                    if (row.coverUrl == '') {
                        this.$message.warning('静态封面还没有形成，请稍等~');
                        return;
                    }
                    this.coverVisible = true;
                    this.coverHtml = '<img style="max-width: 100%;max-height:350px;" src="' + row.coverUrl + '" alt="静态封面">';
                } else if (type == 1) {
                    if (row.animateUrl == '') {
                        this.$message.warning('动态封面还没有形成，请稍等~');
                        return;
                    }
                    this.coverVisible = true;
                    this.coverHtml = '<picture><source srcset="' + row.animateUrl + '" type="image/webp" ><img style="max-width: 100%;max-height:350px;" src="' + row.coverUrl + '" alt="动态封面"></picture>';
                }
            },
            coverClose(){
                this.coverHtml = '';
            },
            changeFile(){ //更改视频文件，名称、上传进度、videoObj 重置
                let file = document.getElementById('videoFile').files[0];
                this.fileUpload.percentage = 0;
                this.formData.videoObj = '';
                let reg = /\.\w+$/;
                if (file) {
                    let str = file.name;
                    this.formData.name = str.replace(reg, '');
                } else {
                    this.formData.name = '';
                }
            },
            submitUploadKs(){ //文件上传至金山
                let file = document.getElementById('videoFile').files[0];
                let _self = this;
                if (!file) { //未选择文件
                    _self.$message({
                        message: '请先选择文件',
                        type: 'error'
                    });
                    return;
                }

                const isMp4 = file.type === 'video/mp4';
                if (!isMp4) {
                    _self.$message.error('只可以上传mp4格式');
                    return;
                }
                let paras = {
                    contentType: file.type,
                    fileName: file.name
                };
                httpGet('videoSign', paras, _self, function (res) {
                    try {
                        let { error, status,data } = res;
                        Ks3.Ks3.config.baseUrl = data.url;
                        Ks3.Ks3.config.AK = data.formParam.KSSAccessKeyId;
                        Ks3.Ks3.config.bucket = data.bucketName;
                        Ks3.Ks3.putObject({
                            Key: data.formParam.key,
                            File: file,
                            ACL: 'public-read',
                            ProgressListener: progressFunction, //上传进程
                            Signature: data.formParam.signature
                        }, function (err) {
                            if (err) { //上传失败
                                _self.$message({
                                    message: JSON.stringify(err),
                                    type: 'error'
                                });
                                _self.fileUpload.percentage = 0;
                            } else { //上传成功回调
                                _self.formData.videoObj = data.formParam.key;
                            }
                        });
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
                function progressFunction(e) {
                    if (e.lengthComputable) {
                        let percent = parseInt((e.loaded / e.total) * 100);
                        _self.fileUpload.percentage = percent;
                    }
                }
            }
        },
        mounted() {
            this.fetchList();
        }
    }

</script>
