import Mock from 'mockjs';

const Users = [];
const UserData = [];

for (let i = 0; i < 86; i++) {
    Users.push(Mock.mock({
        id: Mock.Random.guid(),
        username: Mock.Random.cname(),
        address: Mock.mock('@county(true)'),
        'age|18-60': 1,
        birth: Mock.Random.date(),
        sex: Mock.Random.integer(0, 1),
        createTime: '1499057301803',  //创建时间
        avatarUrl: 'http://img.hb.aicdn.com/43e4c0f6c56e8067a73e76c1aae8a81f0d8a762b53d4-1bTQ3J_sq140sf',
        'fans|0-100': 1,
        'like|0-100': 1,
        phone: /\d{5,10}/,
        qqBind: /\d{5,10}/,
        wxBind: 'dfjk',
        wbBind: 'dfjkslja',
        registerDevice: 1,
        'level|0-1': 1
    }));
}



export { Users };
