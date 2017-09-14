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
        <el-dialog :title="formTitle" v-model="formVisible">
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
    import { axiosGet, axiosDel, axiosPost} from '../../../api/api';
    import  Ks3 from '../../../../static/js/ksyun/ks3jssdk.js'

    export default {
        data() {
            return {
                api: 'video_resource',
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
                let para = {
                    offset: 0,
                    size: 10,
                    id: '',
                    kw: ''
                };
                if (isNaN(this.filters.kw)) { //输入不为数字，值传入kw
                    para.kw = this.filters.kw;
                } else {
                    para.id = this.filters.kw;
                }
                para.offset = (this.page - 1) * para.size;
                this.tableLoading = true;
                axiosGet('contentSourceList', para).then((res) => {
                    let { error, status,data } = res;
                    if (status !== 0) {
                        if (status == 403) { //返回403时，重新登录
                            sessionStorage.removeItem('user');
                            this.$router.push('/login');
                        } else {
                            this.$message.error(error);
                        }
                    } else {
                        this.total = data.totalElements;
                        this.tableList = data.content.map(function (item) {
                            var size = item.size / 1024;//计算kb
                            if (size >= 1024) {
                                size = size / 1024; //计算M
                                size = size.toFixed(2) + " M";
                            } else {
                                size = size.toFixed(2) + ' kb';
                            }
                            item.size = size;

                            var html, //计算时长
                                s = (item.duration % 60).toFixed(1),
                                min = parseInt(item.duration / 60),
                                h;
                            if (0 < min < 60) {
                                html = min + ' 分 ' + s + ' 秒 ';
                            } else if (min >= 60) {
                                h = parseInt(min / 60);
                                min = min % 60;
                                html = h + ' 小时 ' + min + ' 分 ' + s + ' 秒 ';
                            }
                            item.duration = html;
                            return item;
                        });
                        this.tableLoading = false;
                    }
                });
            },
            showForm (index, row){ //显示表单 资源库只有新增操作
                this.formVisible = true;
                if (index == -1) { //索引为-1时，新增操作
                    this.formTitle = '新增视频资源';
                    this.formData = {
                        id: '',
                        name: '',
                        videoObj: ''
                    };
                } else {
                    this.formTitle = '编辑视频资源';
                    this.formData = {
                        id: row.id,
                        name: row.name,
                        videoObj: row.objectKey
                    };
                }
                let clearFile = document.getElementById('videoFile');
                if (clearFile) {
                    clearFile.outerHTML = clearFile.outerHTML;
                }
                this.fileUpload.percentage = 0;
            },
            formSubmit(){ //提交表格
                this.$refs.formData.validate((valid) => {
                    if (valid) {
                        //不为编辑时必须选择文件
                        if (this.formData.videoObj == '' && this.formData.id == '') {
                            this.$message.warning('请选择视频文件');
                            return;
                        }
                        this.formLoading = true;
                        let paras = new FormData(),
                            api = 'videoUpload';
                        paras.append("objectKey", this.formData.videoObj);
                        paras.append("name", this.formData.name);
                        if (this.formData.id !== '') { //id不为空，提交参数增加id，且更改接口地址
                            paras.append("id", this.formData.id);
                            api = 'contentSourceEdit';
                        }
                        axiosPost(api, paras).then((res) => {
                            this.formLoading = false;
                            let { error, status } = res;
                            if (status !== 0) {
                                if (status == 403) { //返回403时，重新登录
                                    sessionStorage.removeItem('user');
                                    this.$router.push('/login');
                                } else {
                                    this.$message.error(error);
                                }
                            } else {
                                this.$message.success('提交成功');
                                this.$refs['formData'].resetFields(); //重置表单并移除校验结果
                                this.formVisible = false;
                                this.fetchList();
                            }
                        });

                    }
                });
            },
            //删除表格数据
            handleTableDel: function (index, row) {
                this.$confirm('确认删除该记录吗?', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.tableLoading = true;
                    let para = {id: row.id};
                    axiosDel('contentSourceDel', para).then((res) => {
                        this.tableLoading = false;
                        let { error, status } = res;
                        if (status !== 0) {
                            if (status == 403) { //返回403时，重新登录
                                sessionStorage.removeItem('user');
                                this.$router.push('/login');
                            } else {
                                this.$message.error(error);
                            }
                        } else {
                            this.$message.success('删除成功');
                            this.fetchList();
                        }
                    });
                });
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
                let file = document.getElementsByName('file')[0].files[0];
                this.fileUpload.percentage = 0;
                this.formData.videoObj = '';
            },
            submitUploadKs(){ //文件上传至金山
                let file = document.getElementsByName('file')[0].files[0];
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
                    this.$message.error('只可以上传mp4格式');
                    return;
                }
                let para = {
                    contentType: file.type,
                    fileName: file.name
                };
                //服务器端获取上传所需签名
                axiosGet('videoSign', para).then((res) => {
                    let { error, status,data } = res;
                    if (status !== 0) {
                        if (status == 403) { //返回403时，重新登录
                            sessionStorage.removeItem('user');
                            _self.$router.push('/login');
                        } else {
                            _self.$message.error(error);
                        }
                    } else {
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
                    }
                });
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
