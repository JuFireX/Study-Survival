import * as pc from 'playcanvas';
import { BuffCard,IGameSystem,CardEffect,WeaponCard } from '../../config/types';
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
    private static instance: CharacterSystem;
    private context: GameContext;
    private eventBus: EventBus;
    private character: BaseCharacter | null = null;
    private joystickInput: pc.Vec2 = new pc.Vec2();

    constructor() {
        CharacterSystem.instance = this;
        this.context = GameContext.getInstance();
        this.eventBus = this.context.getEventBus();
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
     * 获取当前角色等级
     */
    public getLevel() {
        return this.character?.getLevel();
    }

    /**
     * 获取当前角色经验
     */
    public getCurrentExp() {
        return this.character?.getCurrentExp();
    }

    /**
     * 获取当前角色最大经验
     */
    public getMaxExp() {
        return this.character?.getMaxExp();
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

        // 实例化具体角色逻辑
        switch (type) {
            case 'c_AAA':
                this.character = new CharacterAAA(playerEntity);
                break;
            default:
                console.warn(`[角色系统] 未知的角色类型: ${type}`);
                this.character = new CharacterAAA(playerEntity);
                break;
        }

        console.log(`[角色系统] 创建角色: ${type}`);

        // 初始化 UI 状态
        this.initializeCharacterState();

        // 设置相机跟随
        this.setupCameraFollow();
    }

    private initializeCharacterState() {
        if (!this.character) return;

        this.eventBus.fire('player:init',
            this.character.stats,
            this.character.getLevel(),
            this.character.getCurrentExp(),
            this.character.getMaxExp()
        );

        console.log(`[角色系统] 初始化角色状态: ${JSON.stringify(this.character.stats)}`);
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
        const uiManager = this.context.getUIManager();
        const joystick = uiManager?.getJoystick();

        if (!(this.character && joystick)) return;

        this.joystickInput.set(joystick.value.x, joystick.value.y);
        this.character.update(dt);
    }
}
