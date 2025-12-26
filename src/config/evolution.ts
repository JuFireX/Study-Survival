/**
 * 进化/等级配置 (Evolution Config)
 * 
 * 职责:
 * 1. 定义玩家和世界的等级成长数值。
 * 2. 提供各等级的属性对照表。
 */
import { LevelConfig } from './types';

// 基于玩家等级的世界初始化对照表
export const WorldLevelConfig: LevelConfig[] = [
    {
        level: 1,
        expRequired: 100,
        playerStats: {
            maxHealth: 100,
            currentHealth: 100,
            defense: 0,
            magicDefense: 0,
            moveSpeed: 10,
            pickupRange: 3.0,
            expEfficiency: 1.0,
            luck: 1.0
        },
        enemyStats: {
            maxHealth: 20,
            currentHealth: 20,
            damage: 5,
            defense: 0,
            moveSpeed: 2,
            expValue: 10
        }
    },
    {
        level: 2,
        expRequired: 150,
        playerStats: {
            maxHealth: 110,
            currentHealth: 110,
            defense: 1,
            magicDefense: 0,
            moveSpeed: 10,
            pickupRange: 3.1,
            expEfficiency: 1.0,
            luck: 1.0
        },
        enemyStats: {
            maxHealth: 25,
            currentHealth: 25,
            damage: 6,
            defense: 0,
            moveSpeed: 2.1,
            expValue: 12
        }
    },
    {
        level: 3,
        expRequired: 225,
        playerStats: {
            maxHealth: 120,
            currentHealth: 120,
            defense: 2,
            magicDefense: 0,
            moveSpeed: 10.2,
            pickupRange: 3.2,
            expEfficiency: 1.05,
            luck: 1.0
        },
        enemyStats: {
            maxHealth: 30,
            currentHealth: 30,
            damage: 7,
            defense: 1,
            moveSpeed: 2.2,
            expValue: 15
        }
    },
    {
        level: 4,
        expRequired: 340,
        playerStats: {
            maxHealth: 130,
            currentHealth: 130,
            defense: 3,
            magicDefense: 1,
            moveSpeed: 10.2,
            pickupRange: 3.3,
            expEfficiency: 1.05,
            luck: 1.05
        },
        enemyStats: {
            maxHealth: 40,
            currentHealth: 40,
            damage: 8,
            defense: 1,
            moveSpeed: 2.3,
            expValue: 18
        }
    },
    {
        level: 5,
        expRequired: 510,
        playerStats: {
            maxHealth: 140,
            currentHealth: 140,
            defense: 4,
            magicDefense: 2,
            moveSpeed: 10.5,
            pickupRange: 3.5,
            expEfficiency: 1.1,
            luck: 1.1
        },
        enemyStats: {
            maxHealth: 50,
            currentHealth: 50,
            damage: 10,
            defense: 2,
            moveSpeed: 2.5,
            expValue: 22
        }
    },
    {
        level: 6,
        expRequired: 765,
        playerStats: {
            maxHealth: 150,
            currentHealth: 150,
            defense: 5,
            magicDefense: 3,
            moveSpeed: 10.5,
            pickupRange: 3.6,
            expEfficiency: 1.15,
            luck: 1.15
        },
        enemyStats: {
            maxHealth: 65,
            currentHealth: 65,
            damage: 12,
            defense: 2,
            moveSpeed: 2.6,
            expValue: 26
        }
    },
    {
        level: 7,
        expRequired: 1150,
        playerStats: {
            maxHealth: 160,
            currentHealth: 160,
            defense: 6,
            magicDefense: 4,
            moveSpeed: 10.8,
            pickupRange: 3.7,
            expEfficiency: 1.2,
            luck: 1.2
        },
        enemyStats: {
            maxHealth: 80,
            currentHealth: 80,
            damage: 14,
            defense: 3,
            moveSpeed: 2.8,
            expValue: 30
        }
    },
    {
        level: 8,
        expRequired: 1725,
        playerStats: {
            maxHealth: 175,
            currentHealth: 175,
            defense: 7,
            magicDefense: 5,
            moveSpeed: 10.8,
            pickupRange: 3.8,
            expEfficiency: 1.25,
            luck: 1.25
        },
        enemyStats: {
            maxHealth: 100,
            currentHealth: 100,
            damage: 16,
            defense: 3,
            moveSpeed: 3.0,
            expValue: 35
        }
    },
    {
        level: 9,
        expRequired: 2590,
        playerStats: {
            maxHealth: 190,
            currentHealth: 190,
            defense: 8,
            magicDefense: 6,
            moveSpeed: 11.0,
            pickupRange: 4.0,
            expEfficiency: 1.3,
            luck: 1.3
        },
        enemyStats: {
            maxHealth: 120,
            currentHealth: 120,
            damage: 18,
            defense: 4,
            moveSpeed: 3.2,
            expValue: 40
        }
    },
    {
        level: 10,
        expRequired: 3885,
        playerStats: {
            maxHealth: 210,
            currentHealth: 210,
            defense: 10,
            magicDefense: 8,
            moveSpeed: 11.2,
            pickupRange: 4.2,
            expEfficiency: 1.35,
            luck: 1.4
        },
        enemyStats: {
            maxHealth: 150,
            currentHealth: 150,
            damage: 20,
            defense: 5,
            moveSpeed: 3.5,
            expValue: 50
        }
    }
];
