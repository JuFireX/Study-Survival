import * as pc from 'playcanvas';
import { IGameSystem } from './IGameSystem';
import { GameContext } from '../core/GameContext';
import { EventBus } from '../core/EventBus';

console.log(GameContext.getInstance()); // 使用 GameContext 以规避警告
/**
 * 战斗系统
 * 处理伤害计算、生命值管理和死亡逻辑。
 */
export class CombatSystem implements IGameSystem {
    private eventBus: EventBus;

    constructor() {
        this.eventBus = EventBus.getInstance();
    }

    initialize() {
        this.eventBus.on('combat:hit', this.onHit, this);
        console.log("CombatSystem initialized");
    }

    update(dt: number) {
        // 可以在这里处理持续性伤害 (DoT) 等
        dt = dt; // 使用dt变量以规避警告
    }

    /**
     * 处理命中事件
     * @param target 受击目标
     * @param damage 伤害值
     * @param pos 命中位置
     */
    private onHit(target: pc.Entity, damage: number, pos: pc.Vec3) {
        // 这里可以获取 target 的 stats 组件进行 HP 扣减
        // 目前简单处理：直接判定为受到伤害

        // 广播伤害发生事件（供 UI 显示）
        this.eventBus.fire('combat:damage', damage, pos, 'yellow');

        // 简单死亡逻辑
        // 实际项目中应该检查 HP <= 0
        if (target && target.destroy) {
            target.destroy();
            this.eventBus.fire('combat:kill', target);
        }
    }
}
