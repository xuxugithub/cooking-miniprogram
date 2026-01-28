// pages/index/index.js
const bannerApi = require('../../api/banner')
const dishApi = require('../../api/dish')
const categoryApi = require('../../api/category')
const { getImageUrl } = require('../../utils/util')

Page({
  data: {
    banners: [],
    categories: [],
    allDishes: [],
    loading: true,
    searchValue: '',
    // 菜品列表相关
    currentSortType: 'collect', // collect-收藏最多, view-浏览最多, latest-最新上架
    sortOptions: [
      { key: 'collect', name: '收藏最多' },
      { key: 'view', name: '浏览最多' },
      { key: 'latest', name: '最新上架' }
    ],
    pagination: {
      current: 1,
      size: 10,
      total: 0
    },
    hasMore: true,
    loadingMore: false
  },

  onLoad() {
    this.loadData()
  },

  onShow() {
    // 每次显示页面时刷新菜品数据以获取最新的浏览量
    if (this.data.allDishes.length > 0) {
      this.refreshDishData()
    }
  },

  onHide() {
    // 页面隐藏时的处理
  },

  onUnload() {
    // 页面卸载时的处理
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.setData({
      pagination: { ...this.data.pagination, current: 1 },
      allDishes: [],
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

  // 加载页面数据
  async loadData() {
    try {
      this.setData({ loading: true })
      
      console.log('开始加载数据...')
      
      const [bannerRes, categoryRes] = await Promise.all([
        bannerApi.getBannerList(),
        categoryApi.getCategoryList()
      ])

      console.log('Banner数据:', bannerRes)
      console.log('分类数据:', categoryRes)

      this.setData({
        banners: bannerRes.data || [],
        categories: (categoryRes.data || []).slice(0, 8), // 只显示前8个分类
        loading: false,
        pagination: { ...this.data.pagination, current: 1 },
        allDishes: [],
        hasMore: true
      })
      
      // 加载菜品列表
      await this.loadAllDishes()
      
      console.log('数据设置完成:', {
        banners: this.data.banners.length,
        categories: this.data.categories.length,
        allDishes: this.data.allDishes.length
      })
    } catch (error) {
      console.error('加载数据失败:', error)
      this.setData({ loading: false })
      wx.showToast({
        title: '加载失败，请重试',
        icon: 'none'
      })
    }
  },

  // 加载所有菜品列表
  async loadAllDishes() {
    try {
      const params = {
        sortType: this.data.currentSortType,
        current: this.data.pagination.current,
        size: this.data.pagination.size
      }

      const res = await dishApi.getAllDishes(params)
      const newDishes = res.data?.records || []

      this.setData({
        allDishes: this.data.pagination.current === 1 ? newDishes : [...this.data.allDishes, ...newDishes],
        pagination: {
          ...this.data.pagination,
          total: res.data?.total || 0
        },
        hasMore: newDishes.length === this.data.pagination.size
      })
    } catch (error) {
      console.error('加载菜品列表失败:', error)
      wx.showToast({
        title: '加载菜品失败',
        icon: 'none'
      })
    }
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
      
      await this.loadAllDishes()
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

  // 切换排序方式
  onSortChange(e) {
    const sortType = e.currentTarget.dataset.sort
    if (sortType === this.data.currentSortType) return
    
    this.setData({
      currentSortType: sortType,
      pagination: { ...this.data.pagination, current: 1 },
      allDishes: [],
      hasMore: true
    })
    
    this.loadAllDishes()
  },

  // Banner点击事件
  onBannerTap(e) {
    const { item } = e.currentTarget.dataset
    if (item.linkType === 'dish' && item.linkValue) {
      wx.navigateTo({
        url: `/pages/dish-detail/dish-detail?id=${item.linkValue}`
      })
    }
  },

  // 分类点击事件
  onCategoryTap(e) {
    const { category } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/category/category?categoryId=${category.id}&categoryName=${category.name}`
    })
  },

  // 菜品点击事件
  onDishTap(e) {
    const { dish } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/dish-detail/dish-detail?id=${dish.id}`
    })
  },

  // 刷新菜品数据（保持当前页面状态，只更新数据）
  async refreshDishData() {
    try {
      const params = {
        sortType: this.data.currentSortType,
        current: 1,
        size: this.data.allDishes.length || this.data.pagination.size
      }

      const res = await dishApi.getAllDishes(params)
      const refreshedDishes = res.data?.records || []

      this.setData({
        allDishes: refreshedDishes,
        pagination: {
          ...this.data.pagination,
          total: res.data?.total || 0
        }
      })
    } catch (error) {
      console.error('刷新菜品数据失败:', error)
    }
  },

  // 搜索输入
  onSearchInput(e) {
    this.setData({
      searchValue: e.detail.value
    })
  },

  // 搜索确认
  onSearchConfirm(e) {
    const keyword = e.detail.value || this.data.searchValue
    if (keyword && keyword.trim()) {
      wx.navigateTo({
        url: `/pages/search/search?keyword=${encodeURIComponent(keyword.trim())}`
      })
    }
  },

  // 搜索框点击（如果没有输入内容）
  onSearchTap(e) {
    // 如果点击的是input区域，不跳转
    if (e.target.tagName === 'INPUT') {
      return
    }
    // 如果有搜索内容，执行搜索
    if (this.data.searchValue && this.data.searchValue.trim()) {
      this.onSearchConfirm({ detail: { value: this.data.searchValue } })
    } else {
      // 否则跳转到搜索页面
      wx.navigateTo({
        url: '/pages/search/search'
      })
    }
  },

  // 获取图片URL
  getImageUrl(imagePath) {
    return getImageUrl(imagePath)
  },

  // 导航功能
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