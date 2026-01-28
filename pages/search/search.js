// pages/search/search.js
const dishApi = require('../../api/dish')
const { getImageUrl, debounce } = require('../../utils/util')

Page({
  data: {
    keyword: '',
    searchHistory: [],
    hotKeywords: ['红烧肉', '宫保鸡丁', '麻婆豆腐', '糖醋排骨', '鱼香肉丝', '回锅肉'],
    searchResults: [],
    loading: false,
    hasSearched: false,
    pagination: {
      current: 1,
      size: 10,
      total: 0
    },
    hasMore: true,
    loadingMore: false
  },

  onLoad(options) {
    if (options.keyword) {
      this.setData({ keyword: decodeURIComponent(options.keyword) })
      this.performSearch()
    }
    this.loadSearchHistory()
  },

  onShow() {
    this.loadSearchHistory()
  },

  // 上拉加载更多
  onReachBottom() {
    if (this.data.hasMore && !this.data.loadingMore && this.data.hasSearched) {
      this.loadMoreResults()
    }
  },

  // 搜索输入
  onSearchInput(e) {
    this.setData({ keyword: e.detail.value })
    // 实时搜索（防抖）
    this.debouncedSearch()
  },

  // 防抖搜索
  debouncedSearch: debounce(function() {
    if (this.data.keyword.trim()) {
      this.performSearch()
    }
  }, 500),

  // 搜索确认
  onSearchConfirm() {
    if (this.data.keyword.trim()) {
      this.performSearch()
    }
  },

  // 执行搜索
  async performSearch() {
    const keyword = this.data.keyword.trim()
    if (!keyword) return

    try {
      this.setData({ 
        loading: true,
        hasSearched: true,
        pagination: { ...this.data.pagination, current: 1 },
        searchResults: [],
        hasMore: true
      })

      const params = {
        current: 1,
        size: this.data.pagination.size
      }

      const res = await dishApi.searchDish(keyword, params)
      const results = res.data?.records || []

      this.setData({
        searchResults: results,
        pagination: {
          ...this.data.pagination,
          total: res.data?.total || 0
        },
        hasMore: results.length === this.data.pagination.size,
        loading: false
      })

      // 保存搜索历史
      this.saveSearchHistory(keyword)

    } catch (error) {
      console.error('搜索失败:', error)
      this.setData({ loading: false })
      wx.showToast({
        title: '搜索失败，请重试',
        icon: 'none'
      })
    }
  },

  // 加载更多搜索结果
  async loadMoreResults() {
    if (this.data.loadingMore) return

    this.setData({ loadingMore: true })

    try {
      const newPagination = {
        ...this.data.pagination,
        current: this.data.pagination.current + 1
      }

      const params = {
        current: newPagination.current,
        size: newPagination.size
      }

      const res = await dishApi.searchDish(this.data.keyword, params)
      const newResults = res.data?.records || []

      this.setData({
        searchResults: [...this.data.searchResults, ...newResults],
        pagination: newPagination,
        hasMore: newResults.length === this.data.pagination.size,
        loadingMore: false
      })

    } catch (error) {
      console.error('加载更多失败:', error)
      this.setData({ loadingMore: false })
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
    }
  },

  // 热门关键词点击
  onHotKeywordTap(e) {
    const { keyword } = e.currentTarget.dataset
    this.setData({ keyword })
    this.performSearch()
  },

  // 搜索历史点击
  onHistoryTap(e) {
    const { keyword } = e.currentTarget.dataset
    this.setData({ keyword })
    this.performSearch()
  },

  // 清空搜索历史
  onClearHistory() {
    wx.showModal({
      title: '提示',
      content: '确定要清空搜索历史吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({ searchHistory: [] })
          wx.removeStorageSync('searchHistory')
          wx.showToast({
            title: '已清空',
            icon: 'success'
          })
        }
      }
    })
  },

  // 菜品点击事件
  onDishTap(e) {
    const { dish } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/dish-detail/dish-detail?id=${dish.id}`
    })
  },

  // 加载搜索历史
  loadSearchHistory() {
    const history = wx.getStorageSync('searchHistory') || []
    this.setData({ searchHistory: history })
  },

  // 保存搜索历史
  saveSearchHistory(keyword) {
    let history = wx.getStorageSync('searchHistory') || []
    
    // 移除重复项
    history = history.filter(item => item !== keyword)
    
    // 添加到开头
    history.unshift(keyword)
    
    // 限制历史记录数量
    if (history.length > 10) {
      history = history.slice(0, 10)
    }
    
    wx.setStorageSync('searchHistory', history)
    this.setData({ searchHistory: history })
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