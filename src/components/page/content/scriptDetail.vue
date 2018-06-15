<template>
    <el-dialog :title="formTitle" :value="value" v-model="visible" :close-on-click-modal="false" @close="resetFormData">
        <el-form :model="formData" label-width="80px" ref="formData">
            <el-form-item label="片段类型" prop="showType" required>
                <el-select size="small" v-model="formData.showType" :disabled="formSelect" placeholder="请选择"
                           style="width: 200px;">
                    <el-option label="横竖屏" value="0"></el-option>
                    <el-option label="横屏" value="1"></el-option>
                    <el-option label="竖屏" value="2"></el-option>
                </el-select>
            </el-form-item>
            <!--素材模板-->
            <el-form-item v-for="(item, index) in formData.materialJson" :label="'素材模板'"
                          :prop="'materialJson.' + index+ '.data.second'"
                          :rules="[{ type: 'number', message: '时长必须为数字'}]">
                <template v-if="item.type == 0">
                    <el-card class="box-card">
                        <div class="clearfix">
                            <span style="line-height: 36px;">用户视频（id：{{ index+1 }}）</span>
                            <el-button style="float: right;" type="danger" size="small"
                                       @click.prevent="removeMaterial(item)">删除
                            </el-button>
                        </div>
                        <div class="mb-10">
                            <el-input placeholder="请输入数字" type="number"
                                      size="small" v-model.number="item.data.second"
                                      style="width: 260px;margin-right: 10px;">
                                <template slot="prepend">时长(秒)</template>
                            </el-input>
                            <el-switch v-model="item.data.muteOrNot" width="60" on-text="静音"
                                       off-text="静音"></el-switch>
                        </div>
                        <div class="mb-10">
                            <el-select v-model="item.data.filterId" size="small" placeholder="请选择滤镜"
                                       style="width: 200px;">
                                <el-option v-for="item in filterSelect" :label="item.name"
                                           :value="item.id"></el-option>
                            </el-select>
                        </div>
                        <div class="mb-10">
                            <el-select size="small" v-model="item.data.speed" placeholder="请选择速度"
                                       style="width: 150px;">
                                <el-option label="正常" value="0"></el-option>
                                <el-option label="很快" value="1"></el-option>
                                <el-option label="很慢" value="2"></el-option>
                            </el-select>
                        </div>
                        <div class="mb-10">
                            台词文件: <input type="file" :ref="'lrc' + index"  @change="uploadLrc(index)" name="lrc">
                            <!-- <el-progress size="small" style="width: 70%;" :percentage="item.data.lrcPer"></el-progress> -->
                            <div v-show="item.data.promptName">
                               已选台词名称：{{ item.data.promptName }} 
                            </div>
                        </div>
                        <div>
                            示范视频: <input type="file" :ref="'video' + index" @change="uploadVideo(index)" name="video">
                            <el-progress size="small" style="width: 70%;" :percentage="item.data.videoPer"></el-progress>
                            <div v-show="item.data.exampleVideoId">
                                已选视频id：{{ item.data.exampleVideoId}}
                            </div>
                        </div>
                    </el-card>
                </template>
                <template v-else-if="item.type == 1">
                    <el-card class="box-card">
                        <div class="clearfix">
                            <span style="line-height: 36px;">转场（id：{{ index+1 }}）</span>
                            <el-button style="float: right;" type="danger" size="small"
                                       @click.prevent="removeMaterial(item)">删除
                            </el-button>
                        </div>
                        <div>
                            <el-select size="small" v-model="item.data.turnTypeId" placeholder="请选择转场类型"
                                       style="width: 150px;">
                                <el-option label="无" value="0"></el-option>
                                <el-option label="淡入淡出" value="1"></el-option>
                            </el-select>
                        </div>
                    </el-card>
                </template>
                <template v-else-if="item.type == 2">
                    <el-card class="box-card">
                        <div class="clearfix">
                            <span style="line-height: 36px;">素材片段（id：{{ index+1 }}）</span>
                            <el-button style="float: right;" type="danger" size="small"
                                       @click.prevent="removeMaterial(item)">删除
                            </el-button>
                        </div>
                        <div class="mb-10">
                            <template>
                                <el-select size="small" style="width: 200px;" v-model="item.data.materialId"
                                           filterable remote
                                           loading-text="搜索中" placeholder="输入关键词搜索素材片段"
                                           :remote-method="handleMaterial" :loading="searchMaterial.loading">
                                    <el-option v-for="item in searchMaterial.list"
                                               :label="item.name" :value="item.id+','+item.name">
                                    </el-option>
                                </el-select>
                            </template>
                            <el-switch v-model="item.data.muteOrNot" width="60" on-text="静音"
                                       off-text="静音"></el-switch>
                        </div>
                        <div>
                            <el-select size="small" v-model="item.data.filterId" placeholder="请选择滤镜"
                                       style="width: 200px;">
                                <el-option v-for="item in filterSelect" :label="item.name"
                                           :value="item.id">
                                </el-option>
                            </el-select>
                        </div>
                    </el-card>
                </template>
                <template v-else-if="item.type == 3">
                    <el-card class="box-card">
                        <div class="clearfix">
                            <span style="line-height: 36px;">重复片段（id：{{ index+1 }}）</span>
                            <el-button style="float: right;" type="danger" size="small"
                                       @click.prevent="removeMaterial(item)">删除
                            </el-button>
                        </div>
                        <div>
                            <template>
                                <label>片段id：</label>
                                <el-input-number v-model="item.data.repeatId" :min="1"></el-input-number>
                            </template>
                            <div slot="tip" class="el-upload__tip">请注意：只能填写用户片段的id，不能填写其他id</div>
                        </div>
                    </el-card>
                </template>
            </el-form-item>
            <el-form-item label="素材组合" prop="materialType" required>
                <el-select size="small" v-model="formData.materialType" placeholder="请选择"
                           style="width: 200px;margin-right: 20px;">
                    <el-option label="用户视频" value="0"></el-option>
                    <el-option label="转场" value="1"></el-option>
                    <el-option label="素材片段" value="2"></el-option>
                    <el-option label="重复片段" value="3"></el-option>
                </el-select>
                <el-button size="small" type="info" @click.native="addMaterial">添加</el-button>
            </el-form-item>
            <el-form-item label="背景音乐">
                <div class="mb-10">
                    <div slot="tip" class="el-upload__tip">
                        已选音乐id：<span class="mr-10" v-model="formData.musicId">{{ formData.musicId }}</span>
                        <el-button type="danger" size="small" @click.prevent="clearMusicId">删除</el-button>
                        <span>（可从本地上传音乐或者从音乐库中选择音乐）</span>
                    </div>
                    <input type="file" id="musicFile" @change="changeFile"/>
                    <el-button style="margin-left: 10px;" size="small" type="success" @click="submitUploadKs">上传到服务器
                    </el-button>
                    <el-progress size="small" style="width: 70%;" :percentage="fileUpload.percentage"></el-progress>
                </div>
                <template>
                    <el-select size="small" v-model="searchMusic.id" style="width: 50%;" filterable remote
                               loading-text="搜索中"
                               placeholder="输入关键词搜索音乐" :remote-method="handleMusic"
                               :loading="searchMusic.loading" @change="handleMusicChange">
                        <el-option v-for="item in searchMusic.list" :key="item.musicId" :label="item.name"
                                   :value="item.musicId"></el-option>
                    </el-select>
                </template>
            </el-form-item>
            <!--字幕模板-->
            <el-form-item v-for="(item, index) in formData.subtitleJson" :label="'字幕' + (index + 1)"
                          :prop="'subtitleJson.' + index">
                <el-card class="box-card">
                    <div class="clearfix">
                        <el-button style="float: right;" type="danger" size="small"
                                   @click.prevent="removeSubtitle(item)">删除
                        </el-button>
                    </div>
                    <div class="mb-10">
                        <el-input size="small" style="width:250px;margin-right: 10px;" placeholder="请输入数字"
                                  v-model.number="item.startTime" type="number">
                            <template slot="prepend">开始时间(秒)</template>
                        </el-input>
                        <template>
                            <label>帧数：</label>
                            <el-input-number size="small" style="width:100px;" v-model="item.startFrame" :min="0"
                                             :max="24"></el-input-number>
                        </template>
                    </div>
                    <div class="mb-10">
                        <el-input placeholder="请输入数字" size="small" style="width:250px;margin-right: 10px;"
                                  v-model.number="item.endTime" type="number">
                            <template slot="prepend">结束时间(秒)</template>
                        </el-input>
                        <template>
                            <label>帧数：</label>
                            <el-input-number size="small" style="width:100px;" v-model="item.endFrame" :min="0"
                                             :max="24"></el-input-number>
                        </template>
                    </div>
                    <div class="mb-10">
                        <el-input type="textarea" minlength="1" maxlength="64" :rows="2" placeholder="请输入字幕"
                                  v-model="item.subtitle"></el-input>
                    </div>
                    <div class="mb-10">
                        <el-select size="small" v-model="item.wordPositionId" placeholder="请选择"
                                   style="width: 150px;margin-right: 10px;">
                            <el-option label="距离左中" value="0"></el-option>
                            <el-option label="距离左下" value="1"></el-option>
                            <el-option label="距离中中" value="2"></el-option>
                            <el-option label="距离下中" value="3"></el-option>
                            <el-option label="距离右下" value="4"></el-option>
                            <el-option label="距离右中" value="5"></el-option>
                        </el-select>
                        <el-input placeholder="请输入数字" size="small" style="width: 150px;margin-right: 10px;"
                                  v-model.number="item.wordPositionLeft" type="number">
                            <template slot="prepend">left(px)</template>
                        </el-input>
                        <el-input placeholder="请输入数字" size="small" style="width: 150px;"
                                  v-model.number="item.wordPositionTop" type="number">
                            <template slot="prepend">top(px)</template>
                        </el-input>
                    </div>
                </el-card>
            </el-form-item>
            <el-form-item label="字幕">
                <el-button type="info" size="small" @click.native="addSubtitle">添加</el-button>
            </el-form-item>
            <el-form-item label="完整台词">
                <input type="file" id="allLrc" @change="uploadLrc()" name="lrc">
                <!-- <el-progress size="small" style="width: 70%;" :percentage="formData.lrcPercent"></el-progress> -->
                <div v-show="formData.lrcName">
                   已选台词名称：<span class="mr-10" v-model="formData.lrcName">{{ formData.lrcName }}</span>
                </div>
            </el-form-item>
            <el-form-item label="完整视频" style="margin-bottom: -20px;">
                <input type="file" id="allVideo" @change="uploadVideo()" name="video">
                <el-progress size="small" style="width: 70%;" :percentage="formData.videoPercent"></el-progress>
                <div v-show="formData.demoId">
                    已选视频id：<span class="mr-10" v-model="formData.demoId">{{ formData.demoId }}</span></div>
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
    import  Ks3 from '../../../../static/js/ksyun/ks3jssdk.js'

    export default {
        name: 'vScriptDetail',
        props: ['value', 'scriptData'],
        data() {
            return {
                visible: false, //默认隐藏
                showLoading: false,
                formTitle: '新增剧本素材', //编辑脚本
                formLoading: false,
                formData: {
                    id: '',
                    playId: '', //剧本id
                    showType: '1',
                    musicId: '',
                    materialType: '0',
                    materialJson: [],
                    subtitleJson: [],
                    lrcUrl: '',
                    lrcName: '',
                    demoId : '',
                    lrcPercent: 0,
                    VideoPercent: 0
                },
                formSelect: false,
                searchMaterial: { //搜索素材库
                    loading: false,
                    list: []
                },
                repeatMaterial: { //重复素材列表
                    list: []
                },
                filterSelect: util.filterDate, //滤镜数据
                fileUpload: {
                    percentage: 0,
                    name: ''
                },
                searchMusic: { //搜索音乐
                    loading: false,
                    id: '',
                    list: []
                }
            }
        },
        computed: {
            detail(){ //返回详情
                if(!this.value){ // 隐藏时不进行后续操作
                    return;
                }
                let _self = this;
                // 只有剧本id，无素材id时为新增操作
                if( _self.scriptData.scriptId == ''){
                    _self.formData.playId =  _self.scriptData.playId
                }else{
                    _self.formTitle = '编辑剧本素材';
                    _self.formSelect = true;
                    _self.searchMusic.id = '';
                    httpGet('contentPlayScriptDetail', {id: _self.scriptData.scriptId}, _self, function (res) {
                        try {
                            let { error, status,data } = res;
                            var materialArr = data.typeContent; //处理接口素材数据
                            for (var k = 0, length = materialArr.length; k < length; k++) {
                                if (materialArr[k].type == 0) { //将0|1处理为布尔值
                                    materialArr[k].data.muteOrNot = Boolean(materialArr[k].data.muteOrNot);
                                    materialArr[k].data.speed = materialArr[k].data.speed + '';
                                }
                                if (materialArr[k].type == 1) { //将下拉框值处理为字符串
                                    materialArr[k].data.turnTypeId = materialArr[k].data.turnTypeId + '';
                                }
                                if (materialArr[k].type == 2) { //将素材片段选项value与label拼凑
                                    materialArr[k].data.muteOrNot = Boolean(materialArr[k].data.muteOrNot);
                                    _self.searchMaterial.list.push({
                                        id: materialArr[k].data.materialId,
                                        name: materialArr[k].data.materialName
                                    });
                                    materialArr[k].data.materialId = materialArr[k].data.materialId + ',' + materialArr[k].data.materialName;
                                }
                                materialArr[k].data.prompt = materialArr[k].data.prompt ? materialArr[k].data.prompt : '';
                                materialArr[k].data.lrcPer = 0; // 上传的进度条
                                materialArr[k].data.videoPer = 0;
                                materialArr[k].data.promptName = materialArr[k].data.promptName ? materialArr[k].data.promptName : '';
                                materialArr[k].data.exampleVideoId = materialArr[k].data.exampleVideoId ? materialArr[k].data.exampleVideoId : '';
                            }
                            data.subtitleDtoList = data.subtitleDtoList.map(function (item) {
                                item.wordPositionId = item.wordPositionId + '';
                                return item;
                            });
                            _self.formData = {
                                id: _self.scriptData.scriptId,
                                playId: _self.scriptData.playId, //剧本id
                                showType: data.showType + '',
                                musicId: data.musicId,
                                materialType: '0',
                                materialJson: materialArr,
                                subtitleJson: data.subtitleDtoList,
                                lrcUrl: data.prompt,
                                lrcName: data.promptName,
                                demoId : data.demoId ? data.demoId : ''
                            }
                        } catch (error) {
                            util.jsErrNotify(error);
                        }
                    })
                }

                let clearFile = document.getElementById('musicFile');
                if (clearFile) {
                    clearFile.outerHTML = clearFile.outerHTML;
                }
                _self.fileUpload.percentage = 0;
                if(document.getElementById('allLrc')){
                    document.getElementById('allLrc').value = '';
                }
                if(document.getElementById('allVideo')){
                    document.getElementById('allVideo').value = '';
                } 
            }
        },
        methods: {
            formSubmit(){ //提交表单
                let _self = this;
                _self.formLoading = true;
                let para = new FormData();
                para.append("id", _self.formData.id);
                para.append("playId", _self.formData.playId);
                para.append("showType", _self.formData.showType);
                para.append("musicId", _self.formData.musicId);
                if( _self.formData.lrcUrl != null ){
                    para.append("completeLinesUrl", _self.formData.lrcUrl);
                    para.append("completeLinesFileName", _self.formData.lrcName);
                }
                para.append("demoId", _self.formData.demoId == undefined ? '' : _self.formData.demoId);
                //处理需要转换的素材数据
                let materialObj = _self.formData.materialJson;
                let materialArr = [];
                for (var k = 0, length = materialObj.length; k < length; k++) {
                    if (materialObj[k].type == 0) {
                        materialArr.push({
                            'type': materialObj[k].type,
                            'data': {
                                'autoId': k + 1,
                                'speed': materialObj[k].data.speed,
                                'second': materialObj[k].data.second,
                                'filterId': materialObj[k].data.filterId,
                                'muteOrNot': Number(materialObj[k].data.muteOrNot),
                                'prompt': materialObj[k].data.prompt,
                                'promptName': materialObj[k].data.promptName,
                                'exampleVideoId': materialObj[k].data.exampleVideoId
                            }
                        });
                    } else if (materialObj[k].type == 1) {
                        materialArr.push({
                            'type': materialObj[k].type,
                            'data': {
                                'autoId': k + 1,
                                'turnTypeId': materialObj[k].data.turnTypeId
                            }
                        });
                    } else if (materialObj[k].type == 2) {
                        let str = materialObj[k].data.materialId;
                        materialArr.push({
                            'type': materialObj[k].type,
                            'data': {
                                'autoId': k + 1,
                                'filterId': materialObj[k].data.filterId,
                                'muteOrNot': Number(materialObj[k].data.muteOrNot),
                                'materialId': str.split(',')[0],
                                'materialName': str.split(',')[1]
                            }
                        });
                    } else if (materialObj[k].type == 3) {
                        materialArr.push({
                            'type': materialObj[k].type,
                            'data': {
                                'autoId': k + 1,
                                'repeatId': materialObj[k].data.repeatId
                            }
                        });
                    }
                }
                para.append("materialJson", JSON.stringify(materialArr));
                para.append("subtitleJson", JSON.stringify(_self.formData.subtitleJson));
                httpPost('contentPlayScriptEdit', para, _self, function (res) {
                    _self.formLoading = false;
                    try {
                        _self.$message.success('提交成功');
                        _self.$refs['formData'].resetFields();
                        _self.visible = false;
                        _self.$emit('refresh');
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            change() {
                this.visible = false;
            },
            resetFormData(){ //关闭表格弹窗，重置表格数据
                let _self = this;
                _self.formData = {
                    id: '',
                    playId: '', //剧本id
                    showType: '1',
                    musicId: '',
                    materialType: '0',
                    materialJson: [],
                    subtitleJson: []
                };
                _self.formSelect = false;
                _self.formTitle = '新增剧本素材';
                _self.searchMusic.id = '';
                _self.scriptData = {};
            },
            removeSubtitle(item) { //移除字幕dom
                var index = this.formData.subtitleJson.indexOf(item);
                if (index !== -1) {
                    this.formData.subtitleJson.splice(index, 1)
                }
            },
            addSubtitle() { //增加字幕dom
                this.formData.subtitleJson.push({
                    subtitle: '',
                    startTime: 0,
                    startFrame: 0,
                    endTime: 0,
                    endFrame: 0,
                    wordPositionId: '0',
                    wordPositionLeft: 0,
                    wordPositionTop: 0
                });
            },
            handleMaterial(query){ //搜索相关电影操作
                let _self = this;
                _self.searchMaterial.loading = true;
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
                httpGet('contentMaterialList', para, _self, function (res) {
                    _self.searchMaterial.loading = false;
                    try {
                        let { error, status,data } = res;
                        _self.searchMaterial.list = data.content;
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            removeMaterial(item) { //移除素材组合dom
                var index = this.formData.materialJson.indexOf(item);
                if (index !== -1) {
                    this.formData.materialJson.splice(index, 1)
                }
            },
            addMaterial() { //增加素材组合dom
                this.formData.materialJson.push({
                    'type': this.formData.materialType,
                    'data': {
                        'speed': '0',
                        'repeatId': 1,
                        'second': 0,
                        'filterId': 0,
                        'muteOrNot': false,
                        'turnTypeId': '0',
                        'materialId': [],
                        'prompt': '',
                        'promptName': '',
                        'lrcPer': 0,
                        'videoPer': 0,
                        'exampleVideoId': ''
                    }
                });
            },
            changeFile(){ //更改视频文件，名称、上传进度、videoId 重置
                let file = document.getElementById('musicFile').files[0];
                this.fileUpload.percentage = 0;
            },
            submitUploadKs(){ //文件上传至金山
                let file = document.getElementById('musicFile').files[0];
                let _self = this;
                if (!file) { //未选择文件
                    _self.$message({
                        message: '请先选择文件',
                        type: 'error'
                    });
                    return;
                }

                const isMp3 = file.type === 'audio/mp3';
                if (!isMp3) {
                    this.$message.error('只可以上传mp3格式');
                    return;
                }

                let para = {
                    contentType: file.type,
                    fileName: file.name
                };
                httpGet('musicSign', para, _self, function (res) { //服务器端获取上传所需签名
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
                                let paras = new FormData();
                                paras.append("objectKey", data.formParam.key);
                                paras.append("name", file.name);
                                httpPost('musicUpload', paras, _self, function (res) {
                                    try {
                                        let { error, status,data } = res;
                                        _self.formData.musicId = data.id;
                                    } catch (error) {
                                        util.jsErrNotify(error);
                                    }
                                })


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
            },
            clearMusicId(){ //清除音乐id
                this.formData.musicId = '';
                let clearFile = document.getElementById('musicFile');
                if (clearFile) {
                    clearFile.outerHTML = clearFile.outerHTML;
                }
                this.fileUpload.percentage = 0;
                this.searchMusic.id = '';
            },
            handleMusic(query){ //搜索音乐资源
                let _self = this;
                _self.searchMusic.loading = true;
                let para = {
                    type: 0,
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
                httpGet('contentMusicList', para, _self, function (res) {
                    _self.searchMusic.loading = false;
                    try {
                        let { error, status,data } = res;
                        _self.searchMusic.list = data.content;
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            handleMusicChange(value){ //更改背景音乐选择
                this.searchMusic.id = value;
                this.formData.musicId = value;
            },
            uploadLrc(index){ // 上传台词
                let _self = this;
                let file;
                if(index == undefined){ // 未传递index，为完整台词
                    file = document.getElementById('allLrc').files[0];
                } else {
                    file = _self.$refs['lrc' + index][0].files[0];
                }
                if (!file) { //未选择文件
                    return;
                }

                const isLrc = file.name.slice(-3) === 'lrc';
                if (!isLrc) {
                    if(index == undefined){
                        document.getElementById('allLrc').value = '';
                    }else{
                        _self.$refs['lrc' + index][0].value = '';
                    }
                    _self.$message.error('请选择lrc格式的文件');
                    return;
                }
                let para = new FormData();
                para.append('lrcFile', file);
                httpPost('lrcUpload', para, _self, function (res) { //服务器端获取上传所需签名
                    try {
                        let { error, status,data } = res;
                        if(index == undefined){ // 未传递index，为完整台词
                            _self.formData.lrcUrl = data.completeLinesUrl;
                            _self.formData.lrcName = data.completeLinesFileName;
                        } else {
                            _self.formData.materialJson[index].data.prompt = data.completeLinesUrl;
                            _self.formData.materialJson[index].data.promptName = data.completeLinesFileName;
                        } 
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            uploadVideo(index){ // 上传示范视频
                let _self = this;
                let file;

                if(index == undefined){ // 未传递index，为完整视频
                    file = document.getElementById('allVideo').files[0];
                } else {
                    file = _self.$refs['video' + index][0].files[0];
                }
                if (!file) { //未选择文件
                    return;
                }
                const isMp4 = file.type === 'video/mp4';
                if (!isMp4) {
                    if(index == undefined){
                        document.getElementById('allVideo').value = '';
                    }else{
                        _self.$refs['video' + index][0].value = '';
                    }
                    _self.$message.error('请选择mp4格式文件');
                    return;
                }

                if(index == undefined){
                    _self.formData.videoPercent = 0;
                }else{
                    _self.formData.materialJson[index].data.videoPer = 0;
                }

                let para = {
                    contentType: file.type,
                    fileName: file.name
                };
                httpGet('videoSign', para, _self, function (res) { //服务器端获取上传所需签名
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
                                if(index == undefined){
                                    _self.formData.videoPercent = 0;
                                    document.getElementById('allVideo').value = '';
                                }else{
                                    _self.$refs['video' + index][0].value = '';
                                    _self.formData.materialJson[index].data.videoPer = 0;
                                }
                            } else { //上传成功回调
                                let paras = new FormData();
                                paras.append("objectKey", data.formParam.key);
                                paras.append("name", file.name);
                                httpPost('videoUpload', paras, _self, function (res) {
                                    try {
                                        let { error, status,data } = res;
                                        if(index == undefined){ // 未传递index，为完整台词
                                            _self.formData.demoId = data.id;
                                        } else {
                                            _self.formData.materialJson[index].data.exampleVideoId = data.id;
                                        } 
                                    } catch (error) {
                                        util.jsErrNotify(error);
                                    }
                                })
                            }
                        });
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
                function progressFunction(e) {
                    if (e.lengthComputable) {
                        let percent = parseInt((e.loaded / e.total) * 100);
                        if(index == undefined){
                            _self.formData.videoPercent = percent;
                        }else{
                            _self.formData.materialJson[index].data.videoPer = percent;
                        }
                    }
                }
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
