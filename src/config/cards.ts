import { Card, CardType, CardRarity } from '../data/types';

export const Cards: Card[] = [
    // Buffs
    {
        id: 'buff_might',
        name: 'Might',
        description: 'Increases damage by 10%',
        type: CardType.Buff,
        rarity: CardRarity.Common,
        effects: [{ stat: 'damageMultiplier', value: 0.1, type: 'add' }]
    },
    {
        id: 'buff_haste',
        name: 'Haste',
        description: 'Increases attack speed by 10%',
        type: CardType.Buff,
        rarity: CardRarity.Common,
        effects: [{ stat: 'attackSpeed', value: 0.1, type: 'add' }]
    },
    {
        id: 'buff_armor',
        name: 'Iron Plating',
        description: 'Increases armor by 1',
        type: CardType.Buff,
        rarity: CardRarity.Rare,
        effects: [{ stat: 'armor', value: 1, type: 'add' }]
    },
    {
        id: 'buff_regen',
        name: 'Regeneration',
        description: 'Heal 1 HP per second',
        type: CardType.Buff,
        rarity: CardRarity.Rare,
        effects: [{ stat: 'healthRegen', value: 1, type: 'add' }]
    },
    {
        id: 'buff_ultimate_power',
        name: 'Ultimate Power',
        description: 'Massive damage boost but less health',
        type: CardType.Buff,
        rarity: CardRarity.Epic,
        effects: [
            { stat: 'damageMultiplier', value: 0.5, type: 'add' },
            { stat: 'maxHealth', value: -20, type: 'add' }
        ]
    },

    // Weapons
    {
        id: 'weapon_whip',
        name: 'Whip',
        description: 'Attacks horizontally',
        type: CardType.Weapon,
        rarity: CardRarity.Common,
        effects: [],
        weaponId: 'whip'
    }
];
