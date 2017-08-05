import Mock from 'mockjs';

const Categories = [];

for (let i = 0; i < 30; i++) {
    Categories.push(
        Mock.mock({
            'id': Mock.Random.increment(),
            'name': Mock.Random.cname(),
            'attr|1': [
                "1",
                "2"
            ],
            'num|1-100': 100
        }
    ));
}

export { Categories };
