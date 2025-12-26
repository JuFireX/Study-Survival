# Core Module Documentation

该模块包含了游戏的核心架构组件，负责应用程序的生命周期、全局状态管理、事件通信和场景构建。

## 架构概览

核心模块采用 **Service Locator** 和 **Singleton** 模式，围绕 `GameContext` 和 `GameManager` 构建。

- **GameApplication**: 程序的入口点，负责 PlayCanvas 的启动。
- **GameContext**: 全局上下文，作为 Service Locator，持有所有核心对象的引用。
- **GameManager**: 游戏的指挥官，负责初始化各个 Gameplay Systems。
- **EventBus**: 全局事件总线，用于模块间解耦。

## 核心组件 (Components)

### 1. GameApplication (`GameApplication.ts`)
- **职责**: 负责 PlayCanvas Application 的初始化、配置、资源加载和生命周期管理。
- **主要接口**:
    - `start()`: 异步启动游戏，加载资源。
    - `destroy()`: 销毁游戏实例。
    - `getApp()`: 获取 PlayCanvas Application 实例。

### 2. GameContext (`GameContext.ts`)
- **职责**: 服务定位器 (Service Locator) 模式的实现。
- **功能**:
    - 存储全局单例引用：`Application`, `Player Entity`, `Camera`, `EventBus`。
    - 提供对核心 Manager (`GameManager`, `UIManager`) 的访问。
    - 避免在系统和类之间传递过多的参数。
- **使用**:
    ```typescript
    const ctx = GameContext.getInstance();
    const app = ctx.getApp();
    const player = ctx.getPlayer();
    ```

### 3. GameManager (`GameManager.ts`)
- **职责**: 游戏的主入口和指挥者。
- **功能**:
    - 初始化所有游戏系统 (`Systems`)。
    - 初始化 UI 管理器 (`UIManager`)。
    - 创建玩家实体 (`Player`) 和基础场景。
    - 管理游戏主循环 (`update`)。
- **系统初始化顺序**:
    1. DebugSystem
    2. QuestionSystem (Data)
    3. SceneSystem
    4. CharacterSystem
    5. EnemySystem
    6. WeaponSystem
    7. CardSystem

### 4. EventBus (`EventBus.ts`)
- **职责**: 全局事件总线，用于解耦通信。
- **功能**:
    - 封装 PlayCanvas 的 `pc.EventHandler`。
    - 提供 `on`, `off`, `fire`, `once`, `hasEvent` 接口。
    - **最佳实践**: 优先使用 `EventBus` 进行跨模块通信，而不是直接引用。

### 5. ResourceManager (`ResourceManager.ts`)
- **职责**: 统一管理游戏资源。
- **功能**:
    - 使用 Vite 的 `import.meta.glob` 自动加载 `src/assets` 下的资源。
    - 提供 `getAsset(name)` 和 `getTexture(name)` 接口。
    - 支持异步加载流程。

### 6. UIManager (`UIManager.ts`)
- **职责**: 统一管理所有 UI 组件。
- **功能**:
    - 实例化并持有具体的 UI 类 (`Joystick`, `HUD`, `QuestionUI`, `SkillSelectUI`, `FloatingTextManager`)。
    - 提供高层业务接口：`showQuestion`, `showSkillSelect`, `showFloatingText`。
    - 管理 UI 摄像机绑定。

### 7. SceneManager (`SceneManager.ts`)
- **职责**: 负责 3D 场景的构建。
- **功能**:
    - 创建基础环境（地面、灯光）。
    - 创建和配置主摄像机。

### 8. DataManager & SaveManager
- **DataManager**: 负责静态配置数据的管理（预留）。
- **SaveManager**: 负责玩家存档的持久化（基于 `localStorage`）。

## 目录结构

```
src/core/
├── EventBus.ts          # 事件总线
├── GameApplication.ts   # 程序入口封装
├── GameContext.ts       # 全局上下文 (Service Locator)
├── GameManager.ts       # 游戏逻辑管理器
├── ResourceManager.ts   # 资源管理器
├── SceneManager.ts      # 场景构建器
├── UIManager.ts         # UI 管理器
├── DataManager.ts       # 数据管理器 (Stub)
├── SaveManager.ts       # 存档管理器 (Basic)
└── README.md            # 本文档
```
