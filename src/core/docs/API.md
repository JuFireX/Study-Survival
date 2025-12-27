# Core API 参考

## GameContext

访问所有管理器的中心枢纽。

```typescript
import { GameContext } from "../core/GameContext";

const context = GameContext.getInstance();
```

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

## ScriptRegistry

PlayCanvas 脚本的自动注册系统。

```typescript
import { ScriptRegistry } from "../core/ScriptRegistry";

// 在脚本文件末尾调用
ScriptRegistry.register(MyScript, 'myScript');
```

- `register(cls, name)`: 静态方法，将脚本类加入待注册队列。
- `init()`: 实例方法，由 GameManager 调用，执行实际的 `pc.registerScript`。

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

## ResourceManager

处理资源加载。

```typescript
// 用法
const tex = context.getResourceManager()?.getTexture("my_texture");
```

- `loadAll()`: 扫描并加载 `src/assets` 中的所有资源。
- `getTexture(name: string)`: 通过文件名（无扩展名）返回 `pc.Texture`。
- `getAsset(name: string)`: 返回原始的 `pc.Asset`。

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

## CardManager

只读的卡牌数据管理器。

```typescript
const cards = context.getCardManager();
const weapons = cards?.getAllWeaponCards();
```

- `getAllQuestionCards()`: 获取所有问题卡数据。
- `getAllWeaponCards()`: 获取所有武器卡数据。
- `getAllBuffCards()`: 获取所有增益卡数据。
