# 核心架构

## 高层拓扑结构

```mermaid
graph TD
    Main[main.ts] --> GameApp[GameApplication]
    GameApp --> |初始化| App(pc.Application)
    GameApp --> |注册| Context[GameContext]
    
    GameApp --> |加载| ResMgr[ResourceManager]
    
    Main --> |启动| GM[GameManager]
    
    GM --> |获取| Context
    GM --> |初始化| SceneMgr[SceneManager]
    GM --> |初始化| UIMgr[UIManager]
    GM --> |初始化| Systems[Game Systems]
    
    subgraph Managers [src/core/manager]
        ResMgr
        SceneMgr
        UIMgr
        CardMgr[CardManager]
    end
    
    subgraph Core [src/core]
        EventBus
        GameContext
    end
    
    Systems <--> |事件| EventBus
    Systems <--> |数据| Managers
    Managers -.-> |注册| Context
```

## 通信流程

1.  **初始化 (Initialization)**:
    *   `GameApplication` 初始化引擎和 `ResourceManager`。
    *   `GameManager` 初始化 `SceneManager`、`UIManager` 和所有游戏系统 (Game Systems)。
    *   所有管理器把自己注册到 `GameContext` 中。

2.  **运行时 (Runtime)**:
    *   系统通过 `GameContext.getInstance().getManagerName()` 获取管理器。
    *   系统之间通过 `EventBus` 进行通信。

## 管理器角色

| 管理器 | 职责 |
| :--- | :--- |
| **ResourceManager** | 通过 Vite glob 导入处理资源加载（图像、音频、模型）。 |
| **SceneManager** | 构建静态 3D 环境（灯光、摄像机、地面）。 |
| **UIManager** | 管理 2D UI 层、HUD 和弹出窗口。 |
| **CardManager** | 管理牌组状态、卡牌定义和手牌逻辑。 |
