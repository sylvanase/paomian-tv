<template>
    <el-dialog title="帖子详情" :value="value" v-model="visible" @close="resetFormData">
        <el-form :model="formData" label-width="80px" :rules="formRules" ref="formData" v-loading="showLoading">
            <el-form-item label="作者id">
                <el-input :disabled="isEdit" type="number" v-model.trim="formData.uid" style="width: 200px;"
                          auto-complete="off"></el-input>
            </el-form-item>
            <el-form-item label="帖子描述">
                <el-input type="textarea" v-model="formData.des" maxlength="30"></el-input>
                <el-select style="width: 200px;margin-top:20px;" v-model="atUser.id" filterable remote
                           loading-text="搜索中" placeholder="输入关键字查找用户" :remote-method="handleUser"
                           :loading="searchSource.loading" @change="handleSelectUser">
                    <el-option v-for="item in searchUser.list" :key="item.id" :label="item.username"
                               :value="item.id">
                    </el-option>
                </el-select>
                <el-button style="margin-top:20px;margin-left:10px;" size="small" type="primary" @click="atUserHandle">
                    插入@用户
                </el-button>
            </el-form-item>
            <el-form-item label="显示">
                <el-switch on-text="显示" off-text="隐藏" v-model="formData.del"></el-switch>
            </el-form-item>
            <el-form-item label="精华">
                <el-switch on-text="精华" off-text="取消" v-model="formData.essence"></el-switch>
            </el-form-item>
            <el-form-item label="显示时间">
                <el-col :span="11">
                    <el-date-picker :disabled="isEdit" type="datetime" placeholder="选择日期" v-model="formData.start"
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
    import {httpGet, httpPost} from '../../../api/api';

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
                    playId: '',
                    ats: [],

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
                },
                searchUser: { //搜索用户
                    loading: false,
                    list: []
                },
                atUser: {
                    id: '',
                    name: ''
                }
            }
        },
        computed: {
            detail() { //返回详情
                let _self = this;
                if (!_self.value) { //不显示的时候不请求详细
                    return;
                }
                _self.showLoading = true;
                if (_self.postsData.id) {
                    httpGet('postsDetail', {id: _self.postsData.id}, _self, function (res) {
                        _self.showLoading = false;
                        try {
                            let {error, status, data} = res;
                            _self.isEdit = true;
                            _self.formData = {
                                id: data.id,
                                uid: data.uid,
                                des: data.videoText,
                                videoId: data.videoInfoPo == null ? data.id : data.videoInfoPo.vpId,
                                start: util.timestampFormat(data.createTime),
                                del: !Boolean(data.isDel),
                                essence: Boolean(data.isEssence),
                                topicId: data.topicId,
                                playId: data.playId,
                                ats: []
                            }
                        } catch (error) {
                            util.jsErrNotify(error);
                        }
                    })
                } else {
                    _self.showLoading = false;
                    _self.isEdit = false;
                }
            }
        },
        methods: {
            change() {
                this.visible = false;
            },
            formSubmit() { //提交表单
                let _self = this;
                _self.formLoading = true;
                let paras = new FormData();
                paras.append("id", _self.formData.id);
                paras.append("uid", _self.formData.uid);
                paras.append("videoText", _self.formData.des);
                paras.append("videoResourceId", _self.formData.videoId);
                paras.append("topicId", _self.formData.topicId);
                paras.append("playId", _self.formData.playId);
                paras.append("createTime", _self.formData.start);
                paras.append("del", Number(!_self.formData.del));
                paras.append("essence", Number(_self.formData.essence));

                /*
                * 对@的用户进行校验处理
                * */
                var str = _self.formData.des;
                var reg = /@[^\s]+\s?/ig; //获取@人的规则
                var users = str.match(reg);

                var atUserArg = [];
                if (users != null) {//将描述中@的用户名提取，进行下一步与已存的@数组进行对比，排除已删掉的用户
                    for (var k = 0; k < users.length; k++) {
                        atUserArg.push(users[k].substring(1, users[k].length - 1));
                    }
                }


                var filterAtUser = [];
                for (var i = 0; i < _self.formData.ats.length; i++) {
                    for (var j = 0; j < atUserArg.length; j++) {
                        if (_self.formData.ats[i].uName == atUserArg[j]) {
                            filterAtUser.push(_self.formData.ats[i]);
                        }
                    }
                }

                paras.append("ats", JSON.stringify(filterAtUser));

                httpPost('postsEdit', paras, _self, function (res) {
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
            handleSource(query) { //搜索视频资源
                let _self = this;
                this.searchSource.loading = true;
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
                httpGet('contentSourceList', paras, _self, function (res) {
                    _self.searchSource.loading = false;
                    try {
                        let {error, status, data} = res;
                        _self.searchSource.list = data.content;
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            handleTopic(query) { //搜索话题
                let _self = this;
                _self.searchTopic.loading = true;
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
                httpGet('topicList', paras, _self, function (res) {
                    _self.searchTopic.loading = false;
                    try {
                        let {error, status, data} = res;
                        _self.searchTopic.list = data.content;
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            setStart(val) {
                this.formData.start = val;
            },
            resetFormData() { //关闭表格弹窗，重置表格数据
                let _self = this;
                _self.formLoading = false;
                _self.showLoading = false;
                _self.formData = {
                    id: '',
                    uid: '',
                    des: '',
                    videoId: '',
                    start: '',
                    del: '',
                    essence: '',
                    topicId: '',
                    playId: '',
                    ats: []
                };
                _self.searchUser = {
                    loading: false,
                    list: []
                };
                _self.postsData = {};
            },
            handleUser(queryString) { // 根据用户名进行查找
                let _self = this;
                _self.searchUser.loading = true;
                let paras = {
                    username: queryString
                };
                if(queryString){ // 存在关键字进行搜索
                   httpGet('userAtList', paras, _self, function (res) {
                       _self.searchUser.loading = false;
                       try {
                           let {error, status, data} = res;
                           _self.searchUser.list = data;
                       } catch (error) {
                           util.jsErrNotify(error);
                       }
                   }) 
                }  
            },
            handleSelectUser(id) { //选择要@的用户
                let _self = this;
                let obj = {};
                obj = _self.searchUser.list.find((item) => {
                    return item.id === id;
                });
                _self.atUser.id = id;
                _self.atUser.name = obj.username;
            },
            atUserHandle() { //向帖子描述中插入选中的用户
                let _self = this;
                _self.formData.ats.push({
                    uid: _self.atUser.id,
                    uName: _self.atUser.name
                });
                _self.formData.des += ' @' + _self.atUser.name + ' ';

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
</style>
