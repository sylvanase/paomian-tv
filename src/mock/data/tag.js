import Mock from 'mockjs';

const Tags = [];

for (let i = 0; i < 30; i++) {
    Tags.push(Mock.mock({
    id: Mock.Random.increment(),
    name: Mock.Random.cname(),
    createTime: Mock.Random.date()
  }));
}

export { Tags };
