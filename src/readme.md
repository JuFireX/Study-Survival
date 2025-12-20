# 目录结构

```text
src/
 ├── config/                  # 静态配置与数据
 │   ├── questions.json       # 题库（科目、难度、选项）
 │   ├── weapons.json         # 武器数值、升级路径与合成配方
 │   ├── evolution-tree.json  # 升级树（JSON 格式）
 │   └── config.ts            # 全局常量（生成速率、EXP 表、速度）
 │
 ├── core/                    # 引擎抽象与核心逻辑
 │   ├── EventBus.ts          # 全局事件系统（解耦 UI、Systems 与 ECS）
 │   ├── GameApplication.ts   # PlayCanvas Application 封装（初始化、Resize、资源）
 │   ├── GameContext.ts       # 服务定位器（保存 App、Player Entity、Managers）
 │   └── SceneBuilder.ts      # 场景搭建（灯光、相机、地面、环境）
 │
 ├── data/                    # 数据持久化层
 │   ├── SaveManager.ts       # LocalStorage 封装（保存/加载进度）
 │   └── types.ts             # 共享接口（SaveData、UserProfile、ConfigTypes）
 │
 ├── scripts/                     # PlayCanvas Script 组件（挂载到 Entity 上）
 │   ├── components/
 │   │   ├── PlayerController.ts # 输入处理、移动、物理
 │   │   ├── EnemyBehavior.ts    # AI 寻路、攻击逻辑
 │   │   ├── WeaponController.ts # 武器挂载、开火逻辑
 │   │   └── BulletBehavior.ts   # 弹丸逻辑、碰撞检测
 │   └── utils/               # 数学与物理辅助（向量运算、碰撞层）
 │
 ├── systems/                 # 游戏逻辑 Systems（纯 TypeScript 类）
 │   ├── IGameSystem.ts       # 所有 system 的接口（统一 init/update）
 │   ├── GameManager.ts       # system 调度器（主循环、状态机）
 │   ├── SpawnSystem.ts       # 波次管理（敌人生成逻辑）
 │   ├── QuizSystem.ts        # Quiz 逻辑（流程控制、答案校验、时间缩放）
 │   ├── CombatSystem.ts      # 伤害结算、HP 管理、死亡处理
 │   ├── SkillSystem.ts       # 升级、Skill 选择（RNG）、数值应用
 │   ├── AchievementSystem.ts # 里程碑事件监听（击杀、等级）
 │   └── FeedbackSystem.ts    # 音效、震动、屏幕震动管理
 │
 ├── ui/                        # 基于 DOM 的 UI 覆盖层
 │   ├── Joystick.ts            # 虚拟摇杆（触控/鼠标输入）
 │   ├── QuestionUI.ts          # Quiz 弹窗（HTML 覆盖层）
 │   ├── SkillSelectUI.ts       # 升级 3 选 1 弹窗（HTML 覆盖层）
 │   ├── HUD.ts                 # HUD（HP、EXP、击杀数）
 │   ├── FloatingTextManager.ts # 伤害数字与提示
 │   └── Attributes.ts          # 里程碑事件弹窗（HTML 覆盖层）
 │
 ├── utils/                   # 通用工具
 │   └── ObjectPool.ts        # 内存优化（复用 Bullet/Enemy）
 │
 └── main.ts                  # 应用入口
```

## 🧠 架构思考与流程

### 1. 核心循环（`GameManager`）

`GameManager` 充当 **指挥**。它不处理低层逻辑（例如移动 bullet），而是编排高层流程。

- **初始化**：初始化 `GameContext`、`SceneBuilder`，并注册所有 Systems。
- **更新循环**：对所有激活的 systems 调用 `.update(dt)`。
- **状态管理**：当 `QuizSystem` 或 `SkillSystem` 需要 UI 交互时暂停游戏（TimeScale = 0）。

### 2. ECS 与 Systems

我们采用混合方案：

- **ECS（PlayCanvas Scripts）**：用于必须在世界中具有物理实体的内容（移动、碰撞、渲染）。
  - _示例_：`PlayerController` 根据 `Joystick` 输入移动实体。
- **Systems（纯逻辑）**：用于全局规则与数据处理。
  - _示例_：`CombatSystem` 计算伤害。bullet 的碰撞事件（ECS）触发一个 `Damage` 事件，`CombatSystem` 捕获后扣减 HP。

### 3. 事件驱动通信

模块通过 `EventBus`（或 PlayCanvas 内置事件）通信，以保持解耦。

- **流程**：`Bullet` 命中 `Enemy` -> `BulletBehavior` 发出 `Hit` -> `CombatSystem` 计算伤害 -> `CombatSystem` 发出 `DamageDealt` -> `FloatingText` 监听并显示数字 -> `HUD` 监听并更新 EXP。

### 4. Quiz 循环

本游戏的独特机制是 Quiz 打断。

1. **触发**：`SpawnSystem` 或 Timer 触发 "Quiz Time"。
2. **暂停**：`GameManager` 暂停游戏循环（物理停止）。
3. **UI**：`QuizSystem` 显示 `QuestionPanel`。
4. **结算**：玩家作答 -> `QuizSystem` 校验 -> 发出 `AnswerCorrect` 或 `AnswerWrong`。
5. **奖励/惩罚**：`SkillSystem` 监听 `AnswerCorrect` 给予增益；`CombatSystem` 可能监听 `AnswerWrong` 增益效果减弱。
6. **恢复**：游戏取消暂停。

### 5. UI 层

我们使用基于 DOM 的 UI（HTML/CSS），而不是 WebGL UI，以获得更好的可访问性，并更容易为 Quiz 这类文本密集元素做样式。

- `HUD` 与 `Joystick` 始终可见。
- 面板（`QuestionPanel`、`SkillSelectPanel`）是模态覆盖层。
- `FloatingText` 是基于 DOM 的，用于显示伤害数字。

> 我觉得项目结构还得改. 现在有点过于复杂了
