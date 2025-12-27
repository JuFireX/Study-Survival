# 核心模块文档

`src/core` 模块是游戏引擎包装器的核心。它为游戏提供了基础设施，包括应用程序生命周期管理、事件处理、资源管理和中央服务定位器。

## 运行时生命周期（从启动到每帧）

1. `src/main.ts` 创建 `GameApplication`，并调用 `start()`
2. `GameApplication` 创建 `pc.Application` 并写入 `GameContext`
3. `ResourceManager.loadAll()` 扫描并加载资源（纹理、音频等）
4. `GameManager` 初始化：脚本注册、场景、UI、卡牌数据、玩家实体、系统列表
5. `pc.Application` 开始主循环，每帧触发 `GameManager.update(dt)`，并依次调用每个 `IGameSystem.update(dt)`

## 目录结构

- **`manager/`**: 包含不同领域的专用管理器（UI、资源、场景、卡牌）。
- **`docs/`**: 文档和架构图。
- **`test/`**: 核心逻辑的单元测试。
- **`EventBus.ts`**: 全局事件通信系统。
- **`GameApplication.ts`**: PlayCanvas 应用程序的入口点。
- **`GameContext.ts`**: 服务定位器 (Singleton)，提供对核心系统的全局访问。
- **`GameManager.ts`**: 游戏循环和系统编排的指挥者。
- **`ScriptRegistry.ts`**: 脚本自动注册系统，解决脚本依赖和初始化时机问题。

## 关键概念

### 服务定位器模式 (Service Locator Pattern)

我们使用 `GameContext` 作为全局单例来访问所有主要管理器和 PlayCanvas 应用程序实例。这避免了在层级结构深处传递依赖项。

在这个项目中，`GameContext` 主要提供三类引用：

- **引擎对象**：`pc.Application`、`Player Entity`、`Camera Entity`
- **跨模块通信**：`EventBus`
- **核心管理器/工具**：`ResourceManager / SceneManager / UIManager / CardManager / ScriptRegistry`

### 模块化架构 (Modular Architecture)

游戏逻辑分为 **系统 (Systems)**（由 `GameManager` 处理）和 **管理器 (Managers)**（数据/状态持有者）。

- **系统 (Systems)**: 处理逐帧逻辑（例如 `EnemySystem`、`WeaponSystem`）。
- **管理器 (Managers)**: 处理状态和资源（例如 `ResourceManager`、`CardManager`）。

### 初始化顺序的重要性

该项目的初始化顺序是“有依赖就先初始化依赖”：

1. `pc.Application` 必须最先创建并写入 `GameContext`（否则所有依赖 `getApp()` 的模块会抛错）
2. `ScriptRegistry.init()` 必须在创建 `pc.Application` 之后执行（它内部会 `pc.registerScript(...)`）
3. `SceneManager.buildScene()` 创建相机后，再注册到 `GameContext`，方便 UI（如浮字）做世界坐标到屏幕坐标的投影
4. `UIManager` 建议在系统初始化之前完成（因为系统会 fire UI 事件）

### 模块间通信约定（推荐）

- **系统驱动数据**：系统更新状态后通过 `EventBus.fire(...)` 通知 UI 或其他系统
- **UI 不主动拉取**：UI 尽量只订阅事件并渲染（例如 `FloatingText` 监听 `combat:damage`）
- **事件命名分域**：`combat:* / ui:* / player:* / enemy:* / game:*` 便于检索和归档
