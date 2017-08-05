import Mock from 'mockjs';

const Attrs = [];

for (let i = 0; i < 30; i++) {
    Attrs.push(Mock.mock({
            'id': Mock.Random.increment(),
            'name': Mock.Random.cname(),
            'attr|1': [
                "1",
                "2"
            ],
            'num|1-100': 100,
            'online|1-2': true
        }
    ))
    ;
}

export { Attrs };
