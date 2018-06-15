import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import {
    LoginUsers
} from './data/login';

import {
    Users
} from './data/user';

import {
    Movies
} from './data/movie';

import {
    Dramas
} from './data/drama';

import {
    Tags
} from './data/tag';

import {
    Attrs
} from './data/attr';

import {
    Categories
} from './data/category';

import {
    Resource
} from './data/resource';


let _Users = Users;

let _Movies = Movies;

let _Dramas = Dramas;

let _Tags = Tags;

let _Attr = Attrs;

let _Categories = Categories;

let _Resource = Resource;

export default {
    /**
     * mock dataModel
     */
    dataModel() {
        let mock = new MockAdapter(axios);

        // mock success request
        mock.onGet('/success').reply(200, {
            msg: 'success'
        });

        // mock error request
        mock.onGet('/error').reply(500, {
            msg: 'failure'
        });

        //登录
        mock.onPost('/login/ajax').reply(config => {
            let {
                username,
                password
            } = JSON.parse(config.data);
            return new Promise((resolve, reject) => {
                let user = null;
                setTimeout(() => {
                    let hasUser = LoginUsers.some(u => {
                        if (u.username === username && u.password === password) {
                            user = JSON.parse(JSON.stringify(u));
                            user.password = undefined;
                            return true;
                        }
                    });

                    if (hasUser) {
                        resolve([200, {
                            status: 0,
                            msg: '请求成功',
                            user
                        }]);
                    } else {
                        resolve([200, {
                            status: 500,
                            msg: '账号或密码错误!'
                        }]);
                    }
                }, 1000);
            });
        });

        //获取电影列表
        mock.onGet('/content/movie/list').reply(config => {
            let {
                name
            } = config.params;
            let mockMovies = _Movies.filter(movie => {
                if (name && movie.name.indexOf(name) == -1) return false;
                return true;
            });
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    resolve([200, {
                        status: 0,
                        msg: '请求成功',
                        data: {
                            content: mockMovies,
                            totalElements: 10
                        }
                    }]);
                }, 1000);
            });
        });

        mock.onGet('/movie/del').reply(config => {
            let {
                id
            } = config.params;
            _Movies = _Movies.filter(u => u.id !== id);
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    resolve([200, {
                        code: 200,
                        msg: '删除成功'
                    }]);
                }, 500);
            });
        });

        mock.onGet('/movie/edit').reply(config => {
            let {
                id,
                name
            } = config.params;
            _Movies.some(u => {
                if (u.id === id) {
                    u.name = name;
                    return true;
                }
            });
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    resolve([200, {
                        code: 200,
                        msg: '编辑成功'
                    }]);
                }, 500);
            });
        });

        mock.onGet('/movie/add').reply(config => {
            let {
                name
            } = config.params;
            _Movies.push({
                name: name
            });
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    resolve([200, {
                        code: 200,
                        msg: '新增成功'
                    }]);
                }, 500);
            });
        });

        /*
         * 剧本开始
         * */
        mock.onGet('/drama/list').reply(config => {
            let {
                name
            } = config.params;
            let mockDramas = _Dramas.filter(drama => {
                if (name && drama.name.indexOf(name) == -1) return false;
                return true;
            });
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    resolve([200, {
                        dramas: mockDramas
                    }]);
                }, 1000);
            });
        });

        mock.onGet('/drama/del').reply(config => {
            let {
                id
            } = config.params;
            _Dramas = _Dramas.filter(u => u.id !== id);
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    resolve([200, {
                        code: 200,
                        msg: '删除成功'
                    }]);
                }, 500);
            });
        });

        mock.onGet('/drama/status').reply(config => {
            let {
                id,
                online
            } = config.params;
            _Dramas.some(u => {
                if (u.id === id) {
                    u.online = online;
                    return true;
                }
            });
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    resolve([200, {
                        code: 200,
                        msg: '删除成功'
                    }]);
                }, 500);
            });
        });

        //标签
        mock.onGet('/tag/list').reply(config => {
            let {
                name
            } = config.params;
            let mockTags = _Tags.filter(movie => {
                if (name && movie.name.indexOf(name) == -1) return false;
                return true;
            });
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    resolve([200, {
                        tags: mockTags
                    }]);
                }, 1000);
            });
        });

        mock.onGet('/tag/del').reply(config => {
            let {
                id
            } = config.params;
            _Tags = _Tags.filter(u => u.id !== id);
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    resolve([200, {
                        code: 200,
                        msg: '删除成功'
                    }]);
                }, 500);
            });
        });

        mock.onGet('/tag/edit').reply(config => {
            let {
                id,
                name
            } = config.params;
            _Tags.some(u => {
                if (u.id === id) {
                    u.name = name;
                    return true;
                }
            });
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    resolve([200, {
                        code: 200,
                        msg: '编辑成功'
                    }]);
                }, 500);
            });
        });

        mock.onGet('/tag/add').reply(config => {
            let {
                name
            } = config.params;
            _Tags.push({
                name: name
            });
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    resolve([200, {
                        code: 200,
                        msg: '新增成功'
                    }]);
                }, 500);
            });
        });

        //属性
        mock.onGet('/attr/list').reply(config => {
            let {
                name
            } = config.params;
            let mockAttr = _Attr.filter(movie => {
                if (name && attr.name.indexOf(name) == -1) return false;
                return true;
            });
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    resolve([200, {
                        attrs: mockAttr
                    }]);
                }, 1000);
            });
        });

        mock.onGet('/attr/del').reply(config => {
            let {
                id
            } = config.params;
            _Attr = _Attr.filter(u => u.id !== id);
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    resolve([200, {
                        code: 200,
                        msg: '删除成功'
                    }]);
                }, 500);
            });
        });

        mock.onGet('/attr/edit').reply(config => {
            let {
                id,
                name,
                attr,
            } = config.params;
            _Attr.some(u => {
                if (u.id === id) {
                    u.name = name;
                    u.attr = attr;
                    return true;
                }
            });
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    resolve([200, {
                        code: 200,
                        msg: '编辑成功'
                    }]);
                }, 500);
            });
        });

        mock.onGet('/attr/add').reply(config => {
            let {
                name,
                attr
            } = config.params;
            _Attr.push({
                name: name,
                attr: attr
            });
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    resolve([200, {
                        code: 200,
                        msg: '新增成功'
                    }]);
                }, 500);
            });
        });

        mock.onGet('/attr/status').reply(config => {
            let {
                id,
                online
            } = config.params;
            _Attr.some(u => {
                if (u.id === id) {
                    u.online = online;
                    return true;
                }
            });
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    resolve([200, {
                        code: 200,
                        msg: '删除成功'
                    }]);
                }, 500);
            });
        });

        //分类
        mock.onGet('/category/list').reply(config => {
            let {
                name
            } = config.params;
            let mockCategories = _Categories.filter(movie => {
                if (name && resource.name.indexOf(name) == -1) return false;
                return true;
            });
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    resolve([200, {
                        resource: mockCategories
                    }]);
                }, 1000);
            });
        });

        mock.onGet('/category/del').reply(config => {
            let {
                id
            } = config.params;
            _Categories = _Categories.filter(u => u.id !== id);
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    resolve([200, {
                        code: 200,
                        msg: '删除成功'
                    }]);
                }, 500);
            });
        });

        mock.onGet('/category/edit').reply(config => {
            let {
                id,
                name,
                attr
            } = config.params;
            _Categories.some(u => {
                if (u.id === id) {
                    u.name = name;
                    //u.attr = attr;
                    return true;
                }
            });
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    resolve([200, {
                        code: 200,
                        msg: '编辑成功'
                    }]);
                }, 500);
            });
        });

        mock.onGet('/category/add').reply(config => {
            let {
                name,
                attr
            } = config.params;
            _Categories.push({
                name: name,
                attr: attr
            });
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    resolve([200, {
                        code: 200,
                        msg: '新增成功'
                    }]);
                }, 500);
            });
        });

        //资源
        mock.onGet('/resource/list').reply(config => {
            let {
                name
            } = config.params;
            let mockResource = Resource.filter(movie => {
                if (name && categories.name.indexOf(name) == -1) return false;
                return true;
            });
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    resolve([200, {
                        resource: mockResource
                    }]);
                }, 1000);
            });
        });

        mock.onGet('/resource/del').reply(config => {
            let {
                id
            } = config.params;
            _Resource = _Resource.filter(u => u.id !== id);
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    resolve([200, {
                        code: 200,
                        msg: '删除成功'
                    }]);
                }, 500);
            });
        });

        //用户
        mock.onGet('/user/list').reply(config => {
            /*let {
                name
                } = config.params;
            let mockUsers = _Users.filter(movie => {
                if (name && user.username.indexOf(name) == -1) return false;
                return true;
            });*/
            let mockUsers = _Users;
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    resolve([200, {
                        status: 0,
                        msg: '请求成功',
                        data: {
                            content: mockUsers,
                            totalElements: 10
                        }
                    }]);
                }, 1000);
            });
        });
        mock.onGet('/user/detail').reply(config => {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    resolve([200, {
                        status: 0,
                        msg: '请求成功'
                    }]);
                }, 1000);
            });
        });
    }
};