// pages/profile/profile.js
const userApi = require('../../api/user')

Page({
  data: {
    userInfo: null,
    hasUserInfo: false,
    userStats: {
      fansCount: 0,
      followCount: 0
    },
    stats: {
      favoritesCount: 0,
      viewsCount: 0,
      searchCount: 0
    }
  },

  onLoad() {
    this.loadUserInfo()
    this.loadStats()
    this.loadUserStats()
  },

  onShow() {
    this.loadUserInfo()
    this.loadStats()
    this.loadUserStats()
  },

  // 加载用户信息（微信授权）
  async loadUserInfo() {
    try {
      // 先检查本地存储的用户信息
      const localUserInfo = wx.getStorageSync('userInfo')
      const token = wx.getStorageSync('token')
      
      if (localUserInfo && token) {
        this.setData({
          userInfo: localUserInfo,
          hasUserInfo: true
        })
        return
      }
      
      if (localUserInfo) {
        this.setData({
          userInfo: localUserInfo,
          hasUserInfo: true
        })
        // 尝试自动登录获取token
        this.performAutoLogin()
        return
      }
      
      // 检查是否已经授权
      const setting = await wx.getSetting()
      if (setting.authSetting['scope.userInfo']) {
        // 已授权，获取用户信息
        const userInfo = await wx.getUserInfo()
        this.setData({
          userInfo: userInfo.userInfo,
          hasUserInfo: true
        })
        // 保存到本地存储
        wx.setStorageSync('userInfo', userInfo.userInfo)
        // 执行登录
        this.performAutoLogin()
      } else {
        // 未授权，显示授权界面
        this.setData({
          hasUserInfo: false
        })
      }
    } catch (error) {
      console.log('获取用户信息失败:', error)
      this.setData({
        hasUserInfo: false
      })
    }
  },

  // 执行自动登录
  async performAutoLogin() {
    try {
      const loginRes = await wx.login()
      if (loginRes.code) {
        const userInfo = wx.getStorageSync('userInfo')
        const loginResult = await userApi.wxLogin({
          code: loginRes.code,
          userInfo: userInfo
        })
        
        if (loginResult.code === 200) {
          wx.setStorageSync('token', loginResult.data.token)
          console.log('自动登录成功')
        }
      }
    } catch (error) {
      console.log('自动登录失败:', error)
    }
  },

  // 加载统计数据
  loadStats() {
    const favorites = wx.getStorageSync('favorites') || []
    const searchHistory = wx.getStorageSync('searchHistory') || []
    const viewHistory = wx.getStorageSync('viewHistory') || []
    
    this.setData({
      stats: {
        favoritesCount: favorites.length,
        viewsCount: viewHistory.length,
        searchCount: searchHistory.length
      }
    })
  },

  // 获取用户信息授权
  async onGetUserProfile() {
    try {
      const res = await wx.getUserProfile({
        desc: '用于完善用户资料'
      })
      
      this.setData({
        userInfo: res.userInfo,
        hasUserInfo: true
      })
      
      // 保存到本地存储
      wx.setStorageSync('userInfo', res.userInfo)
      
      // 执行登录
      const loginRes = await wx.login()
      if (loginRes.code) {
        const loginResult = await userApi.wxLogin({
          code: loginRes.code,
          userInfo: res.userInfo
        })
        
        if (loginResult.code === 200) {
          wx.setStorageSync('token', loginResult.data.token)
          wx.showToast({
            title: '授权成功',
            icon: 'success'
          })
        } else {
          throw new Error(loginResult.message || '登录失败')
        }
      }
    } catch (error) {
      console.error('授权失败:', error)
      wx.showToast({
        title: '授权失败',
        icon: 'none'
      })
    }
  },

  // 加载用户统计信息
  async loadUserStats() {
    try {
      const token = wx.getStorageSync('token')
      if (!token) {
        return
      }
      
      const result = await userApi.getUserStats()
      this.setData({
        userStats: {
          fansCount: result.data.fansCount || 0,
          followCount: result.data.followCount || 0
        }
      })
    } catch (error) {
      console.log('获取用户统计信息失败:', error)
      // 设置默认值
      this.setData({
        userStats: {
          fansCount: 0,
          followCount: 0
        }
      })
    }
  },

  // 测试token（调试用）
  async testToken() {
    try {
      const token = wx.getStorageSync('token')
      console.log('当前token:', token)
      
      if (!token) {
        wx.showToast({
          title: '没有token，请先授权',
          icon: 'none'
        })
        return
      }
      
      // 测试一个需要认证的接口
      const dishApi = require('../../api/dish')
      const result = await dishApi.getHotDishes({ current: 1, size: 1 })
      
      wx.showToast({
        title: 'Token有效，接口调用成功',
        icon: 'success'
      })
      console.log('接口调用成功:', result)
    } catch (error) {
      console.error('Token测试失败:', error)
      wx.showToast({
        title: `Token测试失败: ${error.message || '未知错误'}`,
        icon: 'none'
      })
    }
  },

  // 查看收藏
  onViewFavorites() {
    wx.redirectTo({
      url: '/pages/favorites/favorites'
    })
  },

  // 清除缓存
  onClearCache() {
    wx.showModal({
      title: '提示',
      content: '确定要清除所有缓存数据吗？这将清除搜索历史、浏览记录等数据。',
      success: (res) => {
        if (res.confirm) {
          wx.clearStorageSync()
          this.setData({
            userInfo: null,
            hasUserInfo: false,
            stats: {
              favoritesCount: 0,
              viewsCount: 0,
              searchCount: 0
            }
          })
          wx.showToast({
            title: '缓存已清除',
            icon: 'success'
          })
        }
      }
    })
  },

  // 关于我们
  onAbout() {
    wx.showModal({
      title: '关于做菜小程序',
      content: '做菜小程序 v1.0.0\n\n一个专注于分享美食制作方法的小程序，让每个人都能轻松学会做菜。\n\n感谢您的使用！',
      showCancel: false,
      confirmText: '知道了'
    })
  },

  // 意见反馈
  onFeedback() {
    wx.showModal({
      title: '意见反馈',
      content: '如有任何问题或建议，请联系我们：\n\n邮箱：feedback@cooking.com\n微信：cooking_helper',
      showCancel: false,
      confirmText: '知道了'
    })
  },

  // 分享小程序
  onShareAppMessage() {
    return {
      title: '推荐一个超好用的做菜小程序',
      path: '/pages/index/index',
      imageUrl: '/images/share-cover.png'
    }
  },

  // 导航功能
  goToHome() {
    wx.redirectTo({
      url: '/pages/index/index'
    })
  },

  goToCategory() {
    wx.redirectTo({
      url: '/pages/category/category'
    })
  },

  goToFavorites() {
    wx.redirectTo({
      url: '/pages/favorites/favorites'
    })
  }
})