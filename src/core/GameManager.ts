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
    private mode: 'lobby' | 'game' = 'lobby';
    private systemsInitialized = false;
    private lobbyPlayer: pc.Entity | null = null;
    private lobbyPortal: pc.Entity | null = null;
    private lobbyCharacterStand: pc.Entity | null = null;
    private lobbyMoveSpeed = 6;
    private lobbyInteractRadius = 3.5;
    private lobbyBoundsHalf = 20;
    private bgmEntity: pc.Entity | null = null;

    private constructor() {
        this.context = GameContext.getInstance();
        this.app = this.context.getApp();
        this.context.setGameManager(this);
        (window as any).gameManager = this;

        const eventBus = this.context.getEventBus();
        eventBus.on('game:pause', this.onGamePause, this);
        eventBus.on('game:resume', this.onGameResume, this);

        ScriptRegistry.init();
        const resourceManager = ResourceManager.getInstance();
        this.context.setResourceManager(resourceManager);
        const sceneManager = SceneManager.getInstance();
        this.context.setSceneManager(sceneManager);
        this.ui = UIManager.getInstance();
        this.context.setUIManager(this.ui);
        const cardManager = CardManager.getInstance();
        this.context.setCardManager(cardManager);
        this.app.on('update', this.update, this);
        // 9. 播放背景音乐
        this.playBackgroundMusic();
        console.log("[游戏管理器] 初始化成功.");
    }

    private playBackgroundMusic() {
        if (this.bgmEntity) {
            return;
        }

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

            bgmEntity.sound!.positional = false;

            this.app.root.addChild(bgmEntity);
            bgmEntity.sound!.play('bgm');
            this.bgmEntity = bgmEntity;
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

    public startLobby() {
        const sceneManager = this.context.getSceneManager();
        if (!sceneManager) return;

        const lobby = sceneManager.buildLobbyScene();
        this.context.setCamera(lobby.camera);
        this.lobbyPortal = lobby.portal;
        this.lobbyBoundsHalf = lobby.halfSize;

        if (this.lobbyPlayer) {
            this.lobbyPlayer.destroy();
        }

        this.lobbyPlayer = this.createLobbyPlayer();
        this.mode = 'lobby';

        this.ui.setLobbyHandlers(() => this.startGameLoop(), () => this.openCharacterSelection());
        this.ui.setLobbyVisible(true);
        this.ui.setHUDVisible(false);
        this.ui.setJoystickVisible(true);
        this.ui.setCharacterSelectVisible(false);
        const characterStand = this.app.root.findByName('CharacterStand');
        this.lobbyCharacterStand = characterStand instanceof pc.Entity ? characterStand : null;
        this.updateLobbyActionState();
    }

    public startGameLoop() {
        if (this.mode === 'game') return;

        const sceneManager = this.context.getSceneManager();
        if (!sceneManager) return;

        const camera = sceneManager.buildScene();
        this.context.setCamera(camera);

        this.lobbyPlayer = null;
        this.lobbyPortal = null;
        this.lobbyCharacterStand = null;
        this.mode = 'game';

        this.ui.setLobbyVisible(false);
        this.ui.setHUDVisible(true);
        this.ui.setJoystickVisible(true);
        this.ui.setCharacterSelectVisible(false);

        if (!this.systemsInitialized) {
            this.initializeSystems();
            this.systemsInitialized = true;
        }

        this.playBackgroundMusic();
        this.context.getEventBus().fire('game:start');
    }

    public openCharacterSelection() {
        this.ui.setCharacterSelectVisible(true);
    }

    private createLobbyPlayer(): pc.Entity {
        const player = new pc.Entity('LobbyPlayer');
        player.addComponent('model', { type: 'capsule' });

        const material = new pc.StandardMaterial();
        material.diffuse = new pc.Color(0.3, 0.8, 0.9);
        material.update();
        player.model!.material = material;

        player.setLocalScale(0.7, 0.7, 0.7);
        player.setPosition(0, 0.8, 0);
        this.app.root.addChild(player);
        return player;
    }

    private updateLobby(dt: number) {
        const joystick = this.ui.getJoystick();

        if (this.lobbyPlayer && joystick) {
            const input = new pc.Vec3(joystick.value.x, 0, joystick.value.y);
            if (input.lengthSq() > 0.0001) {
                if (input.lengthSq() > 1) {
                    input.normalize();
                }
                this.moveLobbyPlayer(input, dt);
            }
        }

        if (this.lobbyPortal) {
            this.lobbyPortal.rotate(0, 30 * dt, 0);
        }

        const camera = this.context.getCamera();
        if (this.lobbyPlayer && camera) {
            const pos = this.lobbyPlayer.getPosition();
            camera.setPosition(pos.x, 12, pos.z + 16);
            camera.lookAt(pos.x, 0, pos.z);
        }

        this.updateLobbyActionState();
    }

    private moveLobbyPlayer(direction: pc.Vec3, dt: number) {
        if (!this.lobbyPlayer) return;

        const moveVec = direction.clone().mulScalar(this.lobbyMoveSpeed * dt);
        const currentPos = this.lobbyPlayer.getPosition();
        const newPos = currentPos.add(moveVec);
        const limit = Math.max(1, this.lobbyBoundsHalf - 1);
        newPos.x = pc.math.clamp(newPos.x, -limit, limit);
        newPos.z = pc.math.clamp(newPos.z, -limit, limit);
        this.lobbyPlayer.setPosition(newPos);

        const angle = Math.atan2(direction.x, direction.z) * pc.math.RAD_TO_DEG;
        const targetRotation = new pc.Quat().setFromAxisAngle(pc.Vec3.UP, angle);
        const currentRotation = this.lobbyPlayer.getRotation();
        const newRotation = new pc.Quat().slerp(currentRotation, targetRotation, 10 * dt);
        this.lobbyPlayer.setRotation(newRotation);
    }

    private updateLobbyActionState() {
        if (!this.lobbyPlayer) return;

        const playerPos = this.lobbyPlayer.getPosition();
        let canEnterPortal = false;
        let canOpenCharacter = false;

        if (this.lobbyPortal) {
            canEnterPortal = playerPos.distance(this.lobbyPortal.getPosition()) <= this.lobbyInteractRadius;
        }

        if (this.lobbyCharacterStand) {
            canOpenCharacter = playerPos.distance(this.lobbyCharacterStand.getPosition()) <= this.lobbyInteractRadius;
        }

        this.ui.setLobbyActionState(canEnterPortal, canOpenCharacter);
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
        if (this.mode === 'lobby') {
            this.updateLobby(dt);
            return;
        }

        for (const sys of this.systems) {
            sys.update(dt);
        }
    }
}
