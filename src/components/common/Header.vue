<template>
    <el-col :span="24" class="header">
        <el-col :span="10" class="logo">
            {{sysName}}
        </el-col>
        <el-col :span="10">
        </el-col>
        <el-col :span="4" class="userinfo">
            <el-dropdown trigger="hover">
                <span class="el-dropdown-link userinfo-inner">{{sysUserName}}</span>
                <el-dropdown-menu slot="dropdown">
                    <!--<el-dropdown-item>我的消息</el-dropdown-item>-->
                    <el-dropdown-item @click.native="changePwd">修改密码</el-dropdown-item>
                    <el-dropdown-item divided @click.native="logout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
            </el-dropdown>
        </el-col>
        <el-dialog title="修改密码" v-model="pwdVisible" size="tiny" @close="resetPwdData" style="line-height: 1;">
            <el-form :model="pwdData" label-width="100px" :rules="rules" ref="pwdData" style="margin-bottom: -20px;">
                <el-form-item label="原始密码" prop="oldPass">
                    <el-input type="password" placeholder="请输入原始密码" v-model="pwdData.oldPass"></el-input>
                </el-form-item>
                <el-form-item label="新密码" prop="pass" required>
                    <el-input type="password" placeholder="请输入新密码，6~20个字符" v-model="pwdData.pass"></el-input>
                </el-form-item>
                <el-form-item label="确认新密码" prop="checkPass" required style="margin-bottom: -20px;">
                    <el-input type="password" placeholder="请确认新密码，6~20个字符" v-model="pwdData.checkPass"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button size="small" @click.native="pwdVisible = false">取消</el-button>
                <el-button size="small" type="primary" :loading="pwdData.loading" @click.native="pwdSubmit">确定</el-button>
            </div>
        </el-dialog>
    </el-col>
</template>
<script type="es6">
    import util from '../../api/util';
    import { httpGet, httpPost } from '../../api/api';

    export default {
        data() {
            let validatePass = (rule, value, callback) => {
                if (value === '') {
                    callback(new Error('请输入密码'));
                } else {
                    if (this.pwdData.checkPass !== '') {
                        this.$refs.pwdData.validateField('checkPass');
                    }
                    callback();
                }
            };
            let validatePass2 = (rule, value, callback) => {
                if (value === '') {
                    callback(new Error('请再次输入密码'));
                } else if (value !== this.pwdData.pass) {
                    callback(new Error('两次输入密码不一致!'));
                } else {
                    callback();
                }
            };
            return {
                sysName: '泡面TV',
                sysUserName: '',
                pwdVisible: false,
                pwdData: {
                    loading: false,
                    oldPass:'',
                    pass: '',
                    checkPass: '',
                },
                rules:{
                    oldPass:{
                        required: true, message: '请输入原始密码', trigger: 'blur'
                    },
                    pass: [
                        { validator: validatePass, trigger: 'blur' },
                        { min: 6, max: 20, message: '密码长度在6到20个字符'}
                    ],
                    checkPass: [
                        { validator: validatePass2, trigger: 'blur' },
                        { min: 6, max: 20, message: '密码长度在6到20个字符'}
                    ]
                }
            }
        },
        methods: {
            changePwd: function () { // 显示修改密码弹窗
                let _self = this;
                _self.pwdVisible = true;
                console.log(_self.pwdVisible);
            },
            pwdSubmit: function () { // 提交修改密码请求
                let _self = this;
                let user = sessionStorage.getItem('user');
                user = JSON.parse(user);
                _self.$refs['pwdData'].validate((valid) => {
                    if (valid) {
                        let paras = new FormData();
                        paras.append("username", user[0].username);
                        paras.append("oldPaaword", _self.pwdData.oldPass);
                        paras.append("newPassword1", _self.pwdData.pass);
                        paras.append("newPassword2", _self.pwdData.checkPass);
                        _self.pwdData.loading = true;
                        httpPost('changePwd', paras, _self, function (res) {
                            _self.pwdData.loading = false;
                            try {
                                _self.$message.success('修改密码成功');
                                _self.$refs['pwdData'].resetFields();
                                _self.pwdVisible = false;
                            } catch (error) {
                                util.jsErrNotify(error);
                            }
                        },function (res) {
                            _self.pwdData.loading = false;
                            _self.$message.error(res.data.error);
                        })
                    } else {
                        console.log('error submit!!');
                        return false;
                    }
                });
            },
            resetPwdData: function () { // 重置修改密码弹窗中的数据
                let _self = this;
                _self.pwdData = {
                    loading: false,
                    oldPass:'',
                    pass: '',
                    checkPass: '',
                };
                _self.$refs['pwdData'].resetFields();
            },
            //退出登录
            logout: function () {
                var _self = this;
                _self.$confirm('确认退出吗?', '提示', {}).then(() => {
                    httpGet('logout', '', _self, function (res) {
                        try {
                            sessionStorage.removeItem('user');
                            _self.$router.push({path: '/login'});
                        } catch (error) {
                            util.jsErrNotify(error);
                        }
                    })
                });
            }
        },
        mounted() { //获取session
            var user = sessionStorage.getItem('user');
            if (user) {
                user = JSON.parse(user);
                this.sysUserName = user[0].username || '系统管理员';
            }

        }
    }
</script>
<style scoped>
    .header {
        height: 60px;
        line-height: 60px;
        color: #fff;
    }

    .header .userinfo {
        text-align: right;
        padding-right: 35px;
        float: right;
    }

    .header .userinfo .userinfo-inner {
        cursor: pointer;
        color: #fff;
    }

    .header .logo {
        width: 230px;
        height: 60px;
        text-align: center;
        font-size: 22px;
        padding-left: 20px;
        padding-right: 20px;
        border-color: rgba(238, 241, 146, 0.3);
        border-right-width: 1px;
        border-right-style: solid;
    }

</style>
