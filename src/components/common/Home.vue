<template>
    <el-row class="container">
        <!--顶部-->
        <v-head></v-head>
        <!--主体-->
        <el-col :span="24" class="main">
            <!--导航菜单-->
            <v-sidebar></v-sidebar>
            <!--内容展示区-->
            <section class="content-container" id="container">
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
                <transition name="back-top-fade">
                    <div class="page-component-up" :class="{ 'hover': hover }" v-show="showBackToTop"
                         @mouseenter="hover = true" @mouseleave="hover = false" @click="toTop">
                        <i class="el-icon-caret-top"></i>
                    </div>
                </transition>
            </section>
        </el-col>
    </el-row>
</template>

<script type="es6">
    import vHead from './Header.vue';
    import vSidebar from './Sidebar.vue';
    import throttle from 'throttle-debounce/throttle';

    export default {
        components: {
            vHead, vSidebar
        },
        data() {
            return {
                hover: false,
                showBackToTop: false
            };
        },
        methods: {
            toTop() {
                this.showBackToTop = false;
                document.body.scrollTop = 0;
                document.getElementById('container').scrollTop = 0;
            },
            handleScroll() {
                this.showBackToTop = (document.body.scrollTop || document.getElementById('container').scrollTop) >= 0.5 * document.getElementById('container').clientHeight;
            }
        },
        mounted() {
            this.throttledScrollHandler = throttle(300, this.handleScroll);
            document.getElementById('container').addEventListener('scroll', this.throttledScrollHandler);
        },
        beforeDestroy() {
            if(document.getElementById('container')){
                document.getElementById('container').removeEventListener('scroll', this.throttledScrollHandler);
            }
        }
    }
</script>
<style>
    .page-component-up {
        background-color: #fff;
        position: fixed;
        right: 30px;
        bottom: 150px;
        width: 40px;
        height: 40px;
        border-radius: 20px;
        cursor: pointer;
        transition: .3s;
        box-shadow: 0 0 6px rgba(0, 0, 0, .12);
        z-index: 5;
    }

    .page-component-up.hover {
        opacity: 1;
    }

    .page-component-up i {
        color: #409eff;
        display: block;
        line-height: 40px;
        text-align: center;
        font-size: 16px;
    }
    .back-top-fade-enter,.back-top-fade-leave-active {
        transform: translateY(-30px);
        opacity: 0;
    }
</style>
