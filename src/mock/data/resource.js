import Mock from 'mockjs';

const Resource = [];

for (let i = 0; i < 30; i++) {
    Resource.push(
        Mock.mock({
                'id': Mock.Random.increment(),
                'name': Mock.Random.cname(),
                'size': Mock.Random.increment(),
                'time': Mock.Random.time(),
                'url': 'https://cdn.selz.com/plyr/1.0/movie.mp4'
            }
        )
    );
}

export { Resource };
