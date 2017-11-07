<template>
    <div class="login-wrap">
        <div class="pm-login">
            <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="0px">
                <h3 class="pm-title">泡面后台</h3>
                <el-form-item prop="username">
                    <el-input v-model="ruleForm.username" placeholder="邮箱"
                              @keyup.enter.native="submitForm('ruleForm')"></el-input>
                </el-form-item>
                <el-form-item prop="password">
                    <el-input type="password" placeholder="密码" v-model="ruleForm.password"
                              @keyup.enter.native="submitForm('ruleForm')"></el-input>
                </el-form-item>
                <el-form-item prop="captcha">
                    <el-row>
                        <el-col :span="13">
                            <el-input placeholder="验证码" v-model="ruleForm.captcha"
                                      @keyup.enter.native="submitForm('ruleForm')"></el-input>
                        </el-col>
                        <el-col :span="11" style="text-align: right;">
                            <el-button type="primary" @click="sendCode">发送验证码</el-button>
                        </el-col>
                    </el-row>

                </el-form-item>
                <div class="login-btn">
                    <el-button type="primary" @click="submitForm('ruleForm')" :loading="logining">登录</el-button>
                </div>
            </el-form>
        </div>

    </div>
</template>
<script type="es6">
    import util from '../../api/util'
    import { httpPost } from '../../api/api';
    export default {
        data() {
            return {
                logining: false, //loading加载提示，锁定登录按钮避免重复提交
                ruleForm: {
                    username: '', //需要校验的参数
                    password: '',
                    captcha: '' // 验证码
                },
                rules: { // 必填/错误提示/触发模式
                    username: [
                        {required: true, message: '请输入用户名', trigger: 'blur'}
                    ],
                    password: [
                        {required: true, message: '请输入密码', trigger: 'blur'}
                    ],
                    captcha: [
                        {required: true, message: '请输入验证码', trigger: 'blur'}
                    ]
                }
            }
        },
        methods: {
            submitForm(formName) {
                const _self = this; //vue实例
                _self.$refs[formName].validate((valid) => {
                    if (valid) {
                        var params = {
                            username: _self.ruleForm.username,
                            password: _self.ruleForm.password,
                            captcha: _self.ruleForm.captcha
                        };
                        _self.logining = true;
                        httpPost('login', params, _self, function (res) {
                            _self.logining = false;
                            try {
                                let { error, status,data } = res;
                                let user = [params];
                                sessionStorage.setItem('user', JSON.stringify(user));
                                _self.$router.push({path: '/movie'}); //登录成功跳转内容管理电影列表页
                            } catch (error) {
                                util.jsErrNotify(error);
                            }
                        })
                    } else {
                        console.log('error submit!!');
                        return false;
                    }
                });
            },
            sendCode(){ //发送验证码
                const _self = this; //vue实例
                if (!_self.ruleForm.username) {
                    _self.$message.warning('请先填写邮箱地址');
                    return;
                }
                let params = new FormData();
                params.append('email', _self.ruleForm.username);
                httpPost('logCode', params, _self, function (res) {
                    try {
                        _self.$message.success('验证码发送成功');
                    } catch (error) {
                        util.jsErrNotify(error);
                    }
                })
            }
        }
    }
</script>
<style scoped>
    .login-wrap {
        position: relative;
        width: 100%;
        height: 100%;
    }

    .pm-title {
        text-align: center;
        font-size: 24px;
        color: #000;
        margin-bottom: 20px;
    }

    .pm-login {
        position: absolute;
        left: 50%;
        top: 50%;
        border: 1px solid #eaeaea;
        box-shadow: 0 0 25px #cac6c6;
        box-sizing: border-box;
        width: 380px;
        height: 290px;
        margin-left: -160px;
        margin-top: -145px;
        padding: 10px 30px;
        border-radius: 5px;
        background: #fff;
    }

    .login-btn {
        text-align: center;
    }

    .login-btn button {
        width: 100%;
        height: 36px;
    }
</style>
