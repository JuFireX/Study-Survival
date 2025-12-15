# 移动端类吸血鬼/土豆兄弟游戏开发计划 (PlayCanvas + Cordova)

基于您的需求，我们将采用 **Vite + TypeScript + PlayCanvas (Engine only)** 的现代开发流，结合 **Cordova** 进行移动端打包。

## 1. 项目初始化与基础设施 (Phase 1)

- **工程搭建**:

  - 使用 Vite 初始化 TypeScript 项目，配置 PlayCanvas 引擎依赖。

  - 初始化 Cordova 项目结构，将构建输出目录指向 Cordova 的 `www` 目录。

  - 配置 `.gitignore` 和基本开发脚本 (`npm run dev`, `npm run build:mobile`).

- **基础架构**:

  - 建立 ECS 架构规范：使用 PlayCanvas 的 `ScriptType` 作为组件基础。

  - 实现 `GameApplication` 入口，管理场景加载、资源预加载和主循环。

## 2. 核心系统实现 (Phase 2)

- **PlayCanvas 渲染与场景**:

  - 创建基础 3D 场景（相机、灯光、地面）。

  - 实现 **胶囊体英雄** 和 **基础敌人** 的渲染与物理胶囊体碰撞。

  - 实现 **移动控制**：虚拟摇杆 (Virtual Joystick) 控制英雄移动。

- **ECS 组件开发**:

  - `PlayerController`: 处理输入和移动。

  - `EnemyBehavior`: 简单的追踪 AI。

  - `WeaponSystem`: 自动索敌与发射逻辑。

## 3. 题目战斗系统 (Phase 3)

- **题库架构**:

  - 设计 `QuestionManager`：支持 JSON 导入题库。

  - 实现题目权重算法：根据英雄属性（语文/数学/英语）动态抽取题目。

  - 实现动态难度控制器：监听武器星级变化，调整题目难度系数。

- **交互逻辑**:

  - 开发题目 UI 面板（HTML/CSS 覆盖在 Canvas 之上，利用 DOM 优势）。

  - 答题流程：触发答题 -> 暂停/减缓游戏 -> 判定结果 -> 发送事件。

## 4. 数值与成长体系 (Phase 4)

- **节点式属性系统**:

  - 实现 `AttributeNode` 类：支持基础值、乘区（暴击/加成）和父子节点关联。

  - 实现伤害公式计算引擎：`FinalDmg = (Base * Crit) + SubjectBonus`。

- **成长逻辑**:

  - `UpgradeSystem`: 管理武器槽位解锁（监听答题计数 N）。

  - `EvolutionTree`: 定义武器品质（白蓝紫橙）和升级路径。

## 5. 反馈与扩展性 (Phase 5)

- **UI/UX**:

  - 实现双进度条：刷题进度 vs 战力成长。

  - 开发 Combo 特效系统和飘字反馈。

- **扩展接口**:

  - 定义 `IQuestionLoader`, `IWeaponModule`, `IBuffRegistry` 接口。

  - 实现简易的热更检查逻辑（检查远程 JSON 版本）。

## 6. 发布与优化 (Phase 6)

- **Cordova 打包**:

  - 配置 `config.xml` (横屏、全屏、图标)。

  - 集成性能监控 (Stats.js) 用于开发期分析。

- **合规与测试**:

  - 确保资源加载在移动端文件协议下正常工作。

## 待确认事项

- 目前是否已有现成的题库 JSON 数据格式？如果没有，我将设计一个标准格式。\
  A: 目前没有已有题库. 你可以随意按照需求设计格式.

- 美术资源暂时使用原始几何体（胶囊、方块），确认是否需要引入简单的材质区分颜色？\
  A: 这个可以有, 可以简单的通过颜色区分怪物等级和通过不同的形状区分不同种类的怪物

请确认以上计划，我们将从 **项目初始化** 开始执行。
