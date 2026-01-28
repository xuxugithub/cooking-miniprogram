const request = require('../utils/request')

// 获取菜品分页列表
const getDishPage = (params) => {
  return request.get('/app/dish/page', params)
}

// 根据ID获取菜品详情
const getDishById = (id) => {
  return request.get(`/app/dish/${id}`)
}

// 获取菜品制作步骤
const getDishSteps = (dishId) => {
  return request.get(`/app/dish-step/list/${dishId}`)
}

// 获取菜品食材
const getDishIngredients = (dishId) => {
  return request.get(`/app/dish-ingredient/list/${dishId}`)
}

// 搜索菜品
const searchDish = (keyword, params = {}) => {
  return request.get('/app/dish/search', { keyword, ...params })
}

// 获取热门菜品
const getHotDishes = (params = {}) => {
  return request.get('/app/dish/hot', params)
}

// 获取推荐菜品
const getRecommendDishes = (params = {}) => {
  return request.get('/app/dish/recommend', params)
}

// 增加浏览量
const increaseViewCount = (dishId) => {
  return request.post(`/app/dish/${dishId}/view`)
}

// 收藏/取消收藏菜品
const toggleFavorite = (dishId) => {
  return request.post(`/app/dish/${dishId}/favorite`)
}

// 记录用户浏览历史
const recordViewHistory = (dishId) => {
  return request.post(`/app/dish/${dishId}/view-history`)
}

// 获取个人推荐菜品列表（基于用户浏览历史）
const getPersonalRecommendDishes = (params = {}) => {
  return request.get('/app/dish/personal-recommend', params)
}

// 获取所有菜品列表（支持多种排序）
const getAllDishes = (params = {}) => {
  return request.get('/app/dish/all', params)
}

module.exports = {
  getDishPage,
  getDishById,
  getDishSteps,
  getDishIngredients,
  searchDish,
  getHotDishes,
  getRecommendDishes,
  increaseViewCount,
  toggleFavorite,
  getPersonalRecommendDishes,
  getAllDishes,
  recordViewHistory
}