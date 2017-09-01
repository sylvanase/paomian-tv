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
                    <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'"
                            close-transition>{{ scope.row.status === 1 ? '在线' : '离线' }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column label="操作" width="350">
                <template scope="scope">
                    <el-button size="small" @click="showForm(scope.$index, scope.row)">编辑</el-button>
                    <el-button type="danger" size="small" @click="handleTableDel(scope.$index, scope.row)">删除
                    </el-button>
                    <el-button :type="scope.row.status === 1 ? 'danger' : 'success'" size="small"
                               @click="handleTableLine(scope.$index, scope.row)">
                        {{ scope.row.status === 1 ? '下线' : '上线' }}
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
        <el-dialog :title="scriptTitle" v-model="scriptVisible" :close-on-click-modal="false">
            <el-form :model="scriptData" label-width="80px" :rules="scriptRules" ref="scriptData">
                <el-form-item label="片段类型" prop="showType" required>
                    <el-select size="small" v-model="scriptData.showType" :disabled="scriptSelect" placeholder="请选择"
                               style="width: 200px;">
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
                        <input type="file" name="file" id="musicFile" @change="changeFile"/>
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
                <el-form-item v-for="(item, index) in scriptData.subtitleJson" :label="'字幕' + index"
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
                                                 :max="29"></el-input-number>
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
                                                 :max="29"></el-input-number>
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
                <el-button size="small" type="primary" @click.native="scriptSubmit" :loading="scriptLoading">提交</el-button>
            </div>
        </el-dialog>

        <!--新建/编辑剧本-->
        <el-dialog :title="formTitle" v-model="formVisible" :close-on-click-modal="false">
            <el-form :model="formData" label-width="80px" :rules="formRules" ref="formData">
                <el-form-item label="剧本名称" prop="name">
                    <el-input v-model.trim="formData.name" auto-complete="off"></el-input>
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
                    <el-upload style="width: 80%;" :disabled="avatarDisabled" class="avatar-uploader" ref="upload"
                               action="" :show-file-list="false" :on-change="avatarChange" :auto-upload="false"
                               :before-upload="beforeAvatarUpload">
                        <img v-if="formData.coverImgUrl" v-model="formData.coverId" :src="formData.coverImgUrl"
                             class="avatar">
                        <i v-else class="el-icon-plus avatar-uploader-icon"></i>
                    </el-upload>
                    <el-button :loading="avatarLoading" type="primary" size="small" @click="submitUpload">上传
                    </el-button>
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
    </section>
</template>

<script type="es6">
    import util from '../../../api/util'
    import { tableListApi, tableDelApi, tableStatusApi, tableEditApi, tableDetailApi, imgUploadApi, scriptDelApi, scriptDetailApi,scriptEditApi, signatureApi, uploadCallbackApi } from '../../../api/api';
    import  Ks3 from '../../../../static/js/ksyun/ks3jssdk.js'

    export default {
        data() {
            return {
                api: 'play',
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
                    keyword: []
                },
                inputVisible: false, //隐藏、显示关键字输入框
                inputValue: '',
                avatarLoading: false,
                avatarDisabled: false,
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
                }
            }
        },
        methods: {
            handleCurrentChange(val) { //翻页
                this.page = val;
                this.fetchList();
            },
            fetchList() { //获取列表
                let para = {
                    type: this.filters.type,
                    status: this.filters.status,
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
                tableListApi(this.api, para).then((res) => {
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
                            if (item.scriptList.length > 0) {
                                let array = item.scriptList;
                                for (let k = 0, length = array.length; k < length; k++) {
                                    array[k].createTime = util.timestampFormat(array[k].createTime);
                                }
                            }
                            return item;
                        });
                        this.tableLoading = false;
                    }
                });
            },
            showForm (index, row){ //显示表单
                this.formVisible = true;
                if (index == -1) { //索引为-1时，新增操作
                    this.formTitle = '新增剧本';
                    this.formData = {
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
                        keyword: []
                    };
                    this.searchMovie.list = [];
                    this.searchSource.list = [];
                    this.searchTag.list = [];
                } else {
                    this.formTitle = '编辑剧本';
                    let para = {id: row.id};
                    tableDetailApi(this.api, para).then((res) => {
                        let { error, status,data } = res;
                        this.formData = Object.assign({}, data);
                        if (data.keyword != '') {
                            this.formData.keyword = data.keyword.split(' ');
                        } else {
                            this.formData.keyword = [];
                        }
                        this.searchMovie.list = [];
                        this.searchSource.list = [];
                        this.searchTag.list = [];
                        //生成下拉框已选项 电影、视频、标签
                        if (this.formData.movieIds.length > 0) {
                            let array = this.formData.movieIds;
                            let arrayName = this.formData.movieNames;
                            for (var k = 0, length = array.length; k < length; k++) {
                                this.searchMovie.list.push({
                                    name: arrayName[k],
                                    id: array[k]
                                });
                            }
                        }
                        this.searchSource.list.push({
                            name: this.formData.previewName,
                            id: this.formData.previewId
                        });
                        if (this.formData.tagIds.length > 0) {
                            let array = this.formData.tagIds;
                            let arrayName = this.formData.tagNames;
                            for (var k = 0, length = array.length; k < length; k++) {
                                this.searchTag.list.push({
                                    name: arrayName[k],
                                    id: array[k]
                                });
                            }
                        }
                    });
                }
            },
            formSubmit(){ //提交表格
                this.$refs.formData.validate((valid) => {
                    if (valid) {
                        this.formLoading = true;
                        let para = new FormData();
                        para.append("id", this.formData.id);
                        para.append("name", this.formData.name);
                        para.append("coverId", this.formData.coverId);
                        para.append("description", this.formData.description);
                        para.append("previewId", this.formData.previewId);
                        para.append("movieIds", this.formData.movieIds.join(','));
                        para.append("tagIds", this.formData.tagIds.join(','));
                        para.append("kw", this.formData.keyword.join(' '));
                        tableEditApi(this.api, para).then((res) => {
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
                                this.$refs['formData'].resetFields();
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
                    tableDelApi(this.api, para).then((res) => {
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
                })
            },
            handleTableLine(index, row){
                let para = new FormData();
                para.append("id", row.id);
                para.append("status", Number(!row.status));
                tableStatusApi(this.api, para).then((res) => {
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
                        this.$message.success('操作成功');
                        this.fetchList();
                    }
                });
            },
            handleMovie(query){ //搜索相关电影操作
                this.searchMovie.loading = true;
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
                tableListApi('movie', para).then((res) => {
                    let { error, status,data } = res;
                    this.searchMovie.loading = false;
                    this.searchMovie.list = data.content;
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
                    this.searchSource.loading = false;
                    this.searchSource.list = data.content;
                });
            },
            handleTag(query){ //搜索标签
                this.searchTag.loading = true;
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
                tableListApi('tag', para).then((res) => {
                    let { error, status,data } = res;
                    this.searchTag.loading = false;
                    this.searchTag.list = data.content;
                });
            },
            handleMusic(query){ //搜索音乐资源
                this.searchMusic.loading = true;
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
                tableListApi('music', para).then((res) => {
                    let { error, status,data } = res;
                    this.searchMusic.loading = false;
                    this.searchMusic.list = data.content;
                });
            },
            handleMusicChange(value){ //更改背景音乐选择
                this.searchMusic.id = value;
                this.scriptData.musicId = value;
            },
            /*
             * 封面选择相关操作
             * */
            avatarChange(file){ //更改图片时,重置预览文件路径
                this.formData.coverImgUrl = file.url;
            },
            beforeAvatarUpload(file) { //上传前校验
                const isType = file.type.substring(0, 5);
                const isJPG = isType === 'image';
                const isLt2M = file.size / 1024 / 1024 <= 10;

                if (!isJPG) {
                    this.$message.error('封面文件必须是图片类型!');
                }
                if (!isLt2M) {
                    this.$message.error('上传图片大小不能超过 10MB!');
                }
                return isJPG && isLt2M;
            },
            submitUpload() { //上传图片
                var imgFile = document.getElementsByName('file')[0].files[0];
                if (imgFile == undefined) { //file为空，提示并返回
                    this.$message.warning('请选择或更换图片');
                    return;
                }
                if (!this.beforeAvatarUpload(imgFile)) {
                    return;
                }
                let para = new FormData();
                para.append("imageFile", imgFile);
                imgUploadApi(para).then((res) => {
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
            scriptEdit(row, id){ //编辑素材 剧本id、素材id ，id为空则为新增
                this.scriptVisible = true;
                if (id == '') { //id为空，新增
                    this.scriptTitle = '新增剧本素材';
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
                    this.scriptSelect = false;
                } else {
                    this.scriptTitle = '编辑剧本素材';
                    this.scriptSelect = true;
                    this.searchMusic.id = '';
                    let para = {id: id};
                    scriptDetailApi(para).then((res) => {
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
                                this.searchMaterial.list.push({
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
                        this.scriptData = {
                            id: id,
                            playId: row.id, //剧本id
                            showType: data.showType + '',
                            musicId: data.musicId,
                            materialType: '0',
                            materialJson: materialArr,
                            subtitleJson: data.subtitleDtoList
                        }
                    });
                }

                let clearFile = document.getElementById('musicFile');
                if (clearFile) {
                    clearFile.outerHTML = clearFile.outerHTML;
                }
                this.fileUpload.percentage = 0;

            },
            scriptDel (row, item){ //删除素材
                this.$confirm('确认删除该素材吗?', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.tableLoading = true;
                    let para = {
                        id: item.id,
                        playId: row.id,
                        showType: item.showType
                    };
                    scriptDelApi(para).then((res) => {
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
                })
            },
            scriptSubmit(){
                this.scriptLoading = true;
                /*let para = Object.assign({}, this.scriptData);
                 */
                let para = new FormData();
                para.append("id", this.scriptData.id);
                para.append("playId", this.scriptData.playId);
                para.append("showType", this.scriptData.showType);
                para.append("musicId", this.scriptData.musicId);
                //处理需要转换的素材数据
                let materialObj = this.scriptData.materialJson;
                let materialArr = [];
                for (var k = 0, length = materialObj.length; k < length; k++) {
                    if (materialObj[k].type == 0) {
                        materialArr.push({
                            type: materialObj[k].type,
                            data: {
                                autoId: k+1,
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
                                autoId: k+1,
                                turnTypeId: materialObj[k].data.turnTypeId
                            }
                        });
                    } else if (materialObj[k].type == 2) {
                        let str = materialObj[k].data.materialId;
                        materialArr.push({
                            type: materialObj[k].type,
                            data: {
                                autoId: k+1,
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
                                autoId: k+1,
                                repeatId: materialObj[k].data.repeatId
                            }
                        });
                    }
                }
                para.append("materialJson", JSON.stringify(materialArr));
                para.append("subtitleJson", JSON.stringify(this.scriptData.subtitleJson));
                scriptEditApi(para).then((res) => {
                    this.scriptLoading = false;
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
                        this.$refs['scriptData'].resetFields();
                        this.scriptVisible = false;
                        this.fetchList();
                    }
                });
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
                this.searchMaterial.loading = true;
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
                tableListApi('material', para).then((res) => {
                    let { error, status,data } = res;
                    this.searchMaterial.loading = false;
                    this.searchMaterial.list = data.content;
                });
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
                //服务器端获取上传所需签名
                signatureApi('music', para).then((res) => {
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
                                let paras = new FormData();
                                paras.append("objectKey", data.formParam.key);
                                paras.append("name", file.name);
                                uploadCallbackApi('music', paras).then((res) => {
                                    let { error, status,data } = res;
                                    if (status !== 0) {
                                        if (status == 403) { //返回403时，重新登录
                                            sessionStorage.removeItem('user');
                                            _self.$router.push('/login');
                                        } else {
                                            _self.$message.error(error);
                                        }
                                    } else {
                                        _self.scriptData.musicId = data.id;
                                    }
                                });
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
