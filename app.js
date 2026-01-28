// app.js
App({
  onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 尝试自动登录
    this.autoLogin()
  },

  // 自动登录
  async autoLogin() {
    try {
      const userInfo = wx.getStorageSync('userInfo')
      const token = wx.getStorageSync('token')
      
      // 如果已有用户信息但没有token，尝试登录
      if (userInfo && !token) {
        const loginRes = await wx.login()
        if (loginRes.code) {
          // 调用登录接口
          wx.request({
            url: `${this.globalData.baseUrl}/app/user/wx-login`,
            method: 'POST',
            data: {
              code: loginRes.code,
              userInfo: userInfo
            },
            header: {
              'Content-Type': 'application/json'
            },
            success: (res) => {
              if (res.statusCode === 200 && res.data.code === 200) {
                wx.setStorageSync('token', res.data.data.token)
                console.log('应用启动自动登录成功')
              }
            },
            fail: (error) => {
              console.log('应用启动自动登录失败:', error)
            }
          })
        }
      }
    } catch (error) {
      console.log('应用启动自动登录异常:', error)
    }
  },

  globalData: {
    userInfo: null,
    baseUrl: 'http://localhost:8080', // 后端服务地址
    apiUrl: 'http://localhost:8080/api' // API地址
  }
})