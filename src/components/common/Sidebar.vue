<template>
    <aside class="menu-expanded">
        <el-menu :default-active="$route.path" class="el-menu-vertical-demo"
                 unique-opened router >
            <template v-for="(item,index) in $router.options.routes" v-if="!item.hidden">
                <el-submenu :index="index+''" v-if="!item.leaf">
                    <template slot="title">{{item.name}}</template>
                    <el-menu-item v-for="child in item.children" :index="child.path" :key="child.path" v-if="!child.hidden">{{child.name}}</el-menu-item>
                </el-submenu>
                <el-menu-item v-if="item.leaf&&item.children.length>0" :index="item.children[0].path"><i :class="item.iconCls"></i>{{item.children[0].name}}</el-menu-item>
            </template>
        </el-menu>
    </aside>
</template>

<script type="es6">
    export default {
        data() {
            return {

            }
        }
    }
</script>

<style scoped>
    aside {
        flex: 0 0 230px;
        width: 230px;
        background: rgb(238, 246, 246);
    }
    .menu-expanded{
        flex:0 0 230px;
        width: 230px;
        overflow: scroll;
    }
</style>
