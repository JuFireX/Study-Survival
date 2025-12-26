# 配置数据参考

本模块导出了游戏的核心数据结构和静态配置表。

## 核心类型 (Types)

定义在 `types.ts` 中。

### PlayerStats (玩家属性)
定义玩家的基础数值，也是 Buff 的作用目标。

| 属性 | 类型 | 说明 |
| :--- | :--- | :--- |
| `maxHealth` | number | 最大生命值 |
| `moveSpeed` | number | 移动速度 |
| `pickupRange` | number | 拾取范围 |
| `defense` | number | 物理防御 |
| `magicDefense` | number | 魔法防御 |
| `expEfficiency` | number | 经验获取效率 |
| `luck` | number | 幸运值 |

### Card (卡牌)
所有卡牌的基类。

*   **BuffCard**: 增益卡，包含 `effects` 列表。
*   **WeaponCard**: 武器卡，包含 `stats` (伤害、冷却等)。
*   **QuestionCard**: 题目卡，包含 `QuestionData`。

### CardEffect (卡牌效果)
定义 Buff 或升级带来的数值变化。

```typescript
interface CardEffect {
    target: string;            // 目标: 'c_^'(自身), 'w_*'(所有武器), 'w_sword'(特定武器)
    stat: string;              // 属性名: 'damage', 'maxHealth' 等
    type: 'add' | 'multiply';  // 加法或乘法
    value: number;             // 数值
}
```

## 静态配置 (Static Config)

### WorldLevelConfig (evolution.ts)
`GameConfig.levelTable` 定义了每一级的经验需求和属性成长。

```typescript
export const WorldLevelConfig: LevelConfig[] = [
    {
        level: 1,
        expRequired: 100,
        playerStats: { ... }, // 玩家基础属性
        enemyStats: { ... }   // 怪物基础属性
    },
    // ...
];
```

### Card Definitions (cards.ts)
预定义的卡牌数据。

*   `BuffCards`: 包含 "力量", "急速", "铁甲" 等。
*   `WeaponCards`: 包含 "手枪", "剑" 等。
*   `QuestionCards`: 根据 `questions.ts` 自动生成。
