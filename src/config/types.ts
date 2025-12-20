export interface PlayerStats {
    // 1. 生命/护盾类
    currentHealth: number;// 当前生命值
    maxHealth: number;// 最大生命值
    tempShield: number;// 当前护盾值
    maxShield: number;// 最大护盾值
    lifesteal: number; // 吸血转化率
    healthRegen: number; // 每秒回血
    killHeal: number; // 击杀回血
    pickupHeal: number; // 拾取回血

    // 2. 攻击类
    baseDamage: number;// 基础伤害
    damageMultiplier: number;// 伤害 multiplier
    critRate: number;// 暴击率
    critMultiplier: number;// 暴击伤害 multiplier
    attackSpeed: number; // CD缩减
    projectileCount: number;// 弹射次数
    pierceCount: number;// 穿透次数
    areaSize: number; // 溅射范围

    // 3. 防御/生存类
    armor: number;// 护甲值
    damageReduction: number; // 减伤%
    dodgeRate: number;// 闪避率
    moveSpeed: number;// 移动速度
    thorns: number; // 反伤
    revives: number;// 复活次数
    invincibleTime: number; // 复活后无敌时间

    // 4. 资源/经济类
    expMultiplier: number;// 经验 multiplier
    goldMultiplier: number;// 金币 multiplier
    shopDiscount: number; // %
    luck: number;// 幸运值
    pickupRange: number;// 拾取范围

    // 5. 机制类
    cooldownReductionLimit: number;// 冷却缩减限制
    skillDuration: number;// 技能持续时间
    projectileSize: number;// 弹射范围
    curse: number; // 诅咒层数
    rerolls: number;// 重新投掷次数
    skips: number;// 跳过次数
    banishes: number;// 放逐次数
}

export interface EnemyStats {
    currentHealth: number;// 当前生命值
    maxHealth: number;// 最大生命值
    damage: number;// 伤害
    defense: number;// 防御
    moveSpeed: number;// 移动速度
    expValue: number;// 掉落能量值
}

export enum CardType {
    Buff = 'buff',// 增益卡
    Weapon = 'weapon'// 武器卡
}

export enum CardRarity {
    Common = 'common',// 普通卡
    Rare = 'rare',// 稀有卡
    Epic = 'epic',// 史诗卡
    Legendary = 'legendary'// 传说卡
}

export interface CardEffect {
    stat: keyof PlayerStats;// 影响的属性
    value: number; // 可以是固定值或百分比，视具体逻辑而定
    type: 'add' | 'multiply';// 影响类型，添加或乘法
}

export interface Card {
    id: string;// 卡片ID
    name: string;// 卡片名称
    description: string;// 卡片描述
    type: CardType;// 卡片类型
    rarity: CardRarity;// 卡片稀有度
    effects: CardEffect[];// 卡片效果
    // 武器特有
    weaponId?: string;// 武器ID
    // 进化/合成需求
    requiredCardId?: string;// 进化/合成需求的卡片ID
}

export interface LevelConfig {
    level: number;// 等级
    expRequired: number;// 升级所需经验
}
