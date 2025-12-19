import * as pc from 'playcanvas';
import { EventBus } from './EventBus';

/**
 * 游戏上下文
 * 充当服务定位器，保存对 Application、Player Entity 和各种 Manager 的全局引用。
 * 避免在类之间传递过多的参数。
 */
export class GameContext {
    private static instance: GameContext;

    public app: pc.Application | null = null;
    public player: pc.Entity | null = null;
    public camera: pc.Entity | null = null;
    public eventBus: EventBus;
    
    // 这里可以添加其他的 Manager 引用
    // public gameManager: GameManager | null = null;

    private constructor() {
        this.eventBus = EventBus.getInstance();
    }

    public static getInstance(): GameContext {
        if (!GameContext.instance) {
            GameContext.instance = new GameContext();
        }
        return GameContext.instance;
    }

    /**
     * 设置 Application 实例
     * @param app PlayCanvas Application
     */
    public setApp(app: pc.Application) {
        this.app = app;
    }

    /**
     * 获取 Application 实例
     */
    public getApp(): pc.Application {
        if (!this.app) {
            throw new Error("GameContext: Application not initialized!");
        }
        return this.app;
    }

    /**
     * 设置玩家实体
     * @param player 玩家 Entity
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
     * @param camera 摄像机 Entity
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
}
