const request = require('../utils/request')

// 获取Banner列表
const getBannerList = () => {
  return request.get('/app/banner/list')
}

module.exports = {
  getBannerList
}