<template>
    <el-dialog title="话题详情" :value="value" v-model="visible">
        <el-form :model="formData" label-width="80px" :rules="formRules" ref="formData" v-loading="showLoading">
            <el-form-item label="话题名称" prop="name">
                <el-input v-model.trim="formData.name" style="width: 200px;" auto-complete="off"></el-input>
            </el-form-item>
            <el-form-item label="话题简介">
                <el-input type="textarea" @change="wordCount" maxlength="60" v-model="formData.description"></el-input>
                <div style="text-align: right;">{{ wordNum }}</div>
            </el-form-item>
            <el-form-item label="显示">
                <el-switch on-text="显示" off-text="隐藏" v-model="formData.del" @change="timeStatus"></el-switch>
            </el-form-item>
            <el-form-item label="背景海报" prop="coverId">
                <el-upload style="width: 80%;" :disabled="avatarDisabled" class="avatar-uploader" ref="upload"
                           action="" :show-file-list="false" :on-change="avatarChange" :auto-upload="false">
                    <img v-if="formData.coverImgUrl" v-model="formData.coverId" :src="formData.coverImgUrl"
                         class="avatar">
                    <i v-else class="el-icon-plus avatar-uploader-icon"></i>
                </el-upload>
                <el-button :loading="avatarLoading" class="mb-10" type="primary" size="small" @click="submitUpload">
                    上传
                </el-button>
                <el-button type="danger" size="small" @click="resetCoverImg">删除</el-button>
            </el-form-item>
            <el-form-item label="显示时间">
                <el-col :span="11">
                    <el-date-picker :disabled="timeVisible" type="datetime" placeholder="选择时间" v-model="formData.start"
                                    style="width: 100%;" @change="setStart"></el-date-picker>
                </el-col>
                <!--<el-col class="line" :span="2" style="text-align: center;">-</el-col>
                <el-col :span="11">
                    <el-date-picker type="datetime" placeholder="结束日期" v-model="formData.end"
                                    style="width: 100%;" @change="setEnd"></el-date-picker>
                </el-col>-->
            </el-form-item>
            <el-form-item label="样片" style="margin-bottom: 0;">
                <template>
                    <el-select style="width: 50%;" v-model="formData.videoId" filterable remote
                               loading-text="搜索中" placeholder="输入id或关键字搜索帖子" :remote-method="handleSource"
                               :loading="searchSource.loading">
                        <el-option v-for="item in searchSource.list" :key="item.id" :label="item.videoText"
                                   :value="item.id">
                        </el-option>
                    </el-select>
                </template>
            </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button size="small" @click.native="change">取消</el-button>
            <el-button size="small" type="primary" @click.native="formSubmit" :loading="formLoading">提交</el-button>
        </div>
    </el-dialog>
</template>

