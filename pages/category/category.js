// pages/category/category.js
const categoryApi = require('../../api/category')
const dishApi = require('../../api/dish')
const { getImageUrl } = require('../../utils/util')

Page({
  data: {
    categories: [],
    currentCategoryId: null,
    currentCategoryName: '',
    dishes: [],
    loading: true,
    loadingMore: false,
    hasMore: true,
    pagination: {
      current: 1,
      size: 10,
      total: 0
    },
    type: 'category' // category | hot
  },

  onLoad(options) {
    if (options.categoryId) {
      this.setData({
        currentCategoryId: parseInt(options.categoryId),
        currentCategoryName: options.categoryName || ''
      })
      wx.setNavigationBarTitle({
        title: options.categoryName || '分类'
      })
    } else if (options.type === 'hot') {
      this.setData({
        type: 'hot',
        currentCategoryName: '热门菜品'
      })
      wx.setNavigationBarTitle({
        title: '热门菜品'
      })
    }
    
    this.loadData()
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.setData({
      pagination: { ...this.data.pagination, current: 1 },
      dishes: [],
      hasMore: true
    })
    this.loadData().then(() => {
      wx.stopPullDownRefresh()
    })
  },

  // 上拉加载更多
  onReachBottom() {
    if (this.data.hasMore && !this.data.loadingMore) {
      this.loadMoreDishes()
    }
  },

  // 加载数据
  async loadData() {
    try {
      this.setData({ loading: true })
      
      if (this.data.currentCategoryId) {
        // 加载指定分类的菜品
        await this.loadDishes()
      } else if (this.data.type === 'hot') {
        // 加载热门菜品
        await this.loadHotDishes()
      } else {
        // 加载所有分类
        await this.loadCategories()
      }
      
      this.setData({ loading: false })
    } catch (error) {
      console.error('加载数据失败:', error)
      this.setData({ loading: false })
      wx.showToast({
        title: '加载失败，请重试',
        icon: 'none'
      })
    }
  },

  // 加载分类列表
  async loadCategories() {
    const res = await categoryApi.getCategoryList()
    this.setData({
      categories: res.data || []
    })
  },

  // 加载菜品列表
  async loadDishes() {
    const params = {
      current: this.data.pagination.current,
      size: this.data.pagination.size,
      categoryId: this.data.currentCategoryId
    }
    
    const res = await categoryApi.getDishByCategory(this.data.currentCategoryId, params)
    const newDishes = res.data?.records || []
    
    this.setData({
      dishes: this.data.pagination.current === 1 ? newDishes : [...this.data.dishes, ...newDishes],
      pagination: {
        ...this.data.pagination,
        total: res.data?.total || 0
      },
      hasMore: newDishes.length === this.data.pagination.size
    })
  },

  // 加载热门菜品
  async loadHotDishes() {
    const params = {
      current: this.data.pagination.current,
      size: this.data.pagination.size
    }
    
    const res = await dishApi.getHotDishes(params)
    const newDishes = res.data?.records || []
    
    this.setData({
      dishes: this.data.pagination.current === 1 ? newDishes : [...this.data.dishes, ...newDishes],
      pagination: {
        ...this.data.pagination,
        total: res.data?.total || 0
      },
      hasMore: newDishes.length === this.data.pagination.size
    })
  },

  // 加载更多菜品
  async loadMoreDishes() {
    if (this.data.loadingMore) return
    
    this.setData({ loadingMore: true })
    
    try {
      const newPagination = {
        ...this.data.pagination,
        current: this.data.pagination.current + 1
      }
      this.setData({ pagination: newPagination })
      
      if (this.data.type === 'hot') {
        await this.loadHotDishes()
      } else {
        await this.loadDishes()
      }
    } catch (error) {
      console.error('加载更多失败:', error)
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
    } finally {
      this.setData({ loadingMore: false })
    }
  },

  // 分类点击事件
  onCategoryTap(e) {
    const { category } = e.currentTarget.dataset
    this.setData({
      currentCategoryId: category.id,
      currentCategoryName: category.name,
      dishes: [],
      pagination: { ...this.data.pagination, current: 1 },
      hasMore: true
    })
    
    wx.setNavigationBarTitle({
      title: category.name
    })
    
    this.loadDishes()
  },

  // 菜品点击事件
  onDishTap(e) {
    const { dish } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/dish-detail/dish-detail?id=${dish.id}`
    })
  },

  // 返回分类列表
  onBackToCategories() {
    this.setData({
      currentCategoryId: null,
      currentCategoryName: '',
      dishes: [],
      type: 'category'
    })
    
    wx.setNavigationBarTitle({
      title: '分类'
    })
    
    this.loadCategories()
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

  goToFavorites() {
    wx.redirectTo({
      url: '/pages/favorites/favorites'
    })
  },

  goToProfile() {
    wx.redirectTo({
      url: '/pages/profile/profile'
    })
  }
})