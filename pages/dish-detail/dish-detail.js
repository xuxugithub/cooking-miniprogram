// pages/dish-detail/dish-detail.js
const dishApi = require('../../api/dish')
const { getImageUrl, formatRelativeTime } = require('../../utils/util')

Page({
  data: {
    dishId: null,
    dish: null,
    steps: [],
    ingredients: [],
    loading: true,
    isFavorite: false,
    currentStepIndex: 0,
    showSteps: false,
    // 浏览记录相关
    enterTime: null,
    hasRecordedView: false,
    viewTimer: null
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ 
        dishId: options.id,
        enterTime: Date.now(),
        hasRecordedView: false
      })
      this.loadDishDetail()
      this.checkFavoriteStatus()
      // 不立即开始计时，等页面加载完成后再开始
    }
  },

  onShow() {
    // 重置进入时间（从其他页面返回时）
    if (this.data.dishId && !this.data.enterTime) {
      this.setData({ enterTime: Date.now() })
      this.startViewTimer()
    }
    // 检查收藏状态
    this.checkFavoriteStatus()
  },

  onHide() {
    // 页面隐藏时清除定时器
    this.clearViewTimer()
  },

  onUnload() {
    // 页面卸载时清除定时器
    this.clearViewTimer()
  },

  // 开始浏览计时
  startViewTimer() {
    if (this.data.hasRecordedView) return
    
    // 5秒后记录有效浏览（增加时间以确保是有意义的浏览）
    this.data.viewTimer = setTimeout(() => {
      this.recordValidView()
    }, 5000)
  },

  // 清除浏览计时器
  clearViewTimer() {
    if (this.data.viewTimer) {
      clearTimeout(this.data.viewTimer)
      this.data.viewTimer = null
    }
  },

  // 记录有效浏览
  async recordValidView() {
    if (this.data.hasRecordedView || !this.data.dishId) return
    
    this.setData({ hasRecordedView: true })
    
    try {
      // 增加浏览量
      await dishApi.increaseViewCount(this.data.dishId)
      
      // 更新本地显示的浏览量
      if (this.data.dish) {
        this.setData({
          'dish.viewCount': (this.data.dish.viewCount || 0) + 1
        })
      }
      
      // 记录用户浏览历史（尝试调用后端接口）
      try {
        await dishApi.recordViewHistory(this.data.dishId)
      } catch (error) {
        console.log('记录浏览历史失败，可能用户未登录:', error)
        // 记录到本地存储作为备选
        this.recordLocalViewHistory()
      }
    } catch (error) {
      console.error('记录浏览失败:', error)
    }
  },

  // 记录本地浏览历史
  recordLocalViewHistory() {
    try {
      const viewHistory = wx.getStorageSync('viewHistory') || []
      const dishId = this.data.dishId
      const dish = this.data.dish
      
      if (!dish) return
      
      // 查找是否已存在
      const existingIndex = viewHistory.findIndex(item => item.id == dishId)
      
      const historyItem = {
        id: dish.id,
        name: dish.name,
        image: dish.image,
        description: dish.description,
        difficulty: dish.difficulty,
        cookingTime: dish.cookingTime,
        categoryName: dish.categoryName,
        viewTime: new Date().toISOString(),
        viewCount: 1
      }
      
      if (existingIndex >= 0) {
        // 更新现有记录
        viewHistory[existingIndex] = {
          ...viewHistory[existingIndex],
          viewTime: historyItem.viewTime,
          viewCount: (viewHistory[existingIndex].viewCount || 0) + 1
        }
      } else {
        // 添加新记录
        viewHistory.unshift(historyItem)
      }
      
      // 只保留最近100条记录
      if (viewHistory.length > 100) {
        viewHistory.splice(100)
      }
      
      wx.setStorageSync('viewHistory', viewHistory)
    } catch (error) {
      console.error('记录本地浏览历史失败:', error)
    }
  },

  // 检查收藏状态
  checkFavoriteStatus() {
    const favorites = wx.getStorageSync('favorites') || []
    const isFavorite = favorites.some(item => item.id == this.data.dishId)
    this.setData({ isFavorite })
  },

  // 加载菜品详情
  async loadDishDetail() {
    try {
      this.setData({ loading: true })
      
      const [dishRes, stepsRes, ingredientsRes] = await Promise.all([
        dishApi.getDishById(this.data.dishId),
        dishApi.getDishSteps(this.data.dishId),
        dishApi.getDishIngredients(this.data.dishId)
      ])

      this.setData({
        dish: dishRes.data,
        steps: stepsRes.data || [],
        ingredients: ingredientsRes.data || [],
        loading: false
      })

      // 设置页面标题
      if (dishRes.data?.name) {
        wx.setNavigationBarTitle({
          title: dishRes.data.name
        })
      }

      // 页面加载完成后开始浏览计时
      this.startViewTimer()
    } catch (error) {
      console.error('加载菜品详情失败:', error)
      this.setData({ loading: false })
      wx.showToast({
        title: '加载失败，请重试',
        icon: 'none'
      })
    }
  },

  // 收藏/取消收藏
  async onToggleFavorite() {
    if (!this.data.dish) return
    
    try {
      let favorites = wx.getStorageSync('favorites') || []
      const dishId = this.data.dishId
      const isFavorite = favorites.some(item => item.id == dishId)
      
      // 先尝试调用后端接口
      let backendResult = null
      try {
        const response = await dishApi.toggleFavorite(this.data.dishId)
        backendResult = response.data
        console.log('后端收藏接口调用成功:', backendResult)
      } catch (error) {
        console.log('后端收藏接口调用失败，使用本地存储:', error)
      }
      
      // 根据后端结果或本地状态更新界面
      let newIsFavorite = isFavorite
      let newCollectCount = this.data.dish.collectCount || 0
      let message = ''
      
      if (backendResult) {
        // 使用后端返回的状态
        newIsFavorite = backendResult.isFavorite
        newCollectCount = backendResult.collectCount
        message = backendResult.message
      } else {
        // 使用本地逻辑
        newIsFavorite = !isFavorite
        if (newIsFavorite) {
          newCollectCount = newCollectCount + 1
          message = '已添加收藏'
        } else {
          newCollectCount = Math.max(0, newCollectCount - 1)
          message = '已取消收藏'
        }
      }
      
      // 更新本地存储
      if (newIsFavorite) {
        // 添加收藏
        const favoriteItem = {
          id: this.data.dish.id,
          name: this.data.dish.name,
          image: this.data.dish.image,
          description: this.data.dish.description,
          difficulty: this.data.dish.difficulty,
          cookingTime: this.data.dish.cookingTime,
          categoryName: this.data.dish.categoryName,
          viewCount: this.data.dish.viewCount,
          collectCount: newCollectCount,
          createTime: new Date().toISOString()
        }
        
        // 移除已存在的项目（如果有）
        favorites = favorites.filter(item => item.id != dishId)
        favorites.unshift(favoriteItem)
      } else {
        // 取消收藏
        favorites = favorites.filter(item => item.id != dishId)
      }
      
      wx.setStorageSync('favorites', favorites)
      
      // 更新界面状态
      this.setData({ 
        isFavorite: newIsFavorite,
        'dish.collectCount': newCollectCount
      })
      
      wx.showToast({
        title: message,
        icon: 'success'
      })
      
    } catch (error) {
      console.error('收藏操作失败:', error)
      wx.showToast({
        title: '操作失败',
        icon: 'none'
      })
    }
  },

  // 开始制作
  onStartCooking() {
    if (this.data.steps.length === 0) {
      wx.showToast({
        title: '暂无制作步骤',
        icon: 'none'
      })
      return
    }
    
    this.setData({
      showSteps: true,
      currentStepIndex: 0
    })
  },

  // 上一步
  onPrevStep() {
    if (this.data.currentStepIndex > 0) {
      this.setData({
        currentStepIndex: this.data.currentStepIndex - 1
      })
    }
  },

  // 下一步
  onNextStep() {
    if (this.data.currentStepIndex < this.data.steps.length - 1) {
      this.setData({
        currentStepIndex: this.data.currentStepIndex + 1
      })
    }
  },

  // 关闭制作步骤
  onCloseSteps() {
    this.setData({
      showSteps: false
    })
  },

  // 分享
  onShareAppMessage() {
    return {
      title: `推荐一道美味的${this.data.dish?.name}`,
      path: `/pages/dish-detail/dish-detail?id=${this.data.dishId}`,
      imageUrl: getImageUrl(this.data.dish?.image)
    }
  },

  // 预览图片
  onPreviewImage(e) {
    const { url } = e.currentTarget.dataset
    wx.previewImage({
      current: url,
      urls: [url]
    })
  },

  // 获取图片URL
  getImageUrl(imagePath) {
    return getImageUrl(imagePath)
  },

  // 格式化时间
  formatRelativeTime(timeStr) {
    return formatRelativeTime(timeStr)
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
  }
})