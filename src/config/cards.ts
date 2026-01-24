/**
 * 卡牌配置 (Cards Config)
 *
 * 职责:
 * 1. 汇总并导出所有游戏卡牌数据 (题目卡, 武器卡, 增益卡)。
 * 2. 处理卡牌数据的初始化和转换。
 */
import {
  CardType,
  CardRarity,
  QuestionCard,
  BuffCard,
  WeaponCard,
} from "./types";
import { questions } from "./questions";

// 根据难度获取稀有度
const getQuestionRarity = (difficulty: number): CardRarity => {
  if (difficulty >= 4) return CardRarity.Legendary;
  if (difficulty === 3) return CardRarity.Epic;
  if (difficulty === 2) return CardRarity.Rare;
  return CardRarity.Common;
};

// 问题卡
export const QuestionCards: QuestionCard[] = questions.map((q) => ({
  id: `q_${q.id}`,
  rarity: getQuestionRarity(q.difficulty),
  type: CardType.Question,
  question: q,
}));

// 增益卡(c_^指当前玩家)(还挺可爱的)
export const BuffCards: BuffCard[] = [
  {
    id: "b_might",
    name: "力量",
    description: "增加 10% 伤害",
    type: CardType.Buff,
    rarity: CardRarity.Common,
    effects: [{ target: "w_*", stat: "damage", value: 0.1, type: "multiply" }],
  },
  {
    id: "b_haste",
    name: "急速",
    description: "增加 10% 攻击速度",
    type: CardType.Buff,
    rarity: CardRarity.Common,
    effects: [
      { target: "w_*", stat: "cooldown", value: -0.1, type: "multiply" },
    ],
  },
  {
    id: "b_armor",
    name: "铁甲",
    description: "增加 5 点物理防御",
    type: CardType.Buff,
    rarity: CardRarity.Rare,
    effects: [{ target: "c_^", stat: "defense", value: 5, type: "add" }],
  },
  {
    id: "b_magnet",
    name: "磁石",
    description: "增加 50% 拾取范围",
    type: CardType.Buff,
    rarity: CardRarity.Rare,
    effects: [
      { target: "c_^", stat: "pickupRange", value: 0.5, type: "multiply" },
    ],
  },
  {
    id: "b_ultimate_power",
    name: "终极力量",
    description: "大幅提升伤害但减少生命值",
    type: CardType.Buff,
    rarity: CardRarity.Epic,
    effects: [
      { target: "w_*", stat: "damage", value: 0.5, type: "multiply" },
      { target: "c_^", stat: "maxHealth", value: -20, type: "add" },
    ],
  },
];

// 武器卡
export const WeaponCards: WeaponCard[] = [
  {
    id: "w_pistol",
    name: "手枪",
    description: "基础远程武器",
    type: CardType.Weapon,
    rarity: CardRarity.Common,
    stats: {
      damage: 10,
      cooldown: 1.0,
      range: 3,
      projectileSpeed: 10,
      projectileCount: 1,
      pierceCount: 1,
      areaSize: 1,
    },
    effects: [],
  },
  {
    id: "w_sword",
    name: "剑",
    description: "普通攻击",
    type: CardType.Weapon,
    rarity: CardRarity.Common,
    stats: {
      damage: 10,
      cooldown: 1.0,
      range: 3,
      projectileSpeed: 10,
      projectileCount: 1,
      pierceCount: 1,
      areaSize: 1,
    },
    effects: [],
  },
  {
    id: "w_whip",
    name: "鞭子",
    description: "水平攻击",
    type: CardType.Weapon,
    rarity: CardRarity.Common,
    stats: {
      damage: 15,
      cooldown: 1.5,
      range: 5,
      projectileSpeed: 15,
      projectileCount: 1,
      pierceCount: 5,
      areaSize: 2,
    },
    effects: [],
  },
];
