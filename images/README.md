# 图片资源说明

这个目录用于存放小程序所需的图片资源。

## 需要的图片文件

### TabBar图标 (建议尺寸: 81x81px)
- `home.png` - 首页图标（未选中）
- `home-active.png` - 首页图标（选中）
- `category.png` - 分类图标（未选中）
- `category-active.png` - 分类图标（选中）
- `search.png` - 搜索图标（未选中）
- `search-active.png` - 搜索图标（选中）
- `favorites.png` - 收藏图标（未选中）
- `favorites-active.png` - 收藏图标（选中）
- `profile.png` - 个人中心图标（未选中）
- `profile-active.png` - 个人中心图标（选中）

### 功能图标 (建议尺寸: 32x32px)
- `search.png` - 搜索小图标

### 占位图片
- `placeholder.png` - 默认占位图 (建议尺寸: 400x300px)
- `empty.png` - 空状态图片 (建议尺寸: 200x200px)
- `empty-favorites.png` - 收藏空状态图片 (建议尺寸: 200x200px)
- `default-avatar.png` - 默认头像 (建议尺寸: 120x120px)

### 分享图片
- `share-cover.png` - 分享封面图 (建议尺寸: 500x400px)

## 图片要求

1. **格式**: 支持 PNG、JPG、GIF、WEBP
2. **大小**: 单个图片不超过 2MB
3. **命名**: 使用小写字母和连字符，避免中文和特殊字符
4. **优化**: 建议使用工具压缩图片以减小包体积

## 使用说明

在代码中使用相对路径引用图片：
```javascript
// 正确的引用方式
src="/images/placeholder.png"
```

## 注意事项

- 小程序包体积限制为 2MB，请合理控制图片大小
- TabBar图标建议使用纯色图标，系统会自动处理选中状态
- 可以使用在线图标库或设计工具制作所需图标