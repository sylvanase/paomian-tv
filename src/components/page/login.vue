<template>
    <div class="login-wrap">
        <div class="pm-login">
            <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="0px" >
                <h3 class="pm-title">泡面后台</h3>
                <el-form-item prop="username">
                    <el-input v-model="ruleForm.username" placeholder="用户名"></el-input>
                </el-form-item>
                <el-form-item prop="password">
                    <el-input type="password" placeholder="密码" v-model="ruleForm.password"
                              @keyup.enter.native="submitForm('ruleForm')"></el-input>
                </el-form-item>
                <div class="login-btn">
                    <el-button type="primary" @click="submitForm('ruleForm')" :loading="logining">登录</el-button>
                </div>
            </el-form>
        </div>

    </div>
</template>
<script type="es6">
    import { requestLogin } from '../../api/api';
    export default {
        data() {
            return {
                logining: false, //loading加载提示，锁定登录按钮避免重复提交
                ruleForm: {
                    username: '', //需要校验的参数
                    password: ''
                },
                rules: { // 必填/错误提示/触发模式
                    username: [
                        {required: true, message: '请输入用户名', trigger: 'blur'}
                    ],
                    password: [
                        {required: true, message: '请输入密码', trigger: 'blur'}
                    ]
                }
            }
        },
        methods: {
            submitForm(formName) {
                const self = this; //vue实例
                self.$refs[formName].validate((valid) => {
                    if (valid) {
                        self.logining = true;
                        var loginParams = {
                            username: self.ruleForm.username,
                            password: self.ruleForm.password
                        };
                        requestLogin(loginParams).then(res => {
                            self.logining = false;
                            let { error, status } = res;
                            if (status !== 0) {
                                self.$message({
                                    message: error,
                                    type: 'error'
                                });
                            } else {
                                let user = [loginParams];
                                sessionStorage.setItem('user', JSON.stringify(user));
                                self.$router.push({path: '/movie'}); //登录成功跳转内容管理电影列表页
                            }
                        });
                    } else {
                        console.log('error submit!!');
                        return false;
                    }
                });
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
        height: 250px;
        margin-left: -160px;
        margin-top: -130px;
        padding: 20px 40px;
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
