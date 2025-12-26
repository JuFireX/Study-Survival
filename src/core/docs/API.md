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

## SceneManager(待完善)

管理游戏场景。

```typescript
// 用法
context.getSceneManager().loadScene("my_scene");
```

- `loadScene(name: string)`: 加载场景文件（在 `src/scenes` 中）。
- `getCurrentScene(): pc.Scene | null` - 获取当前加载的场景。

## UIManager(待完善)

控制 UI 元素。

```typescript
// 用法
context.getUIManager().show("my_ui");
```

- `show(name: string)`: 显示 UI 元素（在 `src/ui` 中）。
- `hide(name: string)`: 隐藏 UI 元素。
- `getElement(name: string): pc.Element | null` - 获取 UI 元素的引用。

## CardManager(待完善)

访问卡牌数据。

```typescript
// 用法
const card = context.getCardManager()?.getCard("my_card");
```

- `getCard(name: string)`: 通过卡牌名称返回 `Card` 对象。
- `getAllCards(): Card[]` - 获取所有已加载的卡牌。
