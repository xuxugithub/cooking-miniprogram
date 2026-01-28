// pages/favorites/favorites.js
const { getImageUrl } = require('../../utils/util')

Page({
  data: {
    favorites: [],
    loading: true
  },

  onLoad() {
    this.loadFavorites()
  },

  onShow() {
    this.loadFavorites()
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadFavorites().then(() => {
      wx.stopPullDownRefresh()
    })
  },

  // 加载收藏列表
  async loadFavorites() {
    try {
      this.setData({ loading: true })
      
      // 从本地存储获取收藏列表
      const favorites = wx.getStorageSync('favorites') || []
      
      this.setData({
        favorites,
        loading: false
      })
    } catch (error) {
      console.error('加载收藏失败:', error)
      this.setData({ loading: false })
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
    }
  },

  // 菜品点击事件
  onDishTap(e) {
    const { dish } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/dish-detail/dish-detail?id=${dish.id}`
    })
  },

  // 取消收藏
  onRemoveFavorite(e) {
    const { dish } = e.currentTarget.dataset
    
    wx.showModal({
      title: '提示',
      content: `确定要取消收藏"${dish.name}"吗？`,
      success: (res) => {
        if (res.confirm) {
          this.removeFavorite(dish.id)
        }
      }
    })
  },

  // 移除收藏
  async removeFavorite(dishId) {
    try {
      // 先尝试调用后端接口
      let backendResult = null
      try {
        const dishApi = require('../../api/dish')
        const response = await dishApi.toggleFavorite(dishId)
        backendResult = response.data
        console.log('后端取消收藏接口调用成功:', backendResult)
      } catch (error) {
        console.log('后端取消收藏接口调用失败，使用本地存储:', error)
      }
      
      // 更新本地存储
      let favorites = wx.getStorageSync('favorites') || []
      favorites = favorites.filter(item => item.id !== dishId)
      
      wx.setStorageSync('favorites', favorites)
      this.setData({ favorites })
      
      // 显示操作结果
      const message = backendResult ? backendResult.message : '已取消收藏'
      wx.showToast({
        title: message,
        icon: 'success'
      })
    } catch (error) {
      console.error('取消收藏失败:', error)
      wx.showToast({
        title: '操作失败',
        icon: 'none'
      })
    }
  },

  // 清空收藏
  onClearAll() {
    if (this.data.favorites.length === 0) return
    
    wx.showModal({
      title: '提示',
      content: '确定要清空所有收藏吗？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('favorites')
          this.setData({ favorites: [] })
          wx.showToast({
            title: '已清空收藏',
            icon: 'success'
          })
        }
      }
    })
  },

  // 获取图片URL
  getImageUrl(imagePath) {
    return getImageUrl(imagePath)
  },

  // 获取难度文本
  getDifficultyText(difficulty) {
    const map = { 1: '简单', 2: '中等', 3: '困难' }
    return map[difficulty] || '未知'
  },

  // 获取难度颜色
  getDifficultyColor(difficulty) {
    const map = { 1: '#67c23a', 2: '#e6a23c', 3: '#f56c6c' }
    return map[difficulty] || '#909399'
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

  goToProfile() {
    wx.redirectTo({
      url: '/pages/profile/profile'
    })
  }
})