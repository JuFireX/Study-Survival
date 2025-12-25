import { LevelConfig, PlayerStats } from './types';

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
        defense: 0,
        magicDefense: 0,

        moveSpeed: 10,
        pickupRange: 3.0,
        expEfficiency: 1.0,
        luck: 1.0
    } as PlayerStats
};
