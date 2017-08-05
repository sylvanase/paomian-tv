<template>
    <el-dialog title="帖子详情" :value="value" v-model="visible">
        <el-form :model="formData" label-width="80px" :rules="formRules" ref="formData" v-loading="showLoading">
            <el-form-item label="作者id">
                <el-input v-model.trim="formData.uid" style="width: 200px;" auto-complete="off"></el-input>
            </el-form-item>
            <el-form-item label="帖子描述">
                <el-input type="textarea" v-model="formData.des"></el-input>
            </el-form-item>
            <el-form-item label="显示">
                <el-switch on-text="显示" off-text="隐藏" v-model="formData.del"></el-switch>
            </el-form-item>
            <el-form-item label="精华">
                <el-switch on-text="精华" off-text="非精" v-model="formData.essence"></el-switch>
            </el-form-item>
            <el-form-item label="显示时间">
                <el-col :span="11">
                    <el-date-picker type="datetime" placeholder="选择日期" v-model="formData.start"
                                    style="width: 100%;" @change="setStart"></el-date-picker>
                </el-col>
            </el-form-item>
            <el-form-item label="视频资源">
                <template>
                    <el-select style="width: 50%;" v-model="formData.videoId" filterable remote
                               loading-text="搜索中" placeholder="输入关键词搜索视频" :remote-method="handleSource"
                               :loading="searchSource.loading">
                        <el-option v-for="item in searchSource.list" :key="item.id" :label="item.name"
                                   :value="item.id">
                        </el-option>
                    </el-select>
                </template>
            </el-form-item>
            <el-form-item label="所属话题" style="margin-bottom: 0;">
                <template>
                    <el-select style="width: 50%;" v-model="formData.topicId" filterable remote
                               loading-text="搜索中" placeholder="输入关键词搜索话题" :remote-method="handleTopic"
                               :loading="searchTopic.loading">
                        <el-option v-for="item in searchTopic.list" :key="item.id" :label="item.name"
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
    import { imgUploadApi, axiosGet, axiosPost,tableListApi} from '../../../api/api';
    export default {
        name: 'vDetail',
        props: ['value', 'postsData'],
        data() {
            return {
                visible: false, //默认隐藏
                showLoading: false,
                formLoading: false,
                formRules: {},
                avatarLoading: false,
                avatarDisabled: false,
                formData: {
                    id: '',
                    uid: '',
                    des: '',
                    videoId: '',
                    start: '',
                    del: '',
                    essence: '',
                    topicId: ''
                },
                searchSource: { //搜索资源
                    loading: false,
                    list: []
                },
                searchTopic: { //搜索话题
                    loading: false,
                    list: []
                }
            }
        },
        computed: {
            detail(){ //返回详情
                this.showLoading = true;
                this.formData = {
                    id: '',
                    uid: '',
                    des: '',
                    videoId: '',
                    start: '',
                    del: '',
                    essence: '',
                    topicId: ''
                };
                if (this.postsData.id) {
                    axiosGet('userDetail', {uid: this.userData.id}).then((res) => {
                        let { error, status, data } = res;
                        if (status !== 0) {
                            if (status == 403) { //返回403时，重新登录
                                sessionStorage.removeItem('user');
                                this.$router.push('/login');
                            } else {
                                this.$message.error(error);
                            }
                        } else {
                            this.showLoading = false;
                            this.formData = {
                                id: data.id,
                                uid: data.uid,
                                des: data.videoText,
                                videoId: data.videoId,
                                start: util.timestampFormat(data.createTime),
                                del: Boolean(data.isdel),
                                essence: Boolean(data.isEssence),
                                topicId: data.topicId
                            }
                        }
                    });
                } else {
                    this.showLoading = false;
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
                paras.append("uid", this.formData.uid);
                paras.append("videoText", this.formData.des);
                paras.append("videoResourceId", this.formData.videoId);
                paras.append("topicId", this.formData.topicId);
                paras.append("createTime", this.formData.start);
                paras.append("del", Number(this.formData.del));
                paras.append("essence", Number(this.formData.essence));
                axiosPost('postsEdit', paras).then((res) => {
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
            handleSource(query){ //搜索视频资源
                this.searchSource.loading = true;
                let para = {
                    offset: 0,
                    size: 30,
                    id: '',
                    kw: ''
                };
                if (isNaN(query)) { //输入不为数字，值传入kw
                    para.kw = query;
                } else {
                    para.id = query;
                }
                tableListApi('video_resource', para).then((res) => {
                    let { error, status,data } = res;
                    if (status !== 0) {
                        if (status == 403) { //返回403时，重新登录
                            sessionStorage.removeItem('user');
                            this.$router.push('/login');
                        } else {
                            this.$message.error(error);
                        }
                    } else {
                        this.searchSource.loading = false;
                        this.searchSource.list = data.content;
                    }
                });
            },
            handleTopic(query){ //搜索视频资源
                this.searchTopic.loading = true;
                let para = {
                    offset: 0,
                    size: 30,
                    id: '',
                    kw: ''
                };
                if (isNaN(query)) { //输入不为数字，值传入kw
                    para.kw = query;
                } else {
                    para.id = query;
                }
                axiosGet('topicList', para).then((res) => {
                    let { error, status,data } = res;
                    if (status !== 0) {
                        if (status == 403) { //返回403时，重新登录
                            sessionStorage.removeItem('user');
                            this.$router.push('/login');
                        } else {
                            this.$message.error(error);
                        }
                    } else {
                        this.searchTopic.loading = false;
                        this.searchTopic.list = data.content;
                    }
                });
            },
            setStart(val){
                this.formData.start = val;
            }
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
</style>
