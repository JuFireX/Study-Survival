export interface PlayerStats {
    // 1. 生存类
    currentHealth: number; // 当前生命值
    maxHealth: number;     // 最大生命值
    defense: number;       // 物抗
    magicDefense: number;  // 法抗

    // 2. 移动/机制类
    moveSpeed: number;     // 移动速度
    pickupRange: number;   // 拾取范围
    expEfficiency: number; // 经验获取效率
    luck: number;          // 幸运值
}

export interface EnemyStats {
    currentHealth: number; // 当前生命值
    maxHealth: number;     // 最大生命值
    damage: number;        // 伤害
    defense: number;       // 防御
    moveSpeed: number;     // 移动速度
    expValue: number;      // 掉落能量值
}

// 武器属性 (新增，用于武器系统独立计算)
export interface WeaponStats {
    damage: number;
    cooldown: number;
    range: number;
    projectileSpeed: number;
    projectileCount: number;
    pierceCount: number;
    areaSize: number;
}

export enum CardType {
    Buff = 'buff',       // 增益卡
    Weapon = 'weapon',   // 武器卡
    Question = 'question'// 题目卡
}

export enum CardRarity {
    Common = 'common',      // 普通卡
    Rare = 'rare',          // 稀有卡
    Epic = 'epic',          // 史诗卡
    Legendary = 'legendary' // 传说卡
}

export interface CardEffect {
    // 目标: 默认为 player, 也可以是 weapon 或 enemy
    target?: 'player' | 'weapon' | 'enemy';
    // 影响的属性: 这里放宽为 string 以支持不同目标的属性 (如 weapon.damage)
    stat: string;
    value: number; // 可以是固定值或百分比
    type: 'add' | 'multiply'; // 影响类型
}

export interface QuestionData {
    id: number;
    subject: string;
    difficulty: number;
    text: string;
    type?: 'choice' | 'fill' | 'multi-choice';
    options?: string[];
    correct?: number | number[]; // Index or indices for choice
    answer?: string; // String answer for fill
}

export interface Card {
    id: string;          // 卡片ID
    name: string;        // 卡片名称
    description: string; // 卡片描述
    type: CardType;      // 卡片类型
    rarity: CardRarity;  // 卡片稀有度
    effects: CardEffect[]; // 卡片效果

    // 武器特有
    weaponId?: string;   // 武器ID

    // 进化/合成需求
    requiredCardId?: string; // 进化/合成需求的卡片ID

    // 题目相关
    questionDifficulty?: number; // 题目难度
    question?: QuestionData;     // 具体题目数据
}

export interface LevelConfig {
    level: number;      // 等级
    expRequired: number;// 升级所需经验
}
