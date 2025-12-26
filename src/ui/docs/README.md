# 用户界面 (User Interface)

`src/ui` 模块包含所有 UI 逻辑管理器和 PlayCanvas UI 组件脚本。

## 逻辑管理器 (Managers)

### BossStatus
**职责**:
1. 管理 Boss 血条的显示和更新。
2. 处理 Boss 名称和状态图标的展示。
3. 监听 Boss 状态变化事件并更新 UI。

### CardSelect
**职责**:
1. 管理升级时的三选一卡牌界面。
2. 处理卡牌的点击选择事件。
3. 负责卡牌界面的显示和隐藏动画。

### FloatingText
**职责**:
1. 管理伤害数字、治疗数字等浮动文字的生成。
2. 控制浮动文字的动画 (上浮, 淡出)。
3. 使用对象池优化文字对象的创建和销毁。

### Joystick
**职责**:
1. 处理触摸屏上的虚拟摇杆输入。
2. 计算摇杆的偏移量和方向向量。
3. 将输入转换为游戏内的移动指令。

### PlayerEffects
**职责**:
1. 显示玩家当前持有的 Buff/Debuff 图标。
2. 展示当前装备的武器图标。
3. 更新状态效果的持续时间显示。

### PlayerStatus
**职责**:
1. 显示玩家的生命值 (Health Bar)。
2. 显示玩家的经验值 (Experience Bar) 和等级。
3. 实时更新数值显示。

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
