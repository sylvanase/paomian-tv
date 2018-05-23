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
            <el-form-item label="话题类型">
                <el-select v-model="formData.topicType" placeholder="请选择">
                    <el-option label="普通" value="0"></el-option>
                    <el-option label="单个剧本" value="1"></el-option>
                    <el-option label="多个剧本" value="2"></el-option>
                    <el-option label="音乐片段" value="3"></el-option>
                </el-select>
            </el-form-item>
            <!-- 单个剧本 -->
            <template v-if="formData.topicType == 1">
                <el-form-item label="关联剧本">
                    <template>
                        <el-select style="width: 50%;" v-model="formData.playId" filterable remote
                                   loading-text="搜索中" placeholder="输入id或名称搜索剧本" :remote-method="handlePlay"
                                   :loading="searchPlay.loading">
                            <el-option v-for="item in searchPlay.list" :key="item.id" :label="item.name"
                                       :value="item.id">
                            </el-option>
                        </el-select>
                    </template>
                </el-form-item>
            </template>
            <!-- 多个剧本 -->
            <template v-if="formData.topicType == 2">
                <el-form-item label="剧本属性">
                    <template>
                        <el-select style="width: 50%;" v-model="formData.playAttrId" filterable remote
                                   loading-text="搜索中" placeholder="输入关键词搜索属性" :remote-method="handleAttr"
                                   :loading="searchAttr.loading">
                            <el-option v-for="item in searchAttr.list" :key="item.id" :label="item.name"
                                       :value="item.id">
                            </el-option>
                        </el-select>
                    </template>
                </el-form-item>
            </template>
            <!-- 音乐片段 -->
            <template v-if="formData.topicType == 3">
                <el-form-item label="关联音乐">
                    <template>
                        <el-select style="width: 50%;" clearable filterable :remote-method="handleMusic"
                                   :loading="searchMusic.loading" remote v-model="formData.musicId"
                                   placeholder="搜索关联音乐">
                            <el-option v-for="item in searchMusic.list" :key="item.id" :label="item.name"
                                       :value="item.id">
                            </el-option>
                        </el-select>
                    </template>
                </el-form-item>
                <el-form-item label="关联片段">
                    <template>
                        <el-select style="width: 50%;" clearable filterable :remote-method="handleMaterial"
                                   :loading="searchMaterial.loading" remote v-model="formData.materialIds"
                                   placeholder="搜索关联片段">
                            <el-option v-for="item in searchMaterial.list" :key="item.id" :label="item.name"
                                       :value="item.id">
                            </el-option>
                        </el-select>
                    </template>
                </el-form-item>
                <el-form-item label="片段前置">
                    <el-switch on-text="是" off-text="否" v-model="formData.isPre"></el-switch>
                </el-form-item>
            </template>
            <el-form-item label="进推荐">
                <el-switch on-text="是" off-text="否" v-model="formData.isReco"></el-switch>
            </el-form-item>
            <el-form-item label="显示">
                <el-switch on-text="显示" off-text="隐藏" v-model="formData.del" @change="timeStatus"></el-switch>
            </el-form-item>
            <el-form-item label="背景海报" prop="coverId">
                <div class="avatar-uploader" style="width: 80%;" @click="chooseFile">
                    <div class="el-upload el-upload--text">
                        <i v-show="avatarLoading" class="el-icon-loading avatar-uploader-icon"></i>
                        <i v-show="!formData.coverImgUrl && !avatarLoading"
                           class="el-icon-plus avatar-uploader-icon"></i>
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
    import {httpGet, httpPost} from '../../../api/api';

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
                    topicType: '0', // 话题类型
                    playId: '', // 关联的剧本id
                    playAttrId: '', // 关联的剧本属性id
                    musicId: '', // 关联的音乐id
                    materialIds: '', // 关联的片段id
                    isPre: false, // 片段是否前置
                    isReco: true, // 是否进推荐，进推荐传0
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
                },
                searchPlay: { //搜索剧本
                    loading: false,
                    list: []
                },
                searchAttr: { //搜索剧本属性
                    loading: false,
                    list: []
                },
                searchMusic: { //搜索关联音乐
                    loading: false,
                    list: []
                },
                searchMaterial: { //搜索关联片段
                    loading: false,
                    list: []
                }
            }
        },
        computed: {
            detail() { //返回用户详情
                let _self = this;
                let _data = _self.topicData;
                if (_data.id) {
                    _self.formData = {
                        id: _data.id,
                        name: _data.name,
                        description: _data.description,
                        topicType: _data.topicType + '',
                        playId: '', // 关联的剧本id
                        playAttrId: '', // 关联的剧本属性id
                        musicId: '', // 关联的音乐id
                        materialIds: '', // 关联的片段id数组
                        isPre: false, // 片段是否前置
                        isReco: !Boolean(_data.topicVideoReco),
                        coverId: _data.coverId,
                        coverImgUrl: _data.coverUrl,
                        videoId: _data.videoId + '',
                        start: util.timestampFormat(_data.startTime),
                        end: util.timestampFormat(_data.endTime),
                        del: !Boolean(_data.isDel)
                    };
                    _self.timeVisible = !Boolean(_data.isDel);
                    _self.wordCount(_data.description);
                    if (_data.topicType != 0 && typeof (_data.topicTypeJson) == 'string') {
                        _data.topicTypeJson = JSON.parse(_data.topicTypeJson);
                    }
                    if (_data.topicType == 1) { // 单个剧本
                        _self.formData.playId = _data.topicTypeJson.id; // 剧本id
                    }
                    if (_data.topicType == 2) { // 多个剧本
                        _self.formData.playAttrId = _data.topicTypeJson.id; // 剧本属性id
                    }
                    if (_data.topicType == 3) { // 音乐片段
                        _self.formData.musicId = _data.topicTypeJson.musicId; // 音乐id
                        _self.formData.materialIds = _data.topicTypeJson.materialId[0]; // 片段id
                        _self.formData.isPre = Boolean(_data.topicTypeJson.pre); // 是否前置
                    }

                }

            }
        },
        methods: {
            chooseFile() { //触发选择文件
                let fileDom = document.getElementById('cover');
                fileDom.click();
            },
            fileChange() { // 文件变更后操作
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
                                let {error, status, data} = res;
                                _self.formData.coverId = data.id;
                                _self.formData.coverImgUrl = URL.createObjectURL(fileDom.files[0]);
                            } catch (error) {
                                util.jsErrNotify(error);
                            }
                        }, function (res) { // 上传失败回调
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
            formSubmit() { //提交表单
                let _self = this;
                let paras = new FormData();
                paras.append("id", _self.formData.id);
                paras.append("name", _self.formData.name);
                paras.append("description", _self.formData.description);
                paras.append("coverId", _self.formData.coverId);
                paras.append("videoId", _self.formData.videoId);
                paras.append("startTime", _self.formData.start);
                paras.append("isDel", Number(!_self.formData.del));
                /* v1.0.7 增加参数*/
                paras.append("topicType", _self.formData.topicType);
                paras.append("playId", _self.formData.topicType == 1 ? _self.formData.playId : '');
                paras.append("playAttrId", _self.formData.topicType == 2 ? _self.formData.playAttrId : '');
                paras.append("musicId", _self.formData.topicType == 3 ? _self.formData.musicId : '');
                paras.append("materialIds", _self.formData.topicType == 3 ? [_self.formData.materialIds] : []);
                paras.append("isPre", _self.formData.topicType == 3 ? Number(_self.formData.isPre) : '');
                paras.append("topicVideoReco", Number(!_self.formData.isReco));
                /* 结束 */
                _self.formLoading = true;
                httpPost('topicEdit', paras, _self, function (res) {
                    _self.formLoading = false;
                    try {
                        let {error, status, data} = res;
                        _self.$message.success('提交成功');
                        _self.visible = false;
                        _self.$emit('refresh');
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            resetCoverImg() { //删除封面
                this.formData.coverImgUrl = '';
                this.formData.coverId = '';
                document.getElementById('cover').value = '';
            },
            handleSource(query) { //搜索帖子列表
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
                            let {error, status, data} = res;
                            _self.searchSource.list = data.content;
                        } catch (error) {
                            util.jsErrNotify(error);
                        }
                    })
                }
            },
            setStart(val) {
                this.formData.start = val;
            },
            timeStatus(val) { //更改时间是否可选状态
                this.timeVisible = !val;
            },
            wordCount(val) { //监测简介字数
                this.wordNum = val.length + '/60';
            },
            handlePlay(query) { //搜索剧本
                let _self = this;
                _self.searchPlay.loading = true;
                let paras = {
                    offset: 0,
                    size: 30,
                    id: '',
                    kw: ''
                };
                if (isNaN(query)) { //输入不为数字，值传入kw
                    paras.kw = query;
                } else {
                    paras.id = query;
                }
                httpGet('contentPlayList', paras, _self, function (res) {
                    _self.searchPlay.loading = false;
                    try {
                        let {error, status, data} = res;
                        _self.searchPlay.list = data.content;
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            handleAttr(query) { //搜索剧本属性
                let _self = this;
                let para = {
                    offset: 0,
                    size: 30,
                    type: '2',
                    id: '',
                    kw: ''
                };
                if (isNaN(query)) { //输入不为数字，值传入kw
                    para.kw = query;
                } else {
                    para.id = query;
                }
                _self.searchAttr.loading = true;
                httpGet('contentAttrList', para, _self, function (res) {
                    _self.searchAttr.loading = false;
                    try {
                        let {error, status, data} = res;
                        _self.searchAttr.list = data.content;
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            handleMusic(query) { // 获取音乐数据
                let _self = this;
                _self.searchMusic.loading = true;
                let paras = {
                    offset: 0,
                    size: 30,
                    id: '',
                    kw: ''
                };
                if (isNaN(query)) { //输入不为数字，值传入kw
                    paras.kw = query;
                } else {
                    paras.id = query;
                }
                httpGet('contentMusicList', paras, _self, function (res) {
                    _self.searchMusic.loading = false;
                    try {
                        let {data} = res;
                        _self.searchMusic.list = data.content;
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            handleMaterial(query) { // 获取片段数据
                let _self = this;
                _self.searchMaterial.loading = true;
                let paras = {
                    offset: 0,
                    size: 30,
                    id: '',
                    kw: ''
                };
                if (isNaN(query)) { //输入不为数字，值传入kw
                    paras.kw = query;
                } else {
                    paras.id = query;
                }
                httpGet('contentMaterialList', paras, _self, function (res) {
                    _self.searchMaterial.loading = false;
                    try {
                        let {data} = res;
                        _self.searchMaterial.list = data.content;
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            resetFormData() { //关闭表格弹窗，重置表格数据
                let _self = this;
                _self.formLoading = false;
                _self.formData = {
                    id: '',
                    uid: '',
                    name: '',
                    description: '',
                    topicType: '0', // 话题类型
                    playId: '', // 关联的剧本id
                    playAttrId: '', // 关联的剧本属性id
                    musicId: '', // 关联的音乐id
                    materialIds: '', // 关联的片段id数组
                    isPre: false, // 片段是否前置
                    isReco: true, // 是否进推荐
                    coverId: '',
                    coverImgUrl: '',
                    videoId: '',
                    start: '',
                    end: '',
                    del: ''
                };
                _self.wordNum = '0/60'; //重置字数统计
                document.getElementById('cover').value = '';
                _self.topicData = {};
            }
        },
        watch: {
            detail(val) { //监测详情变化
            },
            value(val) {
                if (val == false) { //关闭时重置页面
                    let _self = this;
                    _self.formLoading = false;
                    _self.formData = {
                        id: '',
                        uid: '',
                        name: '',
                        description: '',
                        topicType: '0', // 话题类型
                        playId: '', // 关联的剧本id
                        playAttrId: '', // 关联的剧本属性id
                        musicId: '', // 关联的音乐id
                        materialIds: '', // 关联的片段id数组
                        isPre: false, // 片段是否前置
                        isReco: true, // 是否进推荐
                        coverId: '',
                        coverImgUrl: '',
                        videoId: '',
                        start: '',
                        end: '',
                        del: ''
                    };
                    _self.wordNum = '0/60'; //重置字数统计
                    document.getElementById('cover').value = '';
                    _self.topicData = {};
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
