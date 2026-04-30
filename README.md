# 🎯 Operation Lexicon · FCE 词汇征服战役

> 一款**无畏契约（VALORANT）风格**的 FCE 单词背诵游戏 —— 60 天征服 3000 词，每天击败 5 只词汇怪物。

🌐 **在线体验**：[https://xzlock.github.io](https://xzlock.github.io)

---

## ✨ 核心特性

- 🎮 **游戏化学习**：看中文写英文，答对扣怪物血量，答错怪物回血
- ⚔️ **60 天战役**：每天 5 关，血量递增（100/150/200/250/300 BOSS）
- 🎨 **120+ 种怪物形态**：5 种阶层 × 8 种配色 × 3 种图案变体
- 💥 **丰富特效**：受击碎裂 / BOSS 震怒 / 击杀爆炸粒子
- 🔊 **原生发音**：Web Speech API，无需任何后端
- 💾 **进度持久化**：localStorage 记录通关状态
- 📱 **完全响应式**：手机/平板/桌面皆适配
- 🖨️ **打印友好**：`@media print` 自动分页

---

## 🚀 快速开始

### 在线使用
直接访问 [https://xzlock.github.io](https://xzlock.github.io) 即可开始。

### 本地运行

```bash
# 克隆仓库
git clone https://github.com/xzlock/xzlock.github.io.git
cd xzlock.github.io

# 启动本地服务器（必须用 HTTP，不能用 file://）
python3 -m http.server 8000

# 浏览器打开
open http://localhost:8000