import * as pc from 'playcanvas';
import { GameContext } from './GameContext';
import { ResourceManager } from './manager/ResourceManager';
import { SceneManager } from './manager/SceneManager';
import { UIManager } from './manager/UIManager';
import { CardManager } from './manager/CardManager';
import { IGameSystem } from '../config/types';

// Systems
import { DebugSystem } from '../systems/DebugSystem';
// import { CharacterSystem } from '../systems/character/CharacterSystem';
// import { EnemySystem } from '../systems/enemy/EnemySystem';
// import { WeaponSystem } from '../systems/weapon/WeaponSystem';
// import { CardSystem } from '../systems/card/CardSystem';
// import { QuestionSystem } from '../systems/question/QuestionSystem';
// import { SceneSystem } from '../systems/scene/SceneSystem';
// import { IGameSystem } from '../systems/IGameSystem';

// Scripts
// import { PlayerController } from '../entities/characters/share/PlayerController';
// import { PlayerStats } from '../entities/characters/share/PlayerStats';
// import { AAA } from '../entities/characters/c_AAA/AAA';
// import { EnemyBehavior } from '../entities/enemies/share/EnemyBehavior';
// import { FastEnemy } from '../entities/enemies/e_fast/FastEnemy';
// import { TankEnemy } from '../entities/enemies/e_tank/TankEnemy';
// import { WeaponController } from '../entities/weapons/share/WeaponController';
// import { BulletBehavior } from '../entities/weapons/share/BulletBehavior';

/**
 * 游戏管理器 (GameManager)
 * 
 * 职责:
 * 1. 核心循环的指挥者，负责初始化系统、编排流程和状态管理。
 * 2. 负责构建初始场景和实体 (Player, Camera)。
 * 3. 负责管理所有子系统 (Systems) 的生命周期。
 */
export class GameManager {
    private static instance: GameManager | null = null;

    private app: pc.Application;
    private context: GameContext;
    private systems: IGameSystem[] = [];
    private ui: UIManager;

    private constructor() {
        this.context = GameContext.getInstance();
        this.app = this.context.getApp();

        // 注册自身到 Context
        this.context.setGameManager(this);

        // 调试用: 暴露到全局 window 对象
        (window as any).gameManager = this;

        // 1. 注册脚本
        // this.registerScripts();

        // 2. 初始化资产管理器
        const resourceManager = ResourceManager.getInstance();
        this.context.setResourceManager(resourceManager);

        // 3. 构建基础场景 (Camera, Lights, Ground)
        const sceneManager = SceneManager.getInstance();
        this.context.setSceneManager(sceneManager);
        const camera = sceneManager.buildScene();
        this.context.setCamera(camera);

        // 4. 初始化 UI
        this.ui = UIManager.getInstance();
        this.context.setUIManager(this.ui);

        // 5. 初始化卡牌管理器
        const cardManager = CardManager.getInstance();
        this.context.setCardManager(cardManager);

        // 6. 创建玩家
        this.createPlayer();

        // 7. 初始化所有游戏系统
        this.initializeSystems();

        // 8. 启动 Update 循环
        this.app.on('update', this.update, this);

        console.log("[GameManager] Initialized successfully.");
    }

    public static getInstance(): GameManager {
        if (!GameManager.instance) {
            GameManager.instance = new GameManager();
        }
        return GameManager.instance;
    }

    /**
     * 注册 PlayCanvas 脚本组件
     */
    // private registerScripts() {
    //     pc.registerScript(PlayerController, 'playerController');
    //     pc.registerScript(PlayerStats, 'playerStats');
    //     pc.registerScript(AAA, 'aaa');
    //     pc.registerScript(EnemyBehavior, 'enemyBehavior');
    //     pc.registerScript(FastEnemy, 'fastEnemy');
    //     pc.registerScript(TankEnemy, 'tankEnemy');
    //     pc.registerScript(WeaponController, 'weaponController');
    //     pc.registerScript(BulletBehavior, 'bulletBehavior');
    // }

    /**
     * 创建玩家实体
     */
    private createPlayer() {
        const player = new pc.Entity('Player');
        player.addComponent('model', { type: 'capsule' });

        // 初始化脚本组件
        player.addComponent('script');

        // 添加角色特定逻辑
        player.script!.create('aaa');
        player.script!.create('playerStats');
        player.script!.create('playerController');
        player.script!.create('weaponController');

        player.setPosition(0, 1, 0);
        this.app.root.addChild(player);

        // 注册到 Context
        this.context.setPlayer(player);

        // 设置摄像机跟随
        this.setupCameraFollow(player);
    }

    /**
     * 设置摄像机跟随逻辑
     */
    private setupCameraFollow(target: pc.Entity) {
        const camera = this.context.getCamera();
        if (camera) {
            // 简单的跟随逻辑，后续可以迁移到专门的 CameraSystem
            this.app.on('update', () => {
                const pos = target.getPosition();
                camera.setPosition(pos.x, 20, pos.z + 15);
                camera.lookAt(pos.x, 0, pos.z);
            });
        }
    }

    /**
     * 初始化系统列表
     * 注意：初始化顺序很重要
     */
    private initializeSystems() {
        // 1. 基础/调试系统
        this.systems.push(new DebugSystem());

        // 2. 数据/服务系统
        // const questionSystem = new QuestionSystem();
        // this.systems.push(questionSystem);

        // 3. 核心玩法系统
        // this.systems.push(new SceneSystem()); // 场景动态管理
        // this.systems.push(new CharacterSystem(this.ui)); // 角色管理
        // this.systems.push(new EnemySystem(this.ui)); // 敌人管理
        // this.systems.push(new WeaponSystem()); // 武器管理
        // this.systems.push(new CardSystem(this.ui, questionSystem)); // 升级/卡牌系统

        // 执行初始化
        this.systems.forEach(sys => {
            console.log(`[GameManager] Initializing system: ${sys.constructor.name}`);
            sys.initialize();
        });
    }

    /**
     * 主更新循环
     * @param dt Delta time (seconds)
     */
    private update(dt: number) {
        // 可以在这里处理全局暂停逻辑
        // if (this.isPaused) return;

        for (const sys of this.systems) {
            sys.update(dt);
        }
    }
}
