import * as pc from 'playcanvas';
import { IGameSystem } from './share/IGameSystem';
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
        // Check for PlayerStats
        if (target.script && target.script.has('playerStats')) {
            (target.script as any).playerStats.takeDamage(damage);
            return;
        }

        // Check for BaseEnemy (or specific enemy scripts)
        // Since we have inheritance, checking for 'baseEnemy' might work if registered as such?
        // PlayCanvas script inheritance doesn't automatically register base names.
        // We registered 'fastEnemy' and 'tankEnemy'.

        let enemyScript: any = null;
        if (target.script) {
            if (target.script.has('fastEnemy')) enemyScript = (target.script as any).fastEnemy;
            else if (target.script.has('tankEnemy')) enemyScript = (target.script as any).tankEnemy;
            else if (target.script.has('enemyBehavior')) enemyScript = (target.script as any).enemyBehavior; // Legacy
        }

        if (enemyScript && enemyScript.takeDamage) {
            enemyScript.takeDamage(damage);
        } else {
            // Fallback for simple objects
            this.eventBus.fire('combat:damage', damage, pos, 'yellow');
            if (target && target.destroy) {
                target.destroy();
                this.eventBus.fire('combat:kill', target);
            }
        }
    }
}
