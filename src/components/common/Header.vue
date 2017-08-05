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
                    <el-dropdown-item>设置</el-dropdown-item>
                    <el-dropdown-item divided @click.native="logout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
            </el-dropdown>
        </el-col>
    </el-col>
</template>
<script type="es6">
    import { loginOut } from '../../api/api';

    export default {
        data() {
            return {
                sysName: '泡面TV',
                sysUserName: ''
            }
        },
        methods: {
            //退出登录
            logout: function () {
                var _this = this;
                this.$confirm('确认退出吗?', '提示', {}).then(() => {
                    loginOut().then(res => {
                        let { error, status } = res;
                        if (status !== 0) {
                            _this.$message({
                                message: error,
                                type: 'error'
                            });
                        } else {
                            sessionStorage.removeItem('user');
                            _this.$router.push({path: '/login'});
                        }
                    });
                });
            }
        },
        mounted() { //获取session
            var user = sessionStorage.getItem('user');
            if (user) {
                user = JSON.parse(user);
                this.sysUserName = user.name || '系统管理员';
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
