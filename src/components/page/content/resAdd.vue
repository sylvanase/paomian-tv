<template>
    <el-dialog title="新增视频资源" :value="value" v-model="visible" :close-on-click-modal="false" @close="resetFormData">
        <div>
            <input style="display: none;" multiple type="file" name="file" id="videoFile" @change="changeFile"/>
            <el-button size="small" :disabled="formLoading" type="primary" @click="chooseFile">选择文件</el-button>
            <el-button style="margin-left: 10px;" :disabled="formLoading" size="small" type="success"
                       @click="submitUploadKs">上传文件
            </el-button>
            <span style="margin-left: 10px;" class="el-upload__tip">
                tips:按住ctrl/command可多选文件，最多支持30个
            </span>
        </div>
        <ul class="el-upload-list mt-10" style="width: 80%;">
            <li v-for="item in fileList">
                <div class="el-upload-list__item-name">
                    {{ item.name }}
                </div>
                <el-progress :percentage="item.percentage"></el-progress>
                <div class="el-upload__tip">
                    文件状态：{{ item.tips }}
                </div>
            </li>
        </ul>
    </el-dialog>
</template>

<script type="es6">
    import util from '../../../api/util'
    import { httpGet, httpPost} from '../../../api/api';
    import  Ks3 from '../../../../static/js/ksyun/ks3jssdk.js'

    export default {
        name: 'vAdd',
        props: ['value'],
        data() {
            return {
                visible: false, //默认隐藏
                formLoading: false,
                fileList: []
            }
        },
        methods: {
            chooseFile(){
                let fileDom = document.getElementById('videoFile');
                fileDom.click();
            },
            changeFile(){ // 更改视频文件
                let fileDom = document.getElementById('videoFile');
                let _self = this;
                _self.fileList = [];
                if (fileDom.files.length > 30) {
                    _self.$message.warning('文件数不得超过30');
                    fileDom.value = '';
                    return;
                }
                if (0 < fileDom.files.length <= 30) { // 文件长度大于0
                    for (var i = 0; i < fileDom.files.length; i++) {
                        let reg = /\.\w+$/;
                        let str = fileDom.files[i].name; // 获取文件名
                        if (fileDom.files[i].type !== 'video/mp4') { // 如果有文件的类型不是mp4，跳出循环
                            _self.$message.error('选择的文件中存在不是MP4类型，请重新选择');
                            _self.fileList = [];
                            break;
                        }
                        _self.fileList.push({
                            name: str.replace(reg, ''),
                            percentage: 0,
                            objectKey: '',
                            tips:'等待上传'
                        });
                    }
                } else {
                    fileDom.value = '';
                }
            },
            submitUploadKs(){ //文件上传至金山
                let fileDom = document.getElementById('videoFile');
                let _self = this;
                if (fileDom.files.length == 0) {
                    _self.$message.warning('请选择视频文件');
                    return;
                }
                _self.fileUpload(0);
            },
            fileUpload(index){
                console.log('fileUpload:' + index)
                let fileDom = document.getElementById('videoFile');
                let _self = this;
                let paras = {
                    contentType: fileDom.files[index].type,
                    fileName: fileDom.files[index].name
                };
                httpGet('videoSign', paras, _self, function (res) {
                    try {
                        let { error, status,data } = res;
                        Ks3.Ks3.config.baseUrl = data.url;
                        Ks3.Ks3.config.AK = data.formParam.KSSAccessKeyId;
                        Ks3.Ks3.config.bucket = data.bucketName;
                        Ks3.Ks3.putObject({
                            Key: data.formParam.key,
                            File: fileDom.files[index],
                            ACL: 'public-read',
                            ProgressListener: progressFunction, //上传进程
                            Signature: data.formParam.signature
                        }, function (err) {
                            if (err) { //上传失败
                                _self.fileList[index].tips = '上传至金山失败';
                                _self.fileUpload(index + 1); // 上传失败跳至下一文件
                            } else { //上传成功回调
                                _self.fileList[index].objectKey = data.formParam.key;
                                _self.fileList[index].tips = '上传至金山成功，开始添加至列表中';
                                let paras = new FormData();
                                paras.append("objectKey", _self.fileList[index].objectKey);
                                paras.append("name", _self.fileList[index].name);
                                _self.formLoading = true;
                                httpPost('videoUpload', paras, _self, function (res) {
                                    try {
                                        _self.fileList[index].tips = '添加至列表成功';
                                        if (index == fileDom.files.length - 1) { // 如果是最后一个文件，将loading置为false
                                            _self.formLoading = false;
                                            // _self.$message.success('提交成功');
                                            document.getElementById('videoFile').value = '';
                                        } else {
                                            _self.fileUpload(index + 1);
                                        }
                                    } catch (error) {
                                        util.jsErrNotify(error);
                                    }
                                }, function (res) {
                                    _self.fileList[index].tips = '添加至列表失败，原因：（' + res.data.error + '）';
                                    _self.fileUpload(index + 1); // 上传失败跳至下一文件
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
                        _self.fileList[index].percentage = percent;
                    }
                }
            },
            change() {
                this.visible = false;
            },
            resetFormData(){ //关闭表格弹窗，重置表格数据
                let _self = this;
                _self.fileList = [];
                document.getElementById('videoFile').value = '';
                _self.$emit('refresh');
            }
        },
        watch: {
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
