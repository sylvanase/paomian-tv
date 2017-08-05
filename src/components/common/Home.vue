<template>
    <el-row class="container">
        <!--顶部-->
        <v-head></v-head>
        <!--主体-->
        <el-col :span="24" class="main">
            <!--导航菜单-->
            <v-sidebar></v-sidebar>
            <!--内容展示区-->
            <section class="content-container">
                <div class="grid-content bg-purple-light">
                    <!--面包屑-->
                    <!--<el-col :span="24" class="breadcrumb-container">
                        <strong class="title">{{$route.name}}</strong>
                        <el-breadcrumb separator="/" class="breadcrumb-inner">
                            <el-breadcrumb-item v-for="item in $route.matched" :key="item.path">
                                {{ item.name }}
                            </el-breadcrumb-item>
                        </el-breadcrumb>
                    </el-col>-->
                    <el-col :span="24" class="content-wrapper">
                        <transition name="fade" mode="out-in">
                            <router-view></router-view>
                        </transition>
                    </el-col>
                </div>
            </section>
        </el-col>
    </el-row>
</template>

<script type="es6">
    import vHead from './Header.vue';
    import vSidebar from './Sidebar.vue';
    export default {
        components:{
            vHead, vSidebar
        }
    }
</script>
<style>

</style>
