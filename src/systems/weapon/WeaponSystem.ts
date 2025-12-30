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
        this.player = this.context.getPlayer();
    }

    public addWeapon(type: string) {
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
                weapon = new Pistol(id, this.player!, {
                    ...defaultStats,
                    cooldown: 0.8,
                    damage: 15
                });
                break;
            case 'sword':
                weapon = new Sword(id, this.player!, {
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

            // 广播武器添加事件
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
        if (!this.player) return;

        this.addWeapon('pistol');
    }

    update(dt: number): void {
        // 更新所有激活的武器
        this.activeWeapons.forEach(weapon => {
            weapon.update(dt);
        });
    }
}
