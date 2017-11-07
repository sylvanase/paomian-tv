<template>
    <section>
        <!--顶部工具条-->
        <el-col :span="24" class="toolbar" style="padding-bottom: 0;">
            <el-form :inline="true" :model="filters">
                <el-form-item>
                    <el-input v-model="filters.kw" placeholder="ID/名称"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-select v-model="filters.type" @change="fetchList" placeholder="请选择" style="width: 150px;">
                        <el-option label="按剧本搜" value="0"></el-option>
                        <el-option label="按电影搜" value="1"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-select v-model="filters.status" @change="fetchList" placeholder="请选择" style="width: 100px;">
                        <el-option label="在线" value="1"></el-option>
                        <el-option label="离线" value="0"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="fetchList()">查询</el-button>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="showForm('-1')">新增</el-button>
                </el-form-item>
            </el-form>
        </el-col>

        <!--表格-->
        <el-table v-loading="tableLoading" class="table-expand" :data="tableList" stripe border style="width: 100%;">
            <el-table-column type="expand">
                <template scope="props">
                    <el-form label-position="left" class="table-expand">
                        <el-form-item label="相关电影：">
                            <span>{{ props.row.movieNames.join(' , ') }}</span>
                        </el-form-item>
                        <el-form-item label="剧本描述：">
                            <span>{{ props.row.description }}</span>
                        </el-form-item>
                        <template v-for="item in props.row.scriptList">
                            <el-form-item label="素材：">
                                <span class="mr-10">id： {{ item.id }}</span>
                                <span class="mr-10">类型： {{ item.showType == 1 ? '横屏' : '竖屏' }}</span>
                                <span class="mr-10">创建时间： {{ item.createTime }}</span>
                                <span>
                                    <el-button size="small" @click="scriptEdit(props.row, item.id)">编辑</el-button>
                                    <el-button type="danger" size="small" @click="scriptDel(props.row, item)">删除
                                    </el-button>
                                </span>
                            </el-form-item>
                        </template>

                    </el-form>
                </template>
            </el-table-column>
            <el-table-column prop="id" label="id" width="100"></el-table-column>
            <el-table-column prop="name" label="剧本名称"></el-table-column>
            <el-table-column prop="status" label="状态" width="80">
                <template scope="scope">
                    <el-tag :type="scope.row.status == 1 ? 'success' : 'danger'"
                            close-transition>{{ scope.row.status == 1 ? '在线' : '离线' }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column label="使用统计">
                <template scope="scope">
                    {{ scope.row.useCount ? scope.row.useCount : '0' }}次/{{ scope.row.userCount ? scope.row.userCount :
                    '0'}}人
                </template>
            </el-table-column>
            <el-table-column label="操作" width="350">
                <template scope="scope">
                    <el-button size="small" @click="showForm(scope.$index, scope.row)">编辑</el-button>
                    <el-button size="small" @click="playVideo(scope.row)">预览</el-button>
                    <el-button type="danger" size="small" @click="handleTableDel(scope.$index, scope.row)">删除
                    </el-button>
                    <el-button :type="scope.row.status == 1 ? 'danger' : 'success'" size="small"
                               @click="handleTableLine(scope.$index, scope.row)">
                        {{ scope.row.status == 1 ? '下线' : '上线' }}
                    </el-button>
                    <el-button type="info" size="small" @click="scriptEdit(scope.row, '')">添加素材</el-button>
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
        <!--新建/编辑剧本素材-->
        <el-dialog :title="scriptTitle" v-model="scriptVisible" :close-on-click-modal="false" @close="resetScriptData">
            <el-form :model="scriptData" label-width="80px" :rules="scriptRules" ref="scriptData">
                <el-form-item label="片段类型" prop="showType" required>
                    <el-select size="small" v-model="scriptData.showType" :disabled="scriptSelect" placeholder="请选择"
                               style="width: 200px;">
                        <el-option label="横竖屏" value="0"></el-option>
                        <el-option label="横屏" value="1"></el-option>
                        <el-option label="竖屏" value="2"></el-option>
                    </el-select>
                </el-form-item>

                <!--素材模板-->
                <el-form-item v-for="(item, index) in scriptData.materialJson" :label="'素材模板'"
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
                            <div>
                                <el-select size="small" v-model="item.data.speed" placeholder="请选择速度"
                                           style="width: 150px;">
                                    <el-option label="正常" value="0"></el-option>
                                    <el-option label="很快" value="1"></el-option>
                                    <el-option label="很慢" value="2"></el-option>
                                </el-select>
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
                    <el-select size="small" v-model="scriptData.materialType" placeholder="请选择"
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
                            已选音乐id：<span class="mr-10" v-model="scriptData.musicId">{{ scriptData.musicId }}</span>
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
                <el-form-item v-for="(item, index) in scriptData.subtitleJson" :label="'字幕' + (index + 1)"
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
                <el-form-item label="字幕" style="margin-bottom: -20px;">
                    <el-button type="info" size="small" @click.native="addSubtitle">添加</el-button>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button size="small" @click.native="scriptVisible = false">取消</el-button>
                <el-button size="small" type="primary" @click.native="scriptSubmit" :loading="scriptLoading">提交
                </el-button>
            </div>
        </el-dialog>

        <!--新建/编辑剧本-->
        <el-dialog :title="formTitle" v-model="formVisible" :close-on-click-modal="false" @close="resetFormData">
            <el-form :model="formData" label-width="80px" :rules="formRules" ref="formData">
                <el-form-item label="剧本名称" prop="name">
                    <el-input v-model.trim="formData.name" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="蒙太奇">
                    <el-switch on-text="是" off-text="否" v-model="formData.montageOrNot"></el-switch>
                </el-form-item>
                <el-form-item label="相关电影" prop="movieIds">
                    <template>
                        <el-select style="width: 50%;" v-model="formData.movieIds" multiple filterable remote
                                   loading-text="搜索中" placeholder="输入关键词搜索电影" :remote-method="handleMovie"
                                   :loading="searchMovie.loading">
                            <el-option v-for="item in searchMovie.list" :key="item.id" :label="item.name"
                                       :value="item.id">
                            </el-option>
                        </el-select>
                    </template>
                </el-form-item>
                <el-form-item label="剧本描述" prop="description">
                    <el-input type="textarea" v-model.trim="formData.description"></el-input>
                </el-form-item>
                <el-form-item label="预览视频" required>
                    <template>
                        <el-select style="width: 50%;" v-model="formData.previewId" filterable remote
                                   loading-text="搜索中" placeholder="输入关键词搜索视频" :remote-method="handleSource"
                                   :loading="searchSource.loading">
                            <el-option v-for="item in searchSource.list" :key="item.id" :label="item.name"
                                       :value="item.id">
                            </el-option>
                        </el-select>
                    </template>
                </el-form-item>
                <el-form-item label="视频封面" required>
                    <div class="avatar-uploader" style="width: 80%;" @click="chooseFile">
                        <div class="el-upload el-upload--text">
                            <i v-show="avatarLoading" class="el-icon-loading avatar-uploader-icon"></i>
                            <i v-show="!formData.coverImgUrl && !avatarLoading"
                               class="el-icon-plus avatar-uploader-icon"></i>
                            <img v-show="formData.coverImgUrl && !avatarLoading" :src="formData.coverImgUrl"
                                 class="avatar">
                            <input type="file" id="cover" class="el-upload__input" @change="fileChange">
                        </div>
                    </div>
                </el-form-item>
                <el-form-item label="关键字" prop="keyword">
                    <el-tag style="margin-right: 10px;" :key="word" v-for="word in formData.keyword" :closable="true"
                            :close-transition="false"
                            @close="closeWord(word)">
                        {{word}}
                    </el-tag>
                    <el-input style="width: 100px;" class="input-new-tag" v-if="inputVisible" v-model="inputValue"
                              ref="saveTagInput"
                              @keyup.enter.native="handleConfirmWord" @blur="handleConfirmWord">
                    </el-input>
                    <el-button v-else class="button-new-tag" size="small" @click="showInputWord">添加</el-button>
                </el-form-item>
                <el-form-item label="剧本标签" prop="tagIds">
                    <template>
                        <el-select style="width: 50%;" v-model="formData.tagIds" multiple filterable remote
                                   loading-text="搜索中" placeholder="输入关键词搜索标签" :remote-method="handleTag"
                                   :loading="searchTag.loading">
                            <el-option v-for="item in searchTag.list" :key="item.id" :label="item.name"
                                       :value="item.id">
                            </el-option>
                        </el-select>
                    </template>
                </el-form-item>

            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button size="small" @click.native="formVisible = false">取消</el-button>
                <el-button size="small" type="primary" @click.native="formSubmit" :loading="formLoading">提交</el-button>
            </div>
        </el-dialog>

        <!--播放弹窗-->
        <el-dialog title="剧本预览" v-model="videoVisible" @close="videoClose()">
            <div style="text-align: center;" v-html="videoHtml"></div>
        </el-dialog>
    </section>
</template>

<script type="es6">
    import util from '../../../api/util'
    import { httpGet, httpDel, httpPost } from '../../../api/api';
    import  Ks3 from '../../../../static/js/ksyun/ks3jssdk.js'

    export default {
        data() {
            return {
                filters: { //搜索筛选条件
                    type: '0',
                    status: '1',
                    kw: '',
                    id: ''
                },
                total: 0, //表格列表数据总数
                page: 1, //当前页，默认为第一页
                tableLoading: false, //表格的loading符号
                tableList: [], //表格数据
                formTitle: '',
                formVisible: false,//新增界面是否显示
                formLoading: false,
                formRules: {
                    name: [
                        {required: true, message: '请输入剧本名称', trigger: 'blur'},
                        {min: 1, max: 32, message: '长度在 1 到 32 个字符', trigger: 'blur'}
                    ],
                    description: [
                        {required: true, message: '请输入剧本描述', trigger: 'blur'},
                        {min: 1, max: 64, message: '长度在 1 到 64 个字符', trigger: 'blur'}
                    ]
                },
                //剧本表单界面数据
                formData: {
                    id: '',
                    name: '',
                    coverImgUrl: '', //封面url
                    coverId: '',
                    description: '',
                    previewId: '', //预览视频资源id及name
                    previewName: '',
                    movieIds: [], //电影id及名称
                    movieNames: [],
                    tagIds: [], //标签id及名称
                    tagNames: [],
                    keyword: [],
                    montageOrNot: ''
                },
                inputVisible: false, //隐藏、显示关键字输入框
                inputValue: '',
                avatarLoading: false,
                searchMovie: { //搜索相关电影
                    loading: false,
                    list: []
                },
                searchSource: { //搜索资源
                    loading: false,
                    list: []
                },
                searchTag: { //搜索标签
                    loading: false,
                    list: []
                },
                scriptTitle: '', //编辑脚本
                scriptVisible: false,
                scriptLoading: false,
                scriptRules: {
                    /*name: [
                     {required: true, message: '请输入剧本名称', trigger: 'blur'},
                     {min: 1, max: 32, message: '长度在 1 到 32 个字符', trigger: 'blur'}
                     ]*/
                },
                //脚本表单界面数据
                scriptData: {
                    id: '',
                    playId: '', //剧本id
                    showType: '1',
                    musicId: '',
                    materialType: '0',
                    materialJson: [],
                    subtitleJson: []
                },
                scriptSelect: false,
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
                },
                videoVisible: false,  //播放视频界面 显示、隐藏
                videoHtml: ''
            }
        },
        methods: {
            handleCurrentChange(val) { //翻页
                this.page = val;
                this.fetchList();
            },
            fetchList() { //获取列表
                let _self = this;
                let para = {
                    type: _self.filters.type,
                    status: _self.filters.status,
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
                httpGet('contentPlayList', para, _self, function (res) {
                    _self.tableLoading = false;
                    try {
                        let { error, status,data } = res;
                        _self.total = data.totalElements;
                        _self.tableList = data.content.map(function (item) {
                            if (item.scriptList.length > 0) {
                                let array = item.scriptList;
                                for (let k = 0, length = array.length; k < length; k++) {
                                    array[k].createTime = util.timestampFormat(array[k].createTime);
                                }
                            }
                            return item;
                        });
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            playVideo(row){ //播放视频
                this.videoVisible = true;
                this.videoHtml = '<video style="max-width: 100%;max-height:350px;" controls="controls" autoplay="autoplay">'
                    + '<source src="' + row.previewUrl + '" type="video/mp4">对不起，您的浏览器不支持video标签，无法播放视频。</video>';
            },
            videoClose(){
                this.videoHtml = '';
            },
            showForm (index, row){ //显示表单
                this.formVisible = true;
                if (index == -1) { //索引为-1时，新增操作
                    this.formTitle = '新增剧本';
                } else {
                    this.formTitle = '编辑剧本';
                    let _self = this;
                    httpGet('contentPlayDetail', {id: row.id}, _self, function (res) {
                        try {
                            let { error, status,data } = res;
                            _self.formData = Object.assign({}, data);
                            _self.formData.montageOrNot = Boolean(data.montageOrNot);
                            //this.formData.montage = true;
                            if (data.keyword != '') {
                                _self.formData.keyword = data.keyword.split(' ');
                            } else {
                                _self.formData.keyword = [];
                            }
                            _self.searchMovie.list = [];
                            _self.searchSource.list = [];
                            _self.searchTag.list = [];
                            //生成下拉框已选项 电影、视频、标签
                            if (_self.formData.movieIds.length > 0) {
                                let array = _self.formData.movieIds;
                                let arrayName = _self.formData.movieNames;
                                for (var k = 0, length = array.length; k < length; k++) {
                                    _self.searchMovie.list.push({
                                        name: arrayName[k],
                                        id: array[k]
                                    });
                                }
                            }
                            _self.searchSource.list.push({
                                name: _self.formData.previewName,
                                id: _self.formData.previewId
                            });
                            if (_self.formData.tagIds.length > 0) {
                                let array = _self.formData.tagIds;
                                let arrayName = _self.formData.tagNames;
                                for (var k = 0, length = array.length; k < length; k++) {
                                    _self.searchTag.list.push({
                                        name: arrayName[k],
                                        id: array[k]
                                    });
                                }
                            }
                        } catch (error) {
                            util.jsErrNotify(error);
                        }
                    })
                }
            },
            resetFormData(){ //关闭表格弹窗，重置表格数据
                let _self = this;
                _self.formData = {
                    id: '',
                    name: '',
                    coverImgUrl: '', //封面url
                    coverId: '',
                    description: '',
                    previewId: '', //预览视频资源id及name
                    previewName: '',
                    movieIds: [], //电影id及名称
                    movieNames: [],
                    tagIds: [], //标签id及名称
                    tagNames: [],
                    keyword: [],
                    montageOrNot: ''
                };
                _self.searchMovie.list = [];
                _self.searchSource.list = [];
                _self.searchTag.list = [];
                document.getElementById('cover').value = '';
            },
            formSubmit(){ //提交表格
                this.$refs.formData.validate((valid) => {
                    if (valid) {
                        let _self = this;
                        _self.formLoading = true;
                        let para = new FormData();
                        para.append("id", _self.formData.id);
                        para.append("name", _self.formData.name);
                        para.append("coverId", _self.formData.coverId);
                        para.append("description", _self.formData.description);
                        para.append("previewId", _self.formData.previewId);
                        para.append("movieIds", _self.formData.movieIds.join(','));
                        para.append("tagIds", _self.formData.tagIds.join(','));
                        para.append("montageOrNot", Number(_self.formData.montageOrNot));
                        para.append("kw", _self.formData.keyword.join(' '));
                        httpPost('contentPlayEdit', para, _self, function (res) {
                            _self.formLoading = false;
                            try {
                                let { error, status,data } = res;
                                _self.$message.success('提交成功');
                                _self.$refs['formData'].resetFields();
                                _self.formVisible = false;
                                _self.fetchList();
                            } catch (error) {
                                util.jsErrNotify(error);
                            }
                        })


                    }
                });
            },
            //删除表格数据
            handleTableDel: function (index, row) {
                let _self = this;
                _self.tableLoading = true;
                httpDel('contentPlayDel', {id: row.id}, _self, function (res) {
                    try {
                        _self.$message.success('删除成功');
                        _self.fetchList();
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            handleTableLine(index, row){
                let _self = this;
                let para = new FormData();
                para.append("id", row.id);
                para.append("status", Number(!row.status));
                httpPost('contentPlayStatus', para, _self, function (res) {
                    try {
                        let { error, status,data } = res;
                        _self.$message.success('操作成功');
                        _self.fetchList();
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            handleMovie(query){ //搜索相关电影操作
                let _self = this;
                _self.searchMovie.loading = true;
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
                httpGet('contentMovieList', para, _self, function (res) {
                    _self.searchMovie.loading = false;
                    try {
                        let { error, status,data } = res;
                        _self.searchMovie.list = data.content;
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            handleSource(query){ //搜索视频资源
                let _self = this;
                _self.searchSource.loading = true;
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
                httpGet('contentSourceList', para, _self, function (res) {
                    _self.searchSource.loading = false;
                    try {
                        let { error, status,data } = res;
                        _self.searchSource.list = data.content;
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            handleTag(query){ //搜索标签
                let _self = this;
                _self.searchTag.loading = true;
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
                httpGet('contentTagList', para, _self, function (res) {
                    _self.searchTag.loading = false;
                    try {
                        let { error, status,data } = res;
                        _self.searchTag.list = data.content;
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })

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
                this.scriptData.musicId = value;
            },
            chooseFile(){ //触发选择文件
                let fileDom = document.getElementById('cover');
                fileDom.click();
            },
            fileChange(){ // 文件变更后操作
                let fileDom = document.getElementById('cover');
                let _self = this;
                if(!fileDom){
                    return;
                }
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
            /*
             * 关键字相关操作
             * */
            closeWord(tag) { //删除关键字
                let word = this.formData.keyword;
                word.splice(word.indexOf(tag), 1);
            },
            showInputWord() { //显示关键字输入框
                this.inputVisible = true;
                this.$nextTick(_ => {
                    this.$refs.saveTagInput.$refs.input.focus();
                });
            },
            handleConfirmWord() { //确认输入的关键字
                let inputValue = this.inputValue;
                let word = this.formData.keyword;
                if (inputValue) {
                    word.push(inputValue);
                }
                this.inputVisible = false;
                this.inputValue = '';
            },
            resetScriptData(){
                this.scriptData = {
                    id: '',
                    playId: row.id, //剧本id
                    showType: '1',
                    musicId: '',
                    materialType: '0',
                    materialJson: [],
                    subtitleJson: []
                };
                this.searchMusic.id = '';
            },
            scriptEdit(row, id){ //编辑素材 剧本id、素材id ，id为空则为新增
                let _self = this;
                _self.scriptVisible = true;
                if (id == '') { //id为空，新增
                    _self.scriptTitle = '新增剧本素材';
                    _self.scriptSelect = false;
                } else {
                    _self.scriptTitle = '编辑剧本素材';
                    _self.scriptSelect = true;
                    _self.searchMusic.id = '';
                    httpGet('contentPlayScriptDetail', {id: id}, _self, function (res) {
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
                            }
                            data.subtitleDtoList = data.subtitleDtoList.map(function (item) {
                                item.wordPositionId = item.wordPositionId + '';
                                return item;
                            });
                            _self.scriptData = {
                                id: id,
                                playId: row.id, //剧本id
                                showType: data.showType + '',
                                musicId: data.musicId,
                                materialType: '0',
                                materialJson: materialArr,
                                subtitleJson: data.subtitleDtoList
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
                this.fileUpload.percentage = 0;

            },
            scriptDel (row, item){ //删除素材
                let _self = this;
                _self.tableLoading = true;
                let para = {
                    id: item.id,
                    playId: row.id,
                    showType: item.showType
                };
                httpPost('contentPlayScriptDel', para, _self, function (res) {
                    _self.tableLoading = false;
                    try {
                        let { error, status,data } = res;
                        _self.$message.success('删除成功');
                        _self.fetchList();
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            scriptSubmit(){
                let _self = this;
                _self.scriptLoading = true;
                let para = new FormData();
                para.append("id", _self.scriptData.id);
                para.append("playId", _self.scriptData.playId);
                para.append("showType", _self.scriptData.showType);
                para.append("musicId", _self.scriptData.musicId);
                //处理需要转换的素材数据
                let materialObj = _self.scriptData.materialJson;
                let materialArr = [];
                for (var k = 0, length = materialObj.length; k < length; k++) {
                    if (materialObj[k].type == 0) {
                        materialArr.push({
                            type: materialObj[k].type,
                            data: {
                                autoId: k + 1,
                                speed: materialObj[k].data.speed,
                                second: materialObj[k].data.second,
                                filterId: materialObj[k].data.filterId,
                                muteOrNot: Number(materialObj[k].data.muteOrNot)
                            }
                        });
                    } else if (materialObj[k].type == 1) {
                        materialArr.push({
                            type: materialObj[k].type,
                            data: {
                                autoId: k + 1,
                                turnTypeId: materialObj[k].data.turnTypeId
                            }
                        });
                    } else if (materialObj[k].type == 2) {
                        let str = materialObj[k].data.materialId;
                        materialArr.push({
                            type: materialObj[k].type,
                            data: {
                                autoId: k + 1,
                                filterId: materialObj[k].data.filterId,
                                muteOrNot: Number(materialObj[k].data.muteOrNot),
                                materialId: str.split(',')[0],
                                materialName: str.split(',')[1]
                            }
                        });
                    } else if (materialObj[k].type == 3) {
                        materialArr.push({
                            type: materialObj[k].type,
                            data: {
                                autoId: k + 1,
                                repeatId: materialObj[k].data.repeatId
                            }
                        });
                    }
                }
                para.append("materialJson", JSON.stringify(materialArr));
                para.append("subtitleJson", JSON.stringify(_self.scriptData.subtitleJson));
                httpPost('contentPlayScriptEdit', para, _self, function (res) {
                    _self.scriptLoading = false;
                    try {
                        let { error, status,data } = res;
                        _self.$message.success('提交成功');
                        _self.$refs['scriptData'].resetFields();
                        _self.scriptVisible = false;
                        _self.fetchList();
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            },
            removeSubtitle(item) { //移除字幕dom
                var index = this.scriptData.subtitleJson.indexOf(item);
                if (index !== -1) {
                    this.scriptData.subtitleJson.splice(index, 1)
                }
            },
            addSubtitle() { //增加字幕dom
                this.scriptData.subtitleJson.push({
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
                var index = this.scriptData.materialJson.indexOf(item);
                if (index !== -1) {
                    this.scriptData.materialJson.splice(index, 1)
                }
            },
            addMaterial() { //增加素材组合dom
                this.scriptData.materialJson.push({
                    type: this.scriptData.materialType,
                    data: {
                        speed: '0',
                        repeatId: 1,
                        second: 0,
                        filterId: 0,
                        muteOrNot: false,
                        turnTypeId: '0',
                        materialId: []
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
                                        _self.scriptData.musicId = data.id;
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
                this.scriptData.musicId = '';
                let clearFile = document.getElementById('musicFile');
                if (clearFile) {
                    clearFile.outerHTML = clearFile.outerHTML;
                }
                this.fileUpload.percentage = 0;
                this.searchMusic.id = '';
            }
        },
        mounted() {
            this.fetchList();
        }
    }


</script>

<style>
    /*
        表格展开部分样式
    */
    .table-expand label {
        width: 90px;
        color: #99a9bf;
    }

    .table-expand .el-form-item {
        margin-right: 0;
        margin-bottom: 0;
        width: 100%;
    }

</style>
