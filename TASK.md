# 任务：构建个人工具箱网站

## 参考
原型：https://delphi.tools （设计风格参考）

## 设计风格：极客风
- 深色主题，背景 #0d0d0d 或 #111
- 主色：绿色 #00ff88 或 青色 #00d4ff（选一个，保持统一）
- 字体：monospace（代码感），标题用 JetBrains Mono 或 IBM Plex Mono
- 卡片：微微发光的边框，hover 有扫光/发光效果
- 整体感觉：Terminal + 现代设计系统的融合，有点 hacker 气质但不脏
- 参考风格：Vercel CLI、Linear、Raycast

## 技术要求
- 纯 HTML + CSS + JS，单文件或少量文件
- 所有工具在浏览器本地运行，不上传数据
- 响应式布局

## 工具清单（43个）按分类实现

### 颜色工具（优先实现，完全功能）
1. **Colour Converter** - HEX/RGB/HSL/HSV/CMYK 互转
2. **Tailwind Shade Generator** - 输入一个颜色，生成完整 Tailwind 色阶（50-950）
3. **Contrast Checker** - 输入前景/背景色，显示 WCAG AA/AAA 合规状态
4. **Gradient Generator** - 可视化渐变生成器，输出 CSS 代码
5. **Colour Blindness Simulator** - 上传/粘贴图片，模拟8种色盲视角
6. **Harmony Generator** - 输入主色，生成互补/类似/三角等配色方案
7. **Palette Generator** - 随机生成美观配色方案，可锁定颜色重新生成

### 排版工具（优先实现）
8. **PX to REM** - px/rem/em 三向互转，可设置 base font size
9. **Line Height Calculator** - 输入字号，推荐行高
10. **Typography Calculator** - pt/px/em/rem 单位换算

### 图片工具（基础功能）
11. **Image Converter** - 浏览器端图片格式转换（PNG/JPEG/WebP/AVIF）
12. **SVG Optimiser** - 粘贴 SVG 代码，输出压缩后的版本
13. **Placeholder Generator** - 生成指定尺寸的占位图，可自定义颜色和文字
14. **Favicon Generator** - 上传图片，生成多尺寸 favicon 打包下载
15. **Watermarker** - 上传图片，添加文字水印，下载
16. **Image Splitter** - 上传图片，切成 N×M 网格，打包下载
17. **Matte Generator** - 上传图片，添加正方形底色边框

### 社交媒体工具
18. **Social Media Cropper** - 上传图片，按平台尺寸裁切（Instagram/Twitter/LinkedIn等）
19. **Seamless Scroll Generator** - 上传宽图，切成Instagram轮播图片

### 开发工具（完全功能）
20. **Base Converter** - 10进制/16进制/2进制/8进制互转
21. **Encoding Tools** - Base64 编解码 + URL编解码 + MD5/SHA哈希
22. **Regex Tester** - 正则表达式测试器，实时高亮匹配
23. **Meta Tag Generator** - 填写网站信息，生成 HTML meta tags
24. **Tailwind Cheat Sheet** - Tailwind CSS 速查表
25. **Word Counter** - 字数/字符数/行数/段落数统计

### 其他工具
26. **QR Generator** - 生成可自定义颜色的二维码
27. **Barcode Generator** - 生成多种格式条形码
28. **Unit Converter** - 长度/重量/温度等单位换算
29. **Time Calculator** - Unix 时间戳转换 + 时区换算
30. **Scientific Calculator** - 科学计算器
31. **Text Scratchpad** - 带格式化工具的文本编辑器
32. **Paper Sizes** - 标准纸张尺寸参考
33. **Glyph Browser** - Unicode 字符浏览和搜索

## 页面结构

### 首页 (index.html)
- 顶部：ASCII art logo 或极简 logo + 一句话描述
- 搜索框（过滤工具）
- 工具卡片网格，按分类展示
- 每个卡片：工具名、简短描述、分类标签、点击进入

### 工具页 (tools/[name].html 或单页路由)
- 返回按钮
- 工具名 + 描述
- 工具主体（功能区）

## 实现策略
- 优先把上面33个工具全部实现为可用的完整功能
- 首页有搜索过滤
- 工具页面用 hash 路由（#colour-converter 等）做单页应用，不需要后端
- 所有处理在浏览器端完成

## 输出
项目放在当前目录，主入口为 index.html
完成后运行：openclaw system event --text "工具箱构建完成！共实现33个工具，极客深色风格" --mode now
