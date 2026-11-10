# 赵逸飞 · 个人简历

一个轻量、响应式的个人简历与视觉内容作品页，使用原生 HTML、CSS 和 JavaScript 实现，无需安装依赖。

[公开网站](https://zhaoyf0302.github.io/zhao-yifei-website/)

## 本地预览

直接用浏览器打开 `index.html` 即可。

## 页面内容

- 个人简介：赵逸飞，IP操盘手；个人方向“无限进步”；现居北京，喜欢火锅、旅行、拍小动物和收藏手办
- 首页黏土头像：桌面端眼睛跟随鼠标，向下滚动推近并转到侧脸，显示履历；手机上履历出现在头像下方。减少动态效果或 WebGL 不可用时显示静态头像和履历
- 关于我：个人名片与身份、城市和兴趣放在一起。名片头像进入画面后会转向姓名和地址，可跟随鼠标与重播
- 个人资料下方的 VIBE：滚动进入画面后播放五秒镜像动画，可暂停与重播；减少动态效果时显示完成画面
- 个人故事：三段互动插图，可跳转到对应的作品和分镜
- 作品集：从湖畔奇遇选段进入，展示“湖畔奇遇 / 盔甲骑士的日常 / 盔甲宇宙”三组绿色黏土微缩场景
- 联系方式：微信号复制按钮与电话链接
- 交互：统一的鼠尾草绿、苔藓绿与暖纸色、Google Fonts 字体组合、持续循环待机、滚动时加速逐帧行走并回看停留的软陶 3D 角色向导，带连续镜头轨迹线；照片卡片有远中近三层视差、人物独立浮动、4 秒角色动作循环、指针倾斜和点击放大；另有自定义光标、磁吸按钮与滚动进度
- 响应式布局，并尊重系统的减少动态效果设置

## 文件

- `index.html`：页面结构、样式与交互逻辑
- `assets/avatar-hero.css` 和 `assets/avatar-hero.js`：首页布局、鼠标跟随与滚动进度
- `assets/avatar/` 和 `assets/avatar-renderer.js`：头像角度素材、直接打开 HTML 用的贴图包，以及与 Remotion 共用的渲染代码
- `assets/zhaoyifei-portrait.jpg`：统一插画风格的个人半身肖像
- `assets/mascot-zhaoyifei.png`：软陶 3D 角色定帧
- `assets/mascot-zhaoyifei-frames-3d.png`：四帧角色动作图，用于滚动时前行、停下时定格
- `assets/mascot-zhaoyifei-animation.gif`：透明背景循环动画导出文件
- `assets/works/`：作品展示图片，绿色作品集使用 `eagle-green/` 中的 WebP

编辑 `index.html` 和 `assets/` 中的图片即可更新页面。
