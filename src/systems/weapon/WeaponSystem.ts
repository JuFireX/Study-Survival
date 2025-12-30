import * as pc from 'playcanvas';
import { IGameSystem, WeaponStats } from '../../config/types';
import { GameContext } from '../../core/GameContext';
import { EventBus } from '../../core/EventBus';
import { BaseWeapon, Pistol, Sword } from '../../entities/weapons';

/**
 * 武器系统 (WeaponSystem)
 * 
 * 职责:
 * 1. 管理所有激活的武器实例。
 * 2. 负责武器的生命周期 (创建, 升级, 销毁)。
 * 3. 驱动武器的帧更新。
 */
export class WeaponSystem implements IGameSystem {
    private context: GameContext;
    private eventBus: EventBus;
    private player: pc.Entity | null = null;
    private activeWeapons: BaseWeapon[] = [];

    constructor() {
        this.context = GameContext.getInstance();
        this.eventBus = this.context.getEventBus();
    }

    public addWeapon(type: string) {
        const player = this.player ?? this.context.getPlayer();
        if (!player) {
            console.warn('[武器系统] Player 未就绪，无法添加武器');
            return;
        }
        this.player = player;

        let weapon: BaseWeapon | null = null;

        // TODO: 这里应该从配置表读取初始属性
        const defaultStats: WeaponStats = {
            damage: 10,
            cooldown: 1.0,
            range: 20,
            projectileSpeed: 15,
            projectileCount: 1,
            pierceCount: 0,
            areaSize: 1
        };

        const id = `${type}_${Date.now()}`;

        switch (type.toLowerCase()) {
            case 'pistol':
                weapon = new Pistol(id, player, {
                    ...defaultStats,
                    cooldown: 0.8,
                    damage: 15
                });
                break;
            case 'sword':
                weapon = new Sword(id, player, {
                    ...defaultStats,
                    cooldown: 1.5,
                    damage: 30,
                    areaSize: 3
                });
                break;
            default:
                console.warn(`[武器系统] 未知武器类型: ${type}`);
                break;
        }

        if (weapon) {
            this.activeWeapons.push(weapon);
            console.log(`[武器系统] 添加武器: ${type}`);
            this.eventBus.fire('weapon:added', weapon);
        }
    }

    /**
     * 获取当前所有武器
     */
    public getWeapons(): BaseWeapon[] {
        return this.activeWeapons;
    }


    initialize(): void {
        console.log('[武器系统] 初始化...');

        this.player = this.context.getPlayer();
        if (this.player) {
            this.addWeapon('pistol');
            return;
        }

        this.eventBus.once('player:init', () => {
            this.addWeapon('pistol');
        }, this);
    }

    update(dt: number): void {
        this.activeWeapons.forEach(weapon => {
            weapon.update(dt);
        });
    }
}
