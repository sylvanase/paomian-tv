# 泡面后台管理

> 后台管理的源文件

## Build Setup

``` bash
# 安装依赖
npm install

# 启动本地服务 如需更改端口，修改config/index.js下dev的port，默认为8090  localhost:8090
npm run dev

# 构建生产环境压缩文件至dist文件夹
npm run build

# build for production and view the bundle analyzer report
npm run build --report
```

## 目录结构介绍 ##

	|-- build                            // webpack配置文件
	|-- config                           // 项目打包路径
	|-- src                              // 源码目录
	|   |-- components                   // 组件
	|       |-- common                   // 公共组件
	|           |-- Header.vue           // 公共头部
	|           |-- Home.vue           	 // 公共路由入口
	|           |-- Sidebar.vue          // 公共左边栏
	|		|-- page                   	 // 主要路由页面
	|           |-- login.vue            // 登录页
	|           |-- 404.vue              // 404错误页
	|           |-- content              // 内容管理
	|               |-- movie.vue        // 电影列表
	|   |-- mock                         // 本地模拟数据文件
	|   |-- router                       // 路由文件
	|   |-- App.vue                      // 页面入口文件
	|   |-- main.js                      // 程序入口文件，加载各种公共组件
	|-- static                           // 静态文件，css、img等
	|-- .babelrc                         // ES6语法编译配置
	|-- .editorconfig                    // 代码编写规格
	|-- .gitignore                       // 忽略的文件
	|-- index.html                       // 入口html文件
	|-- package.json                     // 项目及工具的依赖配置文件
	|-- README.md                        // 说明


For detailed explanation on how things work, checkout the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).
