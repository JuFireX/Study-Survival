# Core Module Documentation

该模块包含了游戏的核心架构组件，负责应用程序的生命周期、全局状态管理、事件通信和场景构建。

## Components

### 1. GameApplication (`GameApplication.ts`)
- **职责**: 负责 PlayCanvas Application 的初始化、配置、资源加载和生命周期管理。
- **功能**:
    - 初始化 `pc.Application`。
    - 绑定全局窗口事件（如 resize）。
    - 启动游戏循环。

### 2. GameContext (`GameContext.ts`)
- **职责**: 服务定位器 (Service Locator) 模式的实现。
- **功能**:
    - 存储全局单例引用：`Application`, `Player Entity`, `Camera`, `EventBus`。
    - 避免在系统和类之间传递过多的参数。
    - 提供全局访问点 `GameContext.getInstance()`。

### 3. GameManager (`GameManager.ts`)
- **职责**: 游戏的主入口和指挥者。
- **功能**:
    - 初始化所有游戏系统 (`Systems`)。
    - 初始化 UI 管理器 (`UIManager`)。
    - 创建玩家实体 (`Player`)。
    - 管理游戏主循环 (`update`)。
    - 处理全局游戏状态（如暂停、恢复）。

### 4. EventBus (`EventBus.ts`)
- **职责**: 全局事件总线，用于解耦通信。
- **功能**:
    - 封装 PlayCanvas 的 `pc.EventHandler`。
    - 提供 `on`, `off`, `fire`, `once` 接口。
    - 用于系统间 (`System` <-> `System`) 和 层级间 (`UI` <-> `Logic`) 的通信。

### 5. UIManager (`UIManager.ts`)
- **职责**: 统一管理所有 UI 组件。
- **功能**:
    - 实例化并持有具体的 UI 类 (`Joystick`, `HUD`, `QuestionUI`, `SkillSelectUI`, `FloatingTextManager`)。
    - 提供对外接口以显示/隐藏 UI 或更新 UI 状态。

### 6. SceneManager (`SceneManager.ts`)
- **职责**: 负责 3D 场景的构建。
- **功能**:
    - 创建基础环境（地面、灯光）。
    - 创建和配置主摄像机。
    - (未来) 可扩展为处理地图生成和环境动态变化。

### 7. DataManager / SaveManager
- **职责**: 数据持久化和存档管理（目前预留）。
