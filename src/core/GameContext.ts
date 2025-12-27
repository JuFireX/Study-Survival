import * as pc from 'playcanvas';
import { EventBus } from './EventBus';
import { GameManager } from './GameManager';
import { UIManager } from './manager/UIManager';
import { CardManager } from './manager/CardManager';
import { ResourceManager } from './manager/ResourceManager';
import { SceneManager } from './manager/SceneManager';

/**
 * 游戏上下文 (GameContext)
 * 
 * 职责:
 * 1. 作为服务定位器 (Service Locator)，提供对核心游戏对象的全局访问点。
 * 2. 存储全局单例引用：`Application`, `Player Entity`, `Camera`, `EventBus`, `GameManager` 等。
 * 3. 避免在系统和类之间传递过多的参数。
 * 
 * 使用单例模式。
 */
export class GameContext {
    private static instance: GameContext;

    // 核心 PlayCanvas 对象
    private app: pc.Application | null = null;
    private player: pc.Entity | null = null;
    private camera: pc.Entity | null = null;

    // 核心管理器
    private eventBus: EventBus;                             // 事件总线
    private gameManager: GameManager | null = null;         // 游戏管理器
    private resourceManager: ResourceManager | null = null; // 资产管理器
    private sceneManager: SceneManager | null = null;       // 场景管理器
    private cardManager: CardManager | null = null;         // 卡牌管理器
    private uiManager: UIManager | null = null;             // 用户界面管理器

    private constructor() {
        this.eventBus = EventBus.getInstance();
    }

    /**
     * 获取 GameContext 单例实例
     */
    public static getInstance(): GameContext {
        if (!GameContext.instance) {
            GameContext.instance = new GameContext();
        }
        return GameContext.instance;
    }

    // ==========================================
    // Application Access
    // ==========================================

    /**
     * 设置 Application 实例
     * 通常在 GameApplication 初始化时调用
     */
    public setApp(app: pc.Application) {
        this.app = app;
    }

    /**
     * 获取 Application 实例
     * @throws Error 如果 Application 尚未初始化
     */
    public getApp(): pc.Application {
        if (!this.app) {
            throw new Error("[GameContext] Application not initialized!");
        }
        return this.app;
    }

    // ==========================================
    // EventBus Access
    // ==========================================

    /**
     * 获取全局事件总线
     */
    public getEventBus(): EventBus {
        return this.eventBus;
    }

    // ==========================================
    // Scene Objects Access
    // ==========================================

    /**
     * 设置玩家实体
     */
    public setPlayer(player: pc.Entity) {
        this.player = player;
    }

    /**
     * 获取玩家实体
     */
    public getPlayer(): pc.Entity | null {
        return this.player;
    }

    /**
     * 设置主摄像机
     */
    public setCamera(camera: pc.Entity) {
        this.camera = camera;
    }

    /**
     * 获取主摄像机
     */
    public getCamera(): pc.Entity | null {
        return this.camera;
    }

    // ==========================================
    // Managers Access
    // ==========================================

    /**
     * 设置 GameManager 实例
     */
    public setGameManager(manager: GameManager) {
        this.gameManager = manager;
    }

    /**
     * 获取 GameManager 实例
     */
    public getGameManager(): GameManager | null {
        return this.gameManager;
    }

    /**
     * 设置 ResourceManager 实例
     */
    public setResourceManager(manager: ResourceManager) {
        this.resourceManager = manager;
    }

    /**
     * 获取 ResourceManager 实例
     */
    public getResourceManager(): ResourceManager | null {
        return this.resourceManager;
    }

    /**
     * 设置 UIManager 实例
     */
    public setUIManager(manager: UIManager) {
        this.uiManager = manager;
    }

    /**
     * 获取 UIManager 实例
     */
    public getUIManager(): UIManager | null {
        return this.uiManager;
    }

    /**
     * 设置 CardManager 实例
     */
    public setCardManager(manager: CardManager) {
        this.cardManager = manager;
    }

    /**
     * 获取 CardManager 实例
     */
    public getCardManager(): CardManager | null {
        return this.cardManager;
    }

    /**
     * 设置 SceneManager 实例
     */
    public setSceneManager(manager: SceneManager) {
        this.sceneManager = manager;
    }

    /**
     * 获取 SceneManager 实例
     */
    public getSceneManager(): SceneManager | null {
        return this.sceneManager;
    }
}
