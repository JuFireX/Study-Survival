import * as pc from 'playcanvas';
import { IGameSystem } from '../../config/types';
import { GameContext } from '../../core/GameContext';
import { EventBus } from '../../core/EventBus';
import { BaseCharacter } from '../../entities/characters';
import { CharacterRegistry } from '../../entities/characters/CharacterRegistry';

// 确保引用被加载，从而触发自注册
import '../../entities/characters/c_AAA';

/**
 * 角色系统 (CharacterSystem)
 * 
 * 职责:
 * 1. 管理实体及其状态: 玩家角色 (健康、能量、状态效果)
 * 2. 处理玩家输入 (摇杆)
 * 3. 驱动角色更新
 */
export class CharacterSystem implements IGameSystem {
    private static instance: CharacterSystem;
    private context: GameContext;
    private eventBus: EventBus;
    private character: BaseCharacter | null = null;
    private joystickInput: pc.Vec2 = new pc.Vec2();

    constructor() {
        CharacterSystem.instance = this;
        this.context = GameContext.getInstance();
        this.eventBus = this.context.getEventBus();

        // 监听输入事件
        this.eventBus.on('input:joystick', this.onJoystickInput, this);
    }

    private onJoystickInput(x: number, y: number) {
        this.joystickInput.set(x, y);
    }

    public static getInstance(): CharacterSystem {
        return CharacterSystem.instance;
    }

    /**
     * 获取当前角色统计数据
     */
    public getPlayerStats() {
        return this.character?.stats;
    }

    /**
     * 初始化 UI 状态
     */
    private initializeCharacterState() {
        if (!this.character) return;

        // 初始更新 UI
        this.eventBus.fire('ui:updateHealth', this.character.stats.currentHealth, this.character.stats.maxHealth);
        this.eventBus.fire('ui:updateExp', 0, this.character.getMaxExp());
        this.eventBus.fire('ui:updateLevel', this.character.getLevel());
    }

    /**
     * 获取摇杆输入向量
     */
    public getJoystickInput(): pc.Vec2 {
        return this.joystickInput;
    }

    private createCharacter(type: string) {
        if (this.character) {
            this.character.destroy();
            this.character = null;
        }

        const app = this.context.getApp();

        // 创建玩家实体
        const playerEntity = new pc.Entity('Player');
        app.root.addChild(playerEntity);
        playerEntity.setPosition(0, 1, 0);

        // 绑定到 GameContext
        this.context.setPlayer(playerEntity);

        // 使用注册表工厂创建角色
        this.character = CharacterRegistry.create(type, playerEntity);

        if (!this.character) {
            console.warn(`[角色系统] 无法创建角色类型: ${type}. 回退到默认角色.`);
        } else {
            console.log(`[角色系统] 创建角色: ${type}`);
        }

        this.initializeCharacterState();    // 初始化 UI 状态
        this.setupCameraFollow();           // 设置相机跟随
    }

    /**
     * 设置相机跟随玩家
     */
    private setupCameraFollow() {
        const camera = this.context.getCamera();
        const player = this.context.getPlayer();

        if (!(camera && player)) return;

        this.context.getApp().on('update', () => {
            const pos = player.getPosition();
            camera.setPosition(pos.x, 20, pos.z + 15);
            camera.lookAt(pos.x, 0, pos.z);
        }, this);

        console.log('[角色系统] 相机跟随已设置');
    }

    /**
     * 初始化角色系统
     */
    initialize(): void {
        console.log('[角色系统] 初始化...');
        this.createCharacter('c_AAA');
    }

    /**
     * 更新角色系统
     */
    update(dt: number): void {
        if (!this.character) return;

        // 获取摇杆输入
        const input = this.joystickInput;
        if (input.lengthSq() > 0.0001) {
            const moveDir = new pc.Vec3(input.x, 0, input.y);
            if (input.lengthSq() > 1) {
                moveDir.normalize();
            }
            this.character.move(moveDir, dt);
        }

        this.character.update(dt);
    }
}
