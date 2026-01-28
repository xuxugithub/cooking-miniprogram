const request = require('../utils/request')

// 微信小程序登录
const wxLogin = (loginData) => {
  return request.post('/app/user/wx-login', loginData)
}

// 获取用户信息
const getUserInfo = () => {
  return request.get('/app/user/info')
}

// 获取用户统计信息
const getUserStats = () => {
  return request.get('/app/user/stats')
}

module.exports = {
  wxLogin,
  getUserInfo,
  getUserStats
}