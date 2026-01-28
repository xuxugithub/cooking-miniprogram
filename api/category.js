const request = require('../utils/request')

// 获取分类列表
const getCategoryList = () => {
  return request.get('/app/category/list')
}

// 根据分类ID获取菜品列表
const getDishByCategory = (categoryId, params = {}) => {
  return request.get(`/app/dish/page`, { categoryId, ...params })
}

module.exports = {
  getCategoryList,
  getDishByCategory
}