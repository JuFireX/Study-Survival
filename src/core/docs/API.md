# Core API 参考

本文件聚焦 `src/core` 的“可直接用”的接口与约定：如何拿到核心对象、如何注册脚本、如何在系统/UI 之间通过事件通信。

## GameContext

访问所有管理器的中心枢纽。

```typescript
import { GameContext } from "../core/GameContext";

const context = GameContext.getInstance();
```

### 什么时候可以用 GameContext

- **`getInstance()`**：任何时候都可以调用（它只创建一个轻量单例）
- **`getApp()`**：必须在 `GameApplication` 创建 `pc.Application` 并 `setApp` 之后才能用；否则会抛错
- **`getPlayer()` / `getCamera()` / `getUIManager()`**：依赖 `GameManager` 的初始化顺序，通常在 `GameManager` 完成初始化后可用

### 访问器 (Accessors)

- `getApp(): pc.Application` - 获取原始的 PlayCanvas 应用程序实例。
- `getPlayer(): pc.Entity | null` - 获取主玩家实体。
- `getEventBus(): EventBus` - 获取全局事件总线。
- `getGameManager(): GameManager` - 获取主游戏循环管理器。
- `getResourceManager(): ResourceManager` - 访问已加载的资源。
- `getSceneManager(): SceneManager` - 控制场景元素。
- `getUIManager(): UIManager` - 控制 UI 元素。
- `getCardManager(): CardManager` - 访问卡牌数据。
- `getScriptRegistry(): ScriptRegistry` - 访问脚本注册系统。

### 常见用法

在系统里获取依赖（推荐在构造函数里拿一次并缓存）：

```ts
const context = GameContext.getInstance();
const app = context.getApp();
const eventBus = context.getEventBus();
const player = context.getPlayer(); // 可能为 null，取决于初始化时机
```

## ScriptRegistry

PlayCanvas 脚本的自动注册系统。

```typescript
import { ScriptRegistry } from "../core/ScriptRegistry";

// 在脚本文件末尾调用
ScriptRegistry.register(MyScript, 'myScript');
```

- `register(cls, name)`: 静态方法，将脚本类加入待注册队列。
- `init()`: 实例方法，由 GameManager 调用，执行实际的 `pc.registerScript`。

### 为什么需要 ScriptRegistry

PlayCanvas 的 `pc.registerScript(...)` 必须在 `pc.Application` 初始化后执行，否则会出现初始化时机/依赖顺序问题。`ScriptRegistry` 允许脚本“先收集、后统一注册”。

### 推荐约定

- `name` 使用小驼峰（与 `entity.script.create('name')` 的字符串一致）
- 每个脚本文件只注册一次（重复注册会导致异常或行为不可预期）

## EventBus

全局事件系统。

```typescript
// 用法
context.getEventBus().on("event:name", callback, scope);
context.getEventBus().fire("event:name", data);
```

- `on(name, callback, scope)`: 订阅事件。
- `once(name, callback, scope)`: 订阅一次性事件。
- `off(name, callback, scope)`: 取消订阅。
- `fire(name, ...args)`: 发布事件。

### 事件命名（建议）

- `combat:*`：战斗/伤害/命中
- `ui:*`：UI 刷新事件（HUD、浮字等）
- `player:*`：玩家状态变化（升级、经验等）
- `enemy:*`：敌人生成/死亡/波次等
- `game:*`：全局流程（开始、结束、暂停等）

### 本仓库已使用的典型事件（不完整列表）

- `combat:damage`：用于伤害/治疗数字浮字（UI 监听）
- `combat:damageEnemy`：对某个敌人实体造成伤害（EnemySystem 监听）
- `combat:hitPlayer`：敌人对玩家造成命中（CharacterSystem 监听）
- `enemy:spawn` / `enemy:clear`：请求刷怪/清怪（EnemySystem 监听）
- `enemy:spawned` / `enemy:died`：敌人已生成/死亡（其他系统可监听）
- `ui:updateHealth` / `ui:updateExp` / `ui:updateBuffCount`：HUD 刷新（UI 监听）

## ResourceManager

处理资源加载。

```typescript
// 用法
const tex = context.getResourceManager()?.getTexture("my_texture");
```

- `loadAll()`: 扫描并加载 `src/assets` 中的所有资源。
- `getTexture(name: string)`: 通过文件名（无扩展名）返回 `pc.Texture`。
- `getAsset(name: string)`: 返回原始的 `pc.Asset`。

### 资源命名约定

`getTexture('foo')` 对应的是 `src/assets/image/foo.png|jpg|jpeg`（会去掉扩展名作为 key）。

## SceneManager

管理 3D 场景元素。

```typescript
const sceneManager = SceneManager.getInstance();
// 通常由 GameManager 自动调用
// sceneManager.buildScene();
```

- `buildScene()`: 构建基础场景（地面、灯光、摄像机）。返回创建的 Camera Entity。

## UIManager

管理所有 UI 组件。

```typescript
const ui = context.getUIManager();
const joystick = ui?.getJoystick();
```

- `getJoystick()`: 获取虚拟摇杆组件。
- `getPlayerStatus()`: 获取玩家状态 UI。
- `getFloatingText()`: 获取漂浮文字组件。
- `getCardSelect()`: 获取卡牌选择界面。
- `getBossStatus()`: 获取 Boss 血条 UI。
- `getPlayerEffects()`: 获取玩家特效 UI。

### UI 与事件的关系

UI 通常在构造函数里订阅事件（例如浮字订阅 `combat:damage`），系统通过 `EventBus.fire(...)` 推送更新即可。

## CardManager

只读的卡牌数据管理器。

```typescript
const cards = context.getCardManager();
const weapons = cards?.getAllWeaponCards();
```

- `getAllQuestionCards()`: 获取所有问题卡数据。
- `getAllWeaponCards()`: 获取所有武器卡数据。
- `getAllBuffCards()`: 获取所有增益卡数据。

## GameApplication / GameManager（理解用）

这两个类通常不被业务系统直接调用，但理解它们的职责能帮助定位初始化时机问题：

- `GameApplication`：创建 `pc.Application`、加载资源、启动 `GameManager` 并 `app.start()`
- `GameManager`：注册脚本、构建场景、初始化 UI、创建玩家、初始化系统列表，并在每帧驱动系统 `update(dt)`
