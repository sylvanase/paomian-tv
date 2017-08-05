import Mock from 'mockjs';

const Dramas = [];

for (let i = 0; i < 30; i++) {
    Dramas.push(Mock.mock({
        'id': Mock.Random.increment(),
        'name': Mock.Random.cname(),
        'online|1-2': true,
        'desc': Mock.Random.cparagraph(),
        "movie|1-10": [
            Mock.Random.cname()
        ]
    }));
}

export { Dramas };
