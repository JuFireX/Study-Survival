import * as pc from 'playcanvas';
import { IGameSystem } from '../../config/types';
import { GameContext } from '../../core/GameContext';
import { EventBus } from '../../core/EventBus';
import { BaseCharacter, CharacterAAA } from '../../entities/characters';

/**
 * 角色系统 (CharacterSystem)
 * 
 * 职责:
 * 1. 管理实体及其状态: 玩家角色 (健康、能量、状态效果)
 * 2. 处理玩家输入 (摇杆)
 * 3. 驱动角色更新
 */
export class CharacterSystem implements IGameSystem {
    private context: GameContext;
    private eventBus: EventBus;
    private character: BaseCharacter | null = null;
    private joystickInput: pc.Vec2 = new pc.Vec2();

    constructor() {
        this.context = GameContext.getInstance();
        this.eventBus = this.context.getEventBus();
    }

    private createCharacter(type: string) {
        const app = this.context.getApp();

        // 创建玩家实体
        const playerEntity = new pc.Entity('Player');
        app.root.addChild(playerEntity);
        playerEntity.setPosition(0, 1, 0); // 初始位置

        // 绑定到 GameContext
        this.context.setPlayer(playerEntity);

        // 实例化具体角色逻辑
        switch (type) {
            case 'c_AAA':
                this.character = new CharacterAAA(playerEntity);
                break;
            default:
                console.warn(`[CharacterSystem] Unknown character type: ${type}`);
                this.character = new CharacterAAA(playerEntity); // Fallback
                break;
        }

        console.log(`[CharacterSystem] Created character: ${type}`);

        // 初始化 UI 状态
        this.initializeCharacterState();
    }

    private initializeCharacterState() {
        if (!this.character) return;

        this.eventBus.fire('player:init',
            this.character.stats,
            this.character.getLevel(),
            this.character.getCurrentExp(),
            this.character.getMaxExp()
        );

        console.log(`[CharacterSystem] Initialized character state: ${JSON.stringify(this.character.stats)}`);
    }

    private setupCameraFollow() {
        const camera = this.context.getCamera();
        const player = this.context.getPlayer();

        if (camera && player) {
            this.context.getApp().on('update', () => {
                const pos = player.getPosition();
                camera.setPosition(pos.x, 20, pos.z + 15);
                camera.lookAt(pos.x, 0, pos.z);
            }, this);
        }
    }

    private onPlayerHit(damage: number) {
        if (this.character) {
            this.character.takeDamage(damage);
        }
    }

    initialize(): void {
        console.log('[CharacterSystem] Initializing...');
        this.createCharacter('c_AAA');  // 这里选择 AAA 角色
        this.setupCameraFollow();
        // 订阅所有关联事件
        this.eventBus.on('player:hit', this.onPlayerHit, this);
    }

    update(dt: number): void {
        if (this.character) {
            // 处理输入
            const uiManager = this.context.getUIManager();
            const joystick = uiManager?.getJoystick();
            if (joystick) {
                this.joystickInput.set(joystick.value.x, joystick.value.y);
            }

            const inputLenSq = this.joystickInput.lengthSq();
            if (inputLenSq > 0.0001) {
                const moveDir = new pc.Vec3(this.joystickInput.x, 0, this.joystickInput.y);
                if (inputLenSq > 1) {
                    moveDir.normalize();
                }
                this.character.move(moveDir, dt);
            }

            // 更新角色逻辑
            this.character.update(dt);
        }
    }
}
