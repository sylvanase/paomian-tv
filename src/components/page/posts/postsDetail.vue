<template>
    <el-dialog title="帖子详情" :value="value" v-model="visible">
        <el-form :model="formData" label-width="80px" :rules="formRules" ref="formData" v-loading="showLoading">
            <el-form-item label="作者id">
                <el-input :disabled="isEdit" type="number" v-model.trim="formData.uid" style="width: 200px;" auto-complete="off"></el-input>
            </el-form-item>
            <el-form-item label="帖子描述">
                <el-input type="textarea" v-model="formData.des"></el-input>
            </el-form-item>
            <el-form-item label="显示">
                <el-switch on-text="显示" off-text="隐藏" v-model="formData.del"></el-switch>
            </el-form-item>
            <el-form-item label="精华">
                <el-switch on-text="精华" off-text="取消" v-model="formData.essence"></el-switch>
            </el-form-item>
            <el-form-item label="显示时间">
                <el-col :span="11">
                    <el-date-picker  :disabled="isEdit" type="datetime" placeholder="选择日期" v-model="formData.start"
                                    style="width: 100%;" @change="setStart"></el-date-picker>
                </el-col>
            </el-form-item>
            <el-form-item label="视频资源" :disabled="isEdit">
                <template>
                    <el-select :disabled="isEdit" style="width: 50%;" v-model="formData.videoId" filterable remote
                               loading-text="搜索中" placeholder="输入id搜索视频" :remote-method="handleSource"
                               :loading="searchSource.loading">
                        <el-option v-for="item in searchSource.list" :key="item.id" :label="item.name"
                                   :value="item.id">
                        </el-option>
                    </el-select>
                    <div>(搜索范围：内容管理-资源库。若视频尚未添加，请先至资源库进行上传操作)</div>
                </template>
            </el-form-item>
            <el-form-item label="包含剧本">
                <template>
                    <el-select :disabled="isEdit" style="width: 50%;" v-model="formData.playId" filterable remote
                               loading-text="搜索中" placeholder="输入id或名称搜索剧本" :remote-method="handlePlay"
                               :loading="searchPlay.loading">
                        <el-option v-for="item in searchPlay.list" :key="item.id" :label="item.name"
                                   :value="item.id">
                        </el-option>
                    </el-select>
                    <div>(请认真核对再输入否则会出现BUG)</div>
                </template>
            </el-form-item>
            <el-form-item label="所属话题" style="margin-bottom: -20px;">
                <template>
                    <el-select :disabled="isEdit" style="width: 50%;" v-model="formData.topicId" filterable remote
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
    import { axiosGet, axiosPost} from '../../../api/api';
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
                    topicId: '',
                    playId: ''
                },
                isEdit: false, //默认为非编辑状态
                searchSource: { //搜索资源
                    loading: false,
                    list: []
                },
                searchPlay: { //搜索剧本
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
                if(!this.value){ //不显示的时候不请求详细
                    return;
                }
                this.showLoading = true;
                this.formData = {
                    id: '',
                    uid: '',
                    des: '',
                    videoId: '',
                    start: '',
                    del: '',
                    essence: '',
                    topicId: '',
                    playId: ''
                };
                if (this.postsData.id) {
                    axiosGet('postsDetail', {id: this.postsData.id}).then((res) => {
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
                            this.isEdit = true;
                            this.formData = {
                                id: data.id,
                                uid: data.uid,
                                des: data.videoText,
                                videoId: data.videoInfoPo == null ? data.id : data.videoInfoPo.vpId,
                                start: util.timestampFormat(data.createTime),
                                del: !Boolean(data.isdel),
                                essence: Boolean(data.isEssence),
                                topicId: data.topicId,
                                playId: data.playId
                            }
                        }
                    });
                } else {
                    this.showLoading = false;
                    this.isEdit = false;
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
                paras.append("playId", this.formData.playId);
                paras.append("createTime", this.formData.start);
                paras.append("del", Number(!this.formData.del));
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
            handlePlay(query){ //搜索剧本
                this.searchPlay.loading = true;
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
                axiosGet('contentPlayList', para).then((res) => {
                    let { error, status,data } = res;
                    if (status !== 0) {
                        if (status == 403) { //返回403时，重新登录
                            sessionStorage.removeItem('user');
                            this.$router.push('/login');
                        } else {
                            this.$message.error(error);
                        }
                    } else {
                        this.searchPlay.loading = false;
                        this.searchPlay.list = data.content;
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
                        this.searchSource.loading = false;
                        this.searchSource.list = data.content;
                    }
                });
            },
            handleTopic(query){ //搜索话题
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
