# 核心架构

## 高层拓扑结构

```mermaid
graph TD
    Main[main.ts] --> GameApp[GameApplication]
    GameApp --> |初始化| App(pc.Application)
    GameApp --> |注册| Context[GameContext]

    GameApp --> |加载| ResMgr[ResourceManager]
    GameApp --> |启动| GM[GameManager]

    GM --> |获取| Context
    GM --> |获取单例 & 注册| SceneMgr[SceneManager]
    GM --> |获取单例 & 注册| UIMgr[UIManager]
    GM --> |获取单例 & 注册| CardMgr[CardManager]
    GM --> |初始化| Systems[Game Systems]

    subgraph Managers [src/core/manager]
        ResMgr
        SceneMgr
        UIMgr
        CardMgr
    end

    subgraph Core [src/core]
        EventBus
        GameContext
    end

    Systems <--> |事件| EventBus
    Systems <--> |数据| Managers
    Managers -.-> |被注册| Context
```

## 通信流程

1.  **初始化 (Initialization)**:

    - `GameApplication` 初始化引擎，注册 `App` 到上下文，并加载资源。
    - 资源加载完成后，`GameApplication` 启动 `GameManager`。
    - `GameManager` 获取各管理器单例 (`SceneManager`, `UIManager` 等) 并注册到 `GameContext`。
    - `GameManager` 初始化所有游戏系统 (Game Systems)。

2.  **运行时 (Runtime)**:
    - 系统通过 `GameContext.getInstance().getManagerName()` 获取管理器。
    - 系统之间通过 `EventBus` 进行通信。

## 管理器角色

| 管理器              | 职责                                                  |
| :------------------ | :---------------------------------------------------- |
| **ResourceManager** | 通过 Vite glob 导入处理资源加载（图像、音频、模型）。 |
| **SceneManager**    | 构建静态 3D 环境（灯光、摄像机、地面）。              |
| **UIManager**       | 管理 2D UI 层、HUD 和弹出窗口。                       |
| **CardManager**     | 管理牌组状态、卡牌定义和手牌逻辑。                    |
