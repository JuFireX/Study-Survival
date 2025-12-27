import { IGameSystem, WeaponStats } from '../../config/types';
import { GameContext } from '../../core/GameContext';
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
    private activeWeapons: BaseWeapon[] = [];

    initialize(): void {
        console.log('[WeaponSystem] Initializing...');

        // 确保玩家已存在 (GameManager 初始化顺序保证了这一点)
        const player = GameContext.getInstance().getPlayer();
        if (player) {
            // 测试：默认给玩家一把手枪
            this.addWeapon('pistol');
            // 测试：再给玩家一把剑
            this.addWeapon('sword');
        } else {
            console.warn('[WeaponSystem] Player not found during initialization.');
        }
    }

    update(dt: number): void {
        // 更新所有激活的武器
        this.activeWeapons.forEach(weapon => {
            weapon.update(dt);
        });
    }

    /**
     * 添加武器到玩家
     * @param type 武器类型 ('pistol', 'sword')
     */
    public addWeapon(type: string) {
        const player = GameContext.getInstance().getPlayer();
        if (!player) return;

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
                console.warn(`[WeaponSystem] Unknown weapon type: ${type}`);
                break;
        }

        if (weapon) {
            this.activeWeapons.push(weapon);
            console.log(`[WeaponSystem] Added weapon: ${type}`);
        }
    }

    /**
     * 获取当前所有武器
     */
    public getWeapons(): BaseWeapon[] {
        return this.activeWeapons;
    }
}
