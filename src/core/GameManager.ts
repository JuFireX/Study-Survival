import * as pc from 'playcanvas';
import { GameContext } from './GameContext';
import { ResourceManager } from './manager/ResourceManager';
import { SceneManager } from './manager/SceneManager';
import { UIManager } from './manager/UIManager';
import { CardManager } from './manager/CardManager';
import { IGameSystem } from '../config/types';

// Systems
import { CharacterSystem } from '../systems/character/CharacterSystem';
import { WeaponSystem } from '../systems/weapon/WeaponSystem';
import { EnemySystem } from '../systems/enemy/EnemySystem';
import { DropSystem } from '../systems/drop/DropSystem';
import { CardSystem } from '../systems/card/CardSystem';


/**
 * 游戏管理器 (GameManager)
 * 
 * 职责:
 * 1. 核心循环的指挥者，负责初始化系统、管理系统和游戏时间因子。
 * 2. 负责构建初始场景和实体 (Player, Camera)。
 * 3. 负责管理所有子系统 (Systems) 的生命周期。
 */
export class GameManager {
    private static instance: GameManager | null = null;

    private app: pc.Application;
    private context: GameContext;
    private systems: IGameSystem[] = [];
    private ui: UIManager;
    private pauseCount = 0;
    private previousTimeScale = 1;

    private constructor() {
        this.context = GameContext.getInstance();
        this.app = this.context.getApp();
        this.context.setGameManager(this);
        (window as any).gameManager = this;

        const eventBus = this.context.getEventBus();
        eventBus.on('game:pause', this.onGamePause, this);
        eventBus.on('game:resume', this.onGameResume, this);

        // 2. 初始化资产管理器
        const resourceManager = ResourceManager.getInstance();
        this.context.setResourceManager(resourceManager);
        // 3. 构建基础场景 (Camera, Lights, Ground)
        const sceneManager = SceneManager.getInstance();
        this.context.setSceneManager(sceneManager);
        const camera = sceneManager.buildScene();
        this.context.setCamera(camera);
        // 4. 初始化 UI 管理器
        this.ui = UIManager.getInstance();
        this.context.setUIManager(this.ui);
        // 5. 初始化卡牌管理器
        const cardManager = CardManager.getInstance();
        this.context.setCardManager(cardManager);
        // 6. 初始化所有游戏系统
        this.initializeSystems();
        // 8. 启动 Update 循环
        this.app.on('update', this.update, this);
        // 9. 播放背景音乐
        this.playBackgroundMusic();
        console.log("[游戏管理器] 初始化成功.");
    }

    private playBackgroundMusic() {
        const resourceManager = ResourceManager.getInstance();
        const bgmAsset = resourceManager.getAsset('main theme');

        if (bgmAsset) {
            console.log('[游戏管理器] 播放背景音乐: main theme');
            const bgmEntity = new pc.Entity('BackgroundMusic');
            bgmEntity.addComponent('sound');

            bgmEntity.sound!.addSlot('bgm', {
                asset: bgmAsset.id,
                autoPlay: true,
                loop: true,
                volume: 0.5
            });

            bgmEntity.sound!.positional = false; // 设置为非空间音频

            this.app.root.addChild(bgmEntity);
            bgmEntity.sound!.play('bgm');
        } else {
            console.warn('[游戏管理器] 背景音乐 "main theme" 未找到!');
        }
    }

    //暂停游戏
    private onGamePause(): void {
        if (this.pauseCount === 0) {
            this.previousTimeScale = typeof this.app.timeScale === 'number' ? this.app.timeScale : 1;
            this.app.timeScale = 0;
        }
        this.pauseCount++;
    }

    //恢复游戏
    private onGameResume(): void {
        if (this.pauseCount <= 0) return;

        this.pauseCount--;
        if (this.pauseCount === 0) {
            this.app.timeScale = this.previousTimeScale;
        }
    }

    public static getInstance(): GameManager {
        if (!GameManager.instance) {
            GameManager.instance = new GameManager();
        }
        return GameManager.instance;
    }

    /**
     * 初始化系统列表
     * 注意：初始化顺序很重要
     */
    private initializeSystems() {
        // 导入所有系统
        this.systems.push(new CharacterSystem());
        this.systems.push(new WeaponSystem());
        this.systems.push(new EnemySystem());
        this.systems.push(new DropSystem());
        this.systems.push(new CardSystem());

        // 执行初始化
        this.systems.forEach(sys => {
            console.log(`[游戏管理器] 初始化系统: ${sys.constructor.name}`);
            sys.initialize();
        });
    }

    /**
     * 主更新循环
     * @param dt Delta time (seconds)
     */
    private update(dt: number) {
        for (const sys of this.systems) {
            sys.update(dt);
        }
    }
}
