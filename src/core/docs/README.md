# 核心模块文档

`src/core` 模块是游戏引擎包装器的核心。它为游戏提供了基础设施，包括应用程序生命周期管理、事件处理、资源管理和中央服务定位器。

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

### 模块化架构 (Modular Architecture)

游戏逻辑分为 **系统 (Systems)**（由 `GameManager` 处理）和 **管理器 (Managers)**（数据/状态持有者）。

- **系统 (Systems)**: 处理逐帧逻辑（例如 `EnemySystem`、`WeaponSystem`）。
- **管理器 (Managers)**: 处理状态和资源（例如 `ResourceManager`、`CardManager`）。
