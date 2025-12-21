import * as pc from 'playcanvas';
import { GameContext } from '../core/GameContext';
import { SceneBuilder } from '../core/SceneBuilder';
import { EventBus } from '../core/EventBus';
import { IGameSystem } from './share/IGameSystem';

import { Joystick } from '../ui/Joystick';
import { SpawnSystem } from './SpawnSystem';
import { QuizSystem } from './QuestionSystem';
import { CombatSystem } from './CombatSystem';
import { FeedbackSystem } from './FeedbackSystem';
import { DebugSystem } from './DebugSystem';
import { ProgressionSystem } from './ProgressionSystem';
import { DropSystem } from './DropSystem';

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
    private app: pc.Application;
    private context: GameContext;
    private eventBus: EventBus;
    private systems: IGameSystem[] = [];
    private joystick: Joystick;

    constructor() {
        this.context = GameContext.getInstance();
        this.app = this.context.getApp();
        this.eventBus = EventBus.getInstance();

        // 将自身暴露给 window 方便调试（不建议在正式逻辑中使用）
        (window as any).gameManager = this;

        this.registerScripts();

        // 1. 初始化场景
        const sceneBuilder = new SceneBuilder();
        const camera = sceneBuilder.buildScene();
        this.context.setCamera(camera);

        // 2. 创建玩家
        this.joystick = new Joystick();
        this.createPlayer();

        // 3. 初始化各子系统
        this.initializeSystems();

        // 4. 绑定事件
        this.bindEvents();

        // 5. 启动更新循环
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

        // 添加 PlayerStats 脚本实例（确保其它系统能通过 player.script.get('playerStats') 访问到）
        player.script!.create('playerStats');

        // 创建 PlayerController 实例并注入 Joystick
        const controller = player.script!.create('playerController') as PlayerController;
        if (controller) {
            controller.setup(this.joystick);
        }

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
        // 按依赖顺序添加系统
        this.systems.push(new FeedbackSystem()); // 优先初始化反馈系统
        this.systems.push(new DebugSystem());
        this.systems.push(new SpawnSystem());
        this.systems.push(new CombatSystem());
        this.systems.push(new QuizSystem());
        this.systems.push(new ProgressionSystem());
        this.systems.push(new DropSystem());
        // this.systems.push(new SkillSystem()); 
        // this.systems.push(new AchievementSystem());

        // 执行初始化
        this.systems.forEach(sys => sys.initialize());
    }

    /**
     * 绑定全局事件监听
     */
    private bindEvents() {
        this.eventBus.on('quiz:start', this.onQuizStart, this);
        this.eventBus.on('quiz:end', this.onQuizEnd, this);
    }

    /**
     * 主更新循环
     */
    private update(dt: number) {
        // 如果游戏暂停（timeScale = 0），部分系统可能仍需运行（如 Quiz UI）
        // 但这里我们只更新 Gameplay 相关的 Systems
        if (this.app.timeScale === 0) {
            // QuizSystem 内部自己处理暂停时的 UI 逻辑，或者它是 DOM 驱动的，不受 loop 影响
            // 如果 QuizSystem 需要在暂停时 update，可以单独调用
            return;
        }

        for (const sys of this.systems) {
            sys.update(dt);
        }
    }

    /**
     * 暂停游戏
     */
    private onQuizStart() {
        this.app.timeScale = 0;
        console.log("Game Paused for Quiz");
    }

    /**
     * 恢复游戏
     */
    private onQuizEnd(result: boolean) {
        this.app.timeScale = 1;
        console.log("Game Resumed. Result:", result);
    }
}
