// 网络请求工具
const app = getApp()

const request = (options) => {
  return new Promise((resolve, reject) => {
    // 获取token
    const token = wx.getStorageSync('token')
    
    // 构建请求头
    const header = {
      'Content-Type': 'application/json',
      ...options.header
    }
    
    // 如果有token，添加到请求头
    if (token) {
      header['token'] = token
    }
    
    wx.request({
      url: `${app.globalData.baseUrl}${options.url}`,
      method: options.method || 'GET',
      data: options.data || {},
      header: header,
      success: (res) => {
        if (res.statusCode === 200) {
          if (res.data.code === 200) {
            resolve(res.data)
          } else {
            // 如果是401错误，可能是token过期或未登录
            if (res.data.code === 401) {
              // 尝试自动登录
              autoLogin().then(() => {
                // 重新发起请求
                request(options).then(resolve).catch(reject)
              }).catch(() => {
                // 自动登录失败，显示提示
                if (res.data.message && res.data.message !== '用户未登录') {
                  wx.showToast({
                    title: res.data.message,
                    icon: 'none'
                  })
                }
                reject(res.data)
              })
            } else {
              // 其他错误
              if (res.data.message) {
                wx.showToast({
                  title: res.data.message,
                  icon: 'none'
                })
              }
              reject(res.data)
            }
          }
        } else {
          wx.showToast({
            title: '网络请求失败',
            icon: 'none'
          })
          reject(res)
        }
      },
      fail: (err) => {
        wx.showToast({
          title: '网络连接失败',
          icon: 'none'
        })
        reject(err)
      }
    })
  })
}

// 自动登录函数
const autoLogin = () => {
  return new Promise((resolve, reject) => {
    wx.login({
      success: (loginRes) => {
        if (loginRes.code) {
          // 获取用户信息
          const userInfo = wx.getStorageSync('userInfo')
          
          const loginData = {
            code: loginRes.code,
            userInfo: userInfo
          }
          
          // 调用登录接口（不使用request函数，避免循环调用）
          wx.request({
            url: `${app.globalData.baseUrl}/app/user/wx-login`,
            method: 'POST',
            data: loginData,
            header: {
              'Content-Type': 'application/json'
            },
            success: (res) => {
              if (res.statusCode === 200 && res.data.code === 200) {
                // 保存token
                wx.setStorageSync('token', res.data.data.token)
                resolve(res.data)
              } else {
                reject(res.data)
              }
            },
            fail: reject
          })
        } else {
          reject(new Error('获取微信登录凭证失败'))
        }
      },
      fail: reject
    })
  })
}

module.exports = {
  get: (url, data) => request({ url, method: 'GET', data }),
  post: (url, data) => request({ url, method: 'POST', data }),
  put: (url, data) => request({ url, method: 'PUT', data }),
  delete: (url, data) => request({ url, method: 'DELETE', data }),
  autoLogin
}