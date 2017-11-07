<template>
    <el-dialog title="话题详情" :value="value" v-model="visible" @close="resetFormData">
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
                <div class="avatar-uploader" style="width: 80%;" @click="chooseFile">
                    <div class="el-upload el-upload--text">
                        <i v-show="avatarLoading"class="el-icon-loading avatar-uploader-icon"></i>
                        <i v-show="!formData.coverImgUrl && !avatarLoading" class="el-icon-plus avatar-uploader-icon"></i>
                        <img v-show="formData.coverImgUrl && !avatarLoading" :src="formData.coverImgUrl" class="avatar">
                        <input type="file" id="cover" class="el-upload__input" @change="fileChange">
                    </div>
                </div>
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
    import { httpGet, httpPost} from '../../../api/api';
    export default {
        name: 'vDetail',
        props: ['value', 'topicData'],
        data() {
            return {
                visible: false, //默认隐藏
                showLoading: false,
                formLoading: false,
                formRules: {},
                avatarLoading: false,
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
            chooseFile(){ //触发选择文件
                let fileDom = document.getElementById('cover');
                fileDom.click();
            },
            fileChange(){ // 文件变更后操作
                let fileDom = document.getElementById('cover');
                let _self = this;
                if (fileDom.value) { // 如果文件不为空，进行校验和上传操作
                    const _verify = util.imgFileCheck(fileDom);
                    if (_verify) { //文件校验通过，进行上传操作
                        let paras = new FormData();
                        paras.append("imageFile", fileDom.files[0]);
                        _self.avatarLoading = true;
                        httpPost('imgUpload', paras, _self, function (res) {
                            _self.avatarLoading = false;
                            try {
                                let { error, status,data } = res;
                                _self.formData.coverId = data.id;
                                _self.formData.coverImgUrl = URL.createObjectURL(fileDom.files[0]);
                            } catch (error) {
                                util.jsErrNotify(error);
                            }
                        },function (res) { // 上传失败回调
                            _self.avatarLoading = false;
                            fileDom.value = '';
                            _self.$message.error('上传失败，请重新选择文件');
                        })
                    }
                }
            },
            change() {
                this.wordNum = '0/60'; //重置字数统计
                this.visible = false;
            },
            formSubmit(){ //提交表单
                let _self = this;
                let paras = new FormData();
                paras.append("id", _self.formData.id);
                paras.append("name", _self.formData.name);
                paras.append("description", _self.formData.description);
                paras.append("coverId", _self.formData.coverId);
                paras.append("videoId", _self.formData.videoId);
                paras.append("startTime", _self.formData.start);
                //paras.append("endTime", this.formData.end);
                paras.append("isDel", Number(!_self.formData.del));
                _self.formLoading = true;
                httpPost('topicEdit', paras, _self, function (res) {
                    _self.formLoading = false;
                    try {
                        let { error, status,data } = res;
                        _self.$message.success('提交成功');
                        _self.visible = false;
                        _self.$emit('refresh');
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            resetCoverImg(){ //删除封面
                this.formData.coverImgUrl = '';
                this.formData.coverId = '';
                document.getElementById('cover').value = '';
            },
            handleSource(query){ //搜索帖子列表
                this.searchSource.loading = true;
                let _self = this;
                let paras = {
                    offset: 0,
                    size: 30,
                    id: '',
                    kw: ''
                };
                if (query) {
                    if (isNaN(query)) { //输入不为数字，值传入kw
                        paras.kw = query;
                    } else {
                        paras.id = query;
                    }
                    httpGet('topicPosts', paras, _self, function (res) {
                        _self.searchSource.loading = false;
                        try {
                            let { error, status,data } = res;
                            _self.searchSource.list = data.content;
                        } catch (error) {
                            util.jsErrNotify(error);
                        }
                    })
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
            },
            resetFormData(){ //关闭表格弹窗，重置表格数据
                let _self = this;
                _self.formLoading = false;
                _self.formData = {
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
                _self.wordNum = '0/60'; //重置字数统计
                document.getElementById('cover').value = '';
            }
        },
        watch: {
            detail(val){ //监测详情变化
            },
            value(val) {
                if (val == false) { //关闭时重置页面
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
                    this.wordNum = '0/60'; //重置字数统计
                    this.avatarLoading = false;
                    document.getElementById('cover').value = '';
                }
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
