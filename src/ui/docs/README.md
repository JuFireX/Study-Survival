# 用户界面 (User Interface)

`src/ui` 模块包含所有 UI 逻辑管理器和 PlayCanvas UI 组件脚本。

## 设计目标

- UI 负责渲染与交互，不直接维护玩法状态
- 玩法状态由系统维护，通过 `EventBus` 推送到 UI
- UI 采用“逻辑管理器（Manager）+ 组件（Component）”分层，便于复用与替换实现

## 初始化与生命周期

- UI 统一由 `UIManager` 实例化并持有（见 `src/core/manager/UIManager.ts`）
- 多数 UI 模块在构造函数里订阅 `EventBus` 事件，并在 `destroy()` 中解除订阅
- 部分 UI 模块会绑定 PlayCanvas 的每帧更新（例如浮字），需在销毁时 `off('update')`

典型调用链：

1. `GameManager` 初始化阶段创建 `UIManager`
2. `UIManager` new 各 UI 模块（Joystick / PlayerStatus / FloatingText ...）
3. 玩法系统通过 `EventBus.fire('ui:*', ...)` 通知 UI 更新
4. UI 收到事件后更新 DOM/样式

## 事件约定（UI 输入/输出）

UI 模块通常只消费 `ui:*` / `combat:*` 这类事件，并尽量不主动拉取数据。

已在代码中出现的事件（节选）：

- `ui:updateHealth(current: number, max: number)`：刷新血条
- `ui:updateExp(current: number, max: number, level: number)`：刷新经验条与等级文本
- `ui:updateBuffCount(count: number)`：刷新状态图标数量（简化版）
- `combat:damage(amount: number, worldPos: pc.Vec3, color?: string)`：生成伤害/治疗跳字

如果 UI 需要把输入传回系统，建议也走事件总线，并按域命名：

- `input:*`：输入类事件（摇杆、按钮）
- `ui:*`：纯 UI 展示更新
- `combat:*`：战斗显示/反馈（跳字、命中反馈）

## 逻辑管理器 (Managers)

### BossStatus
**职责**:
1. 管理 Boss 血条的显示和更新。
2. 处理 Boss 名称和状态图标的展示。
3. 监听 Boss 状态变化事件并更新 UI。

**常用事件/接口**:
- 推荐监听 `boss:updateHealth` / `boss:setName` 等事件（可按需补齐系统侧实现）

### CardSelect
**职责**:
1. 管理升级时的三选一卡牌界面。
2. 处理卡牌的点击选择事件。
3. 负责卡牌界面的显示和隐藏动画。

**常用事件/接口**:
- 推荐通过 `ui:showCardSelect(options)` / `ui:hideCardSelect()` 控制显示
- 选择结果建议 fire `card:selected(cardId)` 给卡牌系统处理

### FloatingText
**职责**:
1. 管理伤害数字、治疗数字等浮动文字的生成。
2. 控制浮动文字的动画 (上浮, 淡出)。
3. 使用对象池优化文字对象的创建和销毁。

**输入事件**:
- `combat:damage(amount, worldPos, color?)`

**实现要点**:
- 维护对象池，避免频繁创建 DOM
- 每帧将 `worldPos` 投影到屏幕坐标并更新位置

### Joystick
**职责**:
1. 处理触摸屏上的虚拟摇杆输入。
2. 计算摇杆的偏移量和方向向量。
3. 将输入转换为游戏内的移动指令。

**输出建议**:
- 方式 A：直接暴露 `getDirection()` / `getStrength()` 给玩家控制器读取
- 方式 B：通过 `EventBus.fire('input:joystick', vec2, strength)` 推送输入（更解耦）

### PlayerEffects
**职责**:
1. 显示玩家当前持有的 Buff/Debuff 图标。
2. 展示当前装备的武器图标。
3. 更新状态效果的持续时间显示。

**输入事件（当前实现）**:
- `ui:updateBuffCount(count)`

### PlayerStatus
**职责**:
1. 显示玩家的生命值 (Health Bar)。
2. 显示玩家的经验值 (Experience Bar) 和等级。
3. 实时更新数值显示。

**输入事件（当前实现）**:
- `ui:updateHealth(current, max)`
- `ui:updateExp(current, max, level)`

## 数据从哪里来（推荐路径）

- `CharacterSystem` 维护玩家生命/经验，并在必要时 fire `ui:updateHealth/ui:updateExp`
- `EnemySystem` / `BaseEnemy` 在战斗反馈时 fire `combat:damage`（跳字）
- UI 只负责渲染与交互，不持久化玩法数据

## 组件脚本 (Components)

### BossStatusComponent
**职责**:
1. 负责 Boss 血条 DOM 元素的创建和绑定。
2. 将 DOM 事件转发给 BossStatus 逻辑类。

### CardSelectComponent
**职责**:
1. 负责选卡界面 DOM 元素的渲染。
2. 监听 DOM 点击事件并通知 CardSystem。

### FloatingTextComponent
**职责**:
1. 负责浮动文字 DOM 元素的动态创建。
2. 负责每帧更新文字在屏幕上的位置 (世界坐标 -> 屏幕坐标)。

**实现要点**:
- 输入是“世界坐标”，输出是“屏幕上的 CSS 像素坐标”
- 依赖主摄像机进行投影，通常从 `GameContext.getCamera()` 获取

### JoystickComponent
**职责**:
1. 创建虚拟摇杆的 DOM 元素 (底座和摇杆)。
2. 监听 Touch 事件，计算摇杆位置。

### PlayerEffectsComponent
**职责**:
1. 负责状态栏图标区域的 DOM 管理。
2. 动态添加/移除 Buff 图标 DOM。

### PlayerStatusComponent
**职责**:
1. 负责玩家血条和经验条 DOM 的渲染。
2. 处理 CSS 样式变化以反映数值改变。

## 常见扩展方式

- 新增一个 HUD 模块：
  1. 在 `src/ui` 新建逻辑类（订阅 `EventBus`）
  2. 在 `src/ui/components` 新建组件类（负责 DOM）
  3. 在 `UIManager` 里实例化并提供 getter
  4. 由对应系统 fire `ui:*` 事件驱动

- 统一管理 UI 事件：
  - 先在系统侧定义事件名与参数契约
  - UI 侧只实现渲染，不在 UI 内计算玩法数值（例如血量百分比可以在 UI 做，但来源值应来自系统）
