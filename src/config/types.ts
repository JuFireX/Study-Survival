/**
 * 类型定义 (Type Definitions)
 * 
 * 职责:
 * 1. 集中管理项目中使用的所有 TypeScript 接口和类型别名。
 * 2. 确保数据结构的一致性。
 */
// 等级配置
export interface LevelConfig {
    level: number;                      // 等级
    expRequired: number;                // 升级所需经验
    playerStats: Partial<PlayerStats>;  // 该等级的玩家基础属性
    enemyStats: Partial<EnemyStats>;    // 该等级的怪物基础属性
}

// 角色属性(作用于角色的可用增益挂载点)
export interface PlayerStats {
    currentHealth: number; // 当前生命值
    maxHealth: number;     // 最大生命值
    defense: number;       // 物抗
    magicDefense: number;  // 法抗
    moveSpeed: number;     // 移动速度
    pickupRange: number;   // 拾取范围
    expEfficiency: number; // 经验获取效率
    luck: number;          // 幸运值
}

// 敌人属性(作用于敌人的可用增益挂载点)
export interface EnemyStats {
    currentHealth: number; // 当前生命值
    maxHealth: number;     // 最大生命值
    damage: number;        // 伤害
    defense: number;       // 防御
    moveSpeed: number;     // 移动速度
    expValue: number;      // 掉落能量值
}

// 武器属性(作用于武器的可用增益挂载点)
export interface WeaponStats {
    damage: number;         // 伤害
    cooldown: number;       // 冷却时间
    range: number;          // 攻击范围
    projectileSpeed: number; // 弹速
    projectileCount: number; // 弹数
    pierceCount: number;     // 穿透数
    areaSize: number;        // 攻击范围大小
}

// 题目数据
export interface QuestionData {
    id: number;
    subject: string;
    difficulty: number;
    text: string;
    type?: 'choice' | 'fill' | 'multi-choice';
    options?: string[];
    correct?: number | number[];     // 选择题答案选项
    answer?: string;                 // 填空题答案关键字
}

// 卡牌类型
export enum CardType {
    Buff = 'buff',       // 增益卡
    Weapon = 'weapon',   // 武器卡
    Question = 'question'// 题目卡
}

// 卡牌稀有度
export enum CardRarity {
    Common = 'common',      // 普通卡
    Rare = 'rare',          // 稀有卡
    Epic = 'epic',          // 史诗卡
    Legendary = 'legendary' // 传说卡
}

// 卡牌效果
export interface CardEffect {
    target: string;            // 目标挂载点: w_*(武器), c_*(角色), e_*(敌人), 或具体ID如 w_sword
    stat: string;              // 影响的属性(见PlayerStats、EnemyStats、WeaponStats)
    type: 'add' | 'multiply';  // 加法或乘法结算
    value: number;             // 固定值或百分比
}

// 卡牌基类
export interface Card {
    id: string;             // 卡牌ID
    rarity: CardRarity;     // 卡牌稀有度
    type: CardType;         // 卡牌类型
}

export interface BuffCard extends Card {
    type: CardType.Buff;    // 卡牌类型
    name: string;           // 增益卡名称
    description: string;    // 增益卡描述
    effects: CardEffect[];  // 增益效果及挂载点
}

export interface WeaponCard extends Card {
    type: CardType.Weapon;  // 卡牌类型
    name: string;           // 武器卡名称
    description: string;    // 武器卡描述
    stats: WeaponStats;     // 武器属性
    effects: CardEffect[];  // 增益效果及挂载点
}

export interface QuestionCard extends Card {
    type: CardType.Question; // 卡牌类型
    question: QuestionData;  // 题目数据
}

//游戏系统基类
export interface IGameSystem {
    initialize(): void;         // 初始化系统
    update(dt: number): void;   // 更新系统 (dt: 帧更新间隔（秒）)
}
