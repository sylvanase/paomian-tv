import Mock from 'mockjs';

const Movies = [];

for (let i = 0; i < 30; i++) {
    Movies.push(Mock.mock({
    id: Mock.Random.increment(), //id
    name: Mock.Random.cname(), //电影名称
    createTime: '1499057301803'  //创建时间
  }));
}

export { Movies };
