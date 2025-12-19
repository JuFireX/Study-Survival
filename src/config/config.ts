import { LevelConfig } from '../data/types';

export const GameConfig = {
    // 经验值配置 (简单的指数增长示例)
    levelTable: Array.from({ length: 100 }, (_, i) => {
        const level = i + 1;
        // 降低升级门槛：Level 1 -> 30 XP (3个怪)
        return {
            level: level,
            expRequired: Math.floor(30 * Math.pow(1.2, level - 1))
        } as LevelConfig;
    }),

    // 能量获取效率 (默认 1.0)
    baseExpEfficiency: 1.0,

    // 默认玩家属性
    defaultPlayerStats: {
        currentHealth: 100,
        maxHealth: 100,
        tempShield: 0,
        maxShield: 0,
        lifesteal: 0,
        healthRegen: 0,
        killHeal: 0,
        pickupHeal: 0,

        baseDamage: 10,
        damageMultiplier: 1.0,
        critRate: 0.05,
        critMultiplier: 1.5,
        attackSpeed: 1.0,
        projectileCount: 1,
        pierceCount: 0,
        areaSize: 1.0,

        armor: 0,
        damageReduction: 0,
        dodgeRate: 0,
        moveSpeed: 10,
        thorns: 0,
        revives: 0,
        invincibleTime: 0,

        expMultiplier: 1.0,
        goldMultiplier: 1.0,
        shopDiscount: 0,
        luck: 1.0,
        pickupRange: 3.0,

        cooldownReductionLimit: 0.4,
        skillDuration: 1.0,
        projectileSize: 1.0,
        curse: 0,
        rerolls: 0,
        skips: 0,
        banishes: 0
    }
};
