import * as pc from 'playcanvas';
import { BaseWeapon } from './share/BaseWeapon';
import { WeaponStats } from '../../config/types';

export type WeaponConstructor = new (id: string, owner: pc.Entity, stats: WeaponStats) => BaseWeapon;

/**
 * 武器注册表 (WeaponRegistry)
 */
export class WeaponRegistry {
    private static registry = new Map<string, WeaponConstructor>();

    /**
     * 注册武器类型
     */
    public static register(type: string, ctor: WeaponConstructor) {
        if (this.registry.has(type)) {
            console.warn(`[武器注册表] 武器类型 '${type}' 已注册. 覆盖.`);
        }
        this.registry.set(type, ctor);
        console.log(`[武器注册表] 注册: ${type}`);
    }

    /**
     * 创建武器实例
     */
    public static create(type: string, id: string, owner: pc.Entity, stats: WeaponStats): BaseWeapon | null {
        const Ctor = this.registry.get(type);
        if (!Ctor) {
            console.error(`[武器注册表] 未知武器类型: ${type}`);
            return null;
        }
        return new Ctor(id, owner, stats);
    }

    public static getRegisteredTypes(): string[] {
        return Array.from(this.registry.keys());
    }
}
