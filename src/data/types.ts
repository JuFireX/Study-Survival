export interface PlayerStats {
    // 1. 生命/护盾类
    currentHealth: number;
    maxHealth: number;
    tempShield: number;
    maxShield: number;
    lifesteal: number; // 吸血转化率
    healthRegen: number; // 每秒回血
    killHeal: number; // 击杀回血
    pickupHeal: number; // 拾取回血

    // 2. 攻击类
    baseDamage: number;
    damageMultiplier: number;
    critRate: number;
    critMultiplier: number;
    attackSpeed: number; // CD缩减
    projectileCount: number;
    pierceCount: number;
    areaSize: number; // 溅射范围

    // 3. 防御/生存类
    armor: number;
    damageReduction: number; // %
    dodgeRate: number;
    moveSpeed: number;
    thorns: number; // 反伤
    revives: number;
    invincibleTime: number; // 复活后无敌时间

    // 4. 资源/经济类
    expMultiplier: number;
    goldMultiplier: number;
    shopDiscount: number; // %
    luck: number;
    pickupRange: number;

    // 5. 机制类
    cooldownReductionLimit: number;
    skillDuration: number;
    projectileSize: number;
    curse: number; // 诅咒层数
    rerolls: number;
    skips: number;
    banishes: number;
}

export interface EnemyStats {
    currentHealth: number;
    maxHealth: number;
    damage: number;
    defense: number;
    moveSpeed: number;
    expValue: number; // 掉落能量值
}

export enum CardType {
    Buff = 'buff',
    Weapon = 'weapon'
}

export enum CardRarity {
    Common = 'common',
    Rare = 'rare',
    Epic = 'epic',
    Legendary = 'legendary'
}

export interface CardEffect {
    stat: keyof PlayerStats;
    value: number; // 可以是固定值或百分比，视具体逻辑而定
    type: 'add' | 'multiply';
}

export interface Card {
    id: string;
    name: string;
    description: string;
    type: CardType;
    rarity: CardRarity;
    effects: CardEffect[];
    // 武器特有
    weaponId?: string;
    // 进化/合成需求
    requiredCardId?: string;
}

export interface LevelConfig {
    level: number;
    expRequired: number;
}
