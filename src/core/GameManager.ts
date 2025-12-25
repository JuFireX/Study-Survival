import * as pc from 'playcanvas';
// import { EventBus } from './EventBus';
import { GameContext } from './GameContext';
import { SceneManager } from './SceneManager';
import { UIManager } from './UIManager';

import { DebugSystem } from '../systems/DebugSystem';
import { CharacterSystem } from '../systems/character/CharacterSystem';
import { EnemySystem } from '../systems/enemy/EnemySystem';
import { WeaponSystem } from '../systems/weapon/WeaponSystem';
import { CardSystem } from '../systems/card/CardSystem';
import { QuestionSystem } from '../systems/question/QuestionSystem';
import { SceneSystem } from '../systems/scene/SceneSystem';
import { IGameSystem } from '../systems/share/IGameSystem';

import { PlayerController } from '../entities/characters/share/PlayerController';
import { PlayerStats } from '../entities/characters/share/PlayerStats';
import { AAA } from '../entities/characters/c_AAA/AAA';
import { EnemyBehavior } from '../entities/enemies/share/EnemyBehavior';
import { FastEnemy } from '../entities/enemies/e_fast/FastEnemy';
import { TankEnemy } from '../entities/enemies/e_tank/TankEnemy';
import { WeaponController } from '../entities/weapons/share/WeaponController';
import { BulletBehavior } from '../entities/weapons/share/BulletBehavior';

/**
 * 游戏管理器 (GameManager)
 * 核心循环的指挥者，负责初始化系统、编排流程和状态管理。
 */
export class GameManager {
    private static instance: GameManager | null = null;

    public static getInstance(): GameManager {
        if (!GameManager.instance) {
            GameManager.instance = new GameManager();
        }
        return GameManager.instance;
    }

    private app: pc.Application;
    private context: GameContext;
    // private eventBus: EventBus;
    private systems: IGameSystem[] = [];
    private ui: UIManager;

    private constructor() {
        this.context = GameContext.getInstance();
        this.app = this.context.getApp();
        // this.eventBus = EventBus.getInstance();

        (window as any).gameManager = this;

        this.registerScripts();

        // 基础场景构建 (静态部分)
        const sceneManager = new SceneManager();
        const camera = sceneManager.buildScene();
        this.context.setCamera(camera);

        this.ui = new UIManager();
        this.createPlayer();

        this.initializeSystems();

        // 绑定事件 (如果有需要在 GameManager 处理的全局事件)
        // this.bindEvents();

        this.app.on('update', this.update, this);
    }

    /**
     * 注册 PlayCanvas 脚本组件
     */
    private registerScripts() {
        pc.registerScript(PlayerController, 'playerController');
        pc.registerScript(PlayerStats, 'playerStats');
        pc.registerScript(AAA, 'aaa');
        pc.registerScript(EnemyBehavior, 'enemyBehavior');
        pc.registerScript(FastEnemy, 'fastEnemy');
        pc.registerScript(TankEnemy, 'tankEnemy');
        pc.registerScript(WeaponController, 'weaponController');
        pc.registerScript(BulletBehavior, 'bulletBehavior');
    }

    /**
     * 创建玩家实体
     */
    private createPlayer() {
        const player = new pc.Entity('Player');
        player.addComponent('model', { type: 'capsule' });

        // 添加脚本组件
        player.addComponent('script');

        // 添加角色外观/逻辑（AAA）
        player.script!.create('aaa');

        // 添加 PlayerStats 脚本实例
        player.script!.create('playerStats');

        // 创建 PlayerController 实例 (Joystick 注入移交给了 CharacterSystem)
        player.script!.create('playerController');

        // 添加武器
        player.script!.create('weaponController');

        player.setPosition(0, 1, 0);
        this.app.root.addChild(player);

        // 注册到 Context
        this.context.setPlayer(player);

        // 摄像机跟随逻辑
        const camera = this.context.getCamera();
        if (camera) {
            this.app.on('update', () => {
                const pos = player.getPosition();
                camera.setPosition(pos.x, 20, pos.z + 15);
                camera.lookAt(pos.x, 0, pos.z);
            });
        }
    }

    /**
     * 初始化系统列表
     */
    private initializeSystems() {
        // 1. 基础/调试系统
        this.systems.push(new DebugSystem());

        // 2. 数据/服务系统
        const questionSystem = new QuestionSystem();
        this.systems.push(questionSystem); // 优先初始化以便加载数据

        // 3. 核心玩法系统
        this.systems.push(new SceneSystem()); // 场景管理
        this.systems.push(new CharacterSystem(this.ui)); // 角色管理 (UI, Stats, Input)
        this.systems.push(new EnemySystem(this.ui)); // 敌人管理 (Spawn, Drops, DamageText)
        this.systems.push(new WeaponSystem()); // 武器管理 (Global logic)
        this.systems.push(new CardSystem(this.ui, questionSystem)); // 卡牌/升级系统 (LevelUp flow)

        // 执行初始化
        this.systems.forEach(sys => sys.initialize());
    }

    /**
     * 主更新循环
     */
    private update(dt: number) {
        // 如果游戏暂停，部分系统可能仍需运行 (如 UI 相关的 System)
        // 这里简单处理：如果暂停，只更新非 Gameplay 系统？
        // 目前 CardSystem 接管了 timeScale，所以暂停时 update 循环仍在继续，只是 dt 可能受影响？
        // PlayCanvas app.timeScale = 0 会导致 dt = 0 passed to update? 
        // 通常是的。所以 systems.update(0) 会被调用。

        for (const sys of this.systems) {
            sys.update(dt);
        }
    }
}
