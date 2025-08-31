# Fiber Network Website

A modern, responsive static website for Fiber Network - Satoshi's P2P Ecash Vision.

## 特性

- 📱 **响应式设计** - 支持所有设备尺寸
- ⚡ **高性能** - 纯静态 HTML/CSS/JS，无框架依赖
- 🎨 **现代 UI** - 使用渐变、动画和现代设计元素
- 🖱️ **交互式** - 步骤导航、平滑滚动、动画效果
- 📋 **SEO 优化** - 语义化 HTML 结构
- 🎯 **用户体验** - 直观的导航和内容组织

## 技术栈

- **HTML5** - 语义化标记
- **CSS3** - 现代布局和动画
  - CSS Grid & Flexbox
  - CSS 变量
  - 渐变和动画
  - 响应式设计
- **JavaScript (ES6+)** - 交互功能
  - 步骤导航
  - 平滑滚动
  - 触摸支持
  - 动画效果

## 文件结构

```
fiber-website/
├── index.html          # 主页面
├── styles.css          # 样式文件
├── script.js           # JavaScript 功能
├── icons/              # SVG 图标
│   ├── fiber-logo.svg
│   ├── left.svg
│   ├── right.svg
│   ├── scalability.svg
│   ├── low-cost.svg
│   ├── fast.svg
│   ├── multi-asset.svg
│   ├── interoperability.svg
│   ├── twitter.svg
│   ├── github.svg
│   └── substack.svg
├── imgs/               # 图片文件
│   ├── step1.png
│   ├── step2.png
│   ├── step3.png
│   └── step4.png
└── README.md
```

## 使用方法

### 本地开发

1. 克隆或下载项目文件
2. 使用任何本地服务器运行，例如：

```bash
# 使用 Python 简单服务器
python3 -m http.server 8000

# 使用 Node.js serve
npx serve .

# 或者直接用浏览器打开 index.html
open index.html
```

3. 在浏览器中访问 `http://localhost:8000`

### 部署

这是一个纯静态网站，可以部署到任何静态托管服务：

- **GitHub Pages**
- **Netlify**
- **Vercel**
- **Firebase Hosting**
- **AWS S3**
- **传统 Web 服务器**

只需将所有文件上传到服务器的根目录即可。

## 功能说明

### 导航栏
- 固定顶部导航
- 平滑滚动到各个部分
- 响应式设计

### 英雄区域
- 吸引人的标题和副标题
- 动画网络节点效果
- 行动按钮

### 工作原理部分
- 4 步交互式展示
- 自动轮播（5秒间隔）
- 手动导航控制
- 键盘支持（左右箭头键）
- 触摸滑动支持

### 特性展示
- 网格布局
- 动画卡片
- 特性亮点标签

### 对比表格
- Lightning Network vs Fiber Network
- 清晰的功能对比

### 混合网络部分
- 深色主题
- 毛玻璃效果

### 社区链接
- 社交媒体图标
- 悬停效果

## 自定义

### 颜色主题

在 `styles.css` 中的 `:root` 部分修改 CSS 变量：

```css
:root {
    --primary-color: #007AFF;
    --secondary-color: #5856D6;
    --accent-color: #FF9500;
    /* ... 其他颜色变量 */
}
```

### 内容更新

直接编辑 `index.html` 中的文本内容，或者替换 `imgs/` 文件夹中的图片。

### 添加新功能

在 `script.js` 中添加新的 JavaScript 功能。

## 浏览器支持

- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！

## 联系方式

- GitHub: [nervosnetwork/fiber](https://github.com/nervosnetwork/fiber)
- Twitter: [@FiberDevs](https://x.com/@FiberDevs)
