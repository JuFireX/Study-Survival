import * as pc from 'playcanvas';

/**
 * 敌人基类 (BaseEnemy)
 * 
 * 职责:
 * 1. 定义敌人的基础属性 (生命值, 攻击力, 掉落经验值等)。
 * 2. 管理敌人的通用状态 (如追踪玩家, 攻击, 受击, 死亡)。
 * 3. 提供敌人特有的行为接口，供 AI 系统调用。
 */
export class BaseEnemy {
    protected hp: number = 50;
    protected attackPower: number = 10;

    constructor() {
        // Initialization
    }
}