<script type="es6">
    import util from '../../../api/util'
    import { axiosGet, axiosPost} from '../../../api/api';
    export default {
        name: 'vDetail',
        props: ['value', 'topicData'],
        data() {
            return {
                visible: false, //默认隐藏
                showLoading: false,
                formLoading: false,
                formRules: {
                    /*name: [
                     {required: true, message: '请输入用户昵称', trigger: 'blur'},
                     {min: 1, max: 32, message: '长度在 1 到 32 个字符', trigger: 'blur'}
                     ]*/
                },
                avatarLoading: false,
                avatarDisabled: false,
                formData: {
                    id: '',
                    uid: '',
                    name: '',
                    description: '',
                    coverId: '',
                    coverImgUrl: '',
                    videoId: '',
                    start: '',
                    end: '',
                    del: ''
                },
                wordNum: '0/60', //监测统计字数
                timeVisible: true,
                searchSource: { //搜索资源
                    loading: false,
                    list: []
                }
            }
        },
        computed: {
            detail(){ //返回用户详情
                this.formData = {
                    id: '',
                    name: '',
                    description: '',
                    coverId: '',
                    coverImgUrl: '',
                    videoId: '',
                    start: '',
                    end: '',
                    del: ''
                };
                if (this.topicData.id) {
                    this.formData = {
                        id: this.topicData.id,
                        name: this.topicData.name,
                        description: this.topicData.description,
                        coverId: this.topicData.coverId,
                        coverImgUrl: this.topicData.coverUrl,
                        videoId: this.topicData.videoId + '',
                        start: util.timestampFormat(this.topicData.startTime),
                        end: util.timestampFormat(this.topicData.endTime),
                        del: !Boolean(this.topicData.isDel)
                    };
                    this.timeVisible = !Boolean(this.topicData.isDel);
                    this.wordCount(this.topicData.description);
                }

            }
        },
        methods: {
            change() {
                this.visible = false;
            },
            formSubmit(){ //提交表单
                this.formLoading = true;
                let paras = new FormData();
                paras.append("id", this.formData.id);
                paras.append("name", this.formData.name);
                paras.append("description", this.formData.description);
                paras.append("coverId", this.formData.coverId);
                paras.append("videoId", this.formData.videoId);
                paras.append("startTime", this.formData.start);
                //paras.append("endTime", this.formData.end);
                paras.append("isDel", Number(!this.formData.del));
                axiosPost('topicEdit', paras).then((res) => {
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
                        this.visible = false;
                        this.$emit('refresh');
                    }
                });
            },
            /*
             * 封面选择相关操作
             * */
            avatarChange(file){ //更改图片时,重置预览文件路径
                this.formData.coverImgUrl = file.url;
            },
            resetCoverImg(){ //删除封面
                this.formData.coverImgUrl = '';
                this.formData.coverId = '';
            },
            beforeAvatarUpload(file) { //上传前校验
                const isType = file.type.substring(0, 5);
                const isJPG = isType === 'image';
                const isLt2M = file.size / 1024 / 1024 <= 10;

                if (!isJPG) {
                    this.$message.warning('封面文件必须是图片类型!');
                }
                if (!isLt2M) {
                    this.$message.warning('上传图片大小不能超过 10MB!');
                }
                return isJPG && isLt2M;
            },
            submitUpload() { //上传图片
                let file = document.getElementsByName('file')[0].files;
                if (file.length == 0) { //file为空，提示并返回
                    this.$message.warning('请选择文件');
                    return;
                }
                var imgFile = document.getElementsByName('file')[0].files[0];
                if (!this.beforeAvatarUpload(imgFile)) {
                    return;
                }
                let para = new FormData();
                para.append("imageFile", imgFile);
                axiosPost('imgUpload',para).then((res) => {
                    this.avatarDisabled = true;
                    this.avatarLoading = true;
                    let { error, status, data } = res;
                    if (status !== 0) {
                        if (status == 403) { //返回403时，重新登录
                            sessionStorage.removeItem('user');
                            this.$router.push('/login');
                        } else {
                            this.$message.error(error);
                        }
                    } else {
                        //上传图片成功回调
                        this.handleAvatarSuccess(data);
                    }
                });
            },
            handleAvatarSuccess(res) { //上传成功后操作
                this.$message.success('上传图片成功');
                this.avatarDisabled = false;
                this.avatarLoading = false;
                this.formData.coverId = res.id;
            },
            handleSource(query){ //搜索帖子列表
                this.searchSource.loading = true;
                let para = {
                    offset: 0,
                    size: 30,
                    id: '',
                    kw: ''
                };
                if (query) {
                    if (isNaN(query)) { //输入不为数字，值传入kw
                        para.kw = query;
                    } else {
                        para.id = query;
                    }
                    axiosGet('topicPosts', para).then((res) => {
                        let { error, status,data } = res;
                        this.searchSource.loading = false;
                        this.searchSource.list = data.content;
                    });
                }
            },
            setStart(val){
                this.formData.start = val;
            },
            timeStatus(val){ //更改时间是否可选状态
                this.timeVisible = !val;
            },
            wordCount(val){ //监测简介字数
                this.wordNum = val.length + '/60';
            }
            /*,
             setEnd(val){
             this.formData.end = val;
             }*/
        },
        watch: {
            detail(val){ //监测详情变化
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
    /*
        封面选择部分
    */
    .avatar-uploader .el-upload {
        border: 1px dashed #d9d9d9;
        border-radius: 6px;
        cursor: pointer;
        position: relative;
        overflow: hidden;
        background-color: #fff;
        box-sizing: border-box;
        width: 360px;
        height: 180px;
        text-align: center;

    }

    .avatar-uploader .el-upload:hover {
        border-color: #20a0ff;
    }

    .avatar-uploader-icon {
        font-size: 28px;
        color: #8c939d;
        width: 178px;
        height: 178px;
        line-height: 178px;
        text-align: center;
    }

    .avatar {
        max-width: 100%;
        max-height: 100%;
        display: block;
        margin: 0 auto;
    }
</style>
