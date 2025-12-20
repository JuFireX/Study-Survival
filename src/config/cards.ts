import { Card, CardType, CardRarity } from '../data/types';

export const Cards: Card[] = [
    // 增益卡
    {
        id: 'buff_might',
        name: '力量',
        description: '增加 10% 伤害',
        type: CardType.Buff,
        rarity: CardRarity.Common,
        effects: [{ stat: 'damageMultiplier', value: 0.1, type: 'add' }]
    },
    {
        id: 'buff_haste',
        name: '急速',
        description: '增加 10% 攻击速度',
        type: CardType.Buff,
        rarity: CardRarity.Common,
        effects: [{ stat: 'attackSpeed', value: 0.1, type: 'add' }]
    },
    {
        id: 'buff_armor',
        name: '铁甲',
        description: '增加 1 点护甲',
        type: CardType.Buff,
        rarity: CardRarity.Rare,
        effects: [{ stat: 'armor', value: 1, type: 'add' }]
    },
    {
        id: 'buff_regen',
        name: '再生',
        description: '每秒恢复 1 点生命值',
        type: CardType.Buff,
        rarity: CardRarity.Rare,
        effects: [{ stat: 'healthRegen', value: 1, type: 'add' }]
    },
    {
        id: 'buff_ultimate_power',
        name: '终极力量',
        description: '大幅提升伤害但减少生命值',
        type: CardType.Buff,
        rarity: CardRarity.Epic,
        effects: [
            { stat: 'damageMultiplier', value: 0.5, type: 'add' },
            { stat: 'maxHealth', value: -20, type: 'add' }
        ]
    },

    // 武器卡
    {
        id: 'weapon_sword',
        name: '剑',
        description: '普通攻击',
        type: CardType.Weapon,
        rarity: CardRarity.Common,
        effects: [],
        weaponId: 'sword'
    },
    {
        id: 'weapon_whip',
        name: '鞭子',
        description: '水平攻击',
        type: CardType.Weapon,
        rarity: CardRarity.Common,
        effects: [],
        weaponId: 'whip'
    }
];
