import * as pc from 'playcanvas';

/**
 * 武器基类 (BaseWeapon)
 * 
 * 职责:
 * 1. 定义武器的基础属性 (伤害, 射速, 范围, 冷却时间)。
 * 2. 管理武器的发射逻辑和冷却状态。
 * 3. 定义子弹/攻击特效的生成规则。
 */
export class BaseWeapon {
    protected damage: number = 10;
    protected cooldown: number = 1;

    constructor() {
        // Initialization
    }
}
