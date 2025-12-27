import * as pc from 'playcanvas';

import { ScriptRegistry } from '../../../core/ScriptRegistry';

/**
 * 子弹行为脚本 (BulletBehavior)
 * 
 * 职责:
 * 1. 控制子弹的移动。
 * 2. 处理子弹的生命周期 (超出射程销毁)。
 * 3. 处理碰撞检测 (击中敌人)。
 */
export class BulletBehavior extends pc.Script {
    // 属性需要在 initialize 中赋值或通过 attributes 传递
    public speed: number = 20;
    public damage: number = 10;
    public range: number = 20;
    public direction: pc.Vec3 = new pc.Vec3(0, 0, 1);

    private distanceTraveled: number = 0;

    initialize() {
        // 如果使用了物理引擎，这里应该设置刚体碰撞回调
        // this.entity.collision?.on('triggerenter', this.onTriggerEnter, this);
    }

    update(dt: number) {
        if (!this.direction) return;

        // 移动逻辑
        const moveDistance = this.speed * dt;
        const moveVec = this.direction.clone().mulScalar(moveDistance);
        this.entity.translate(moveVec);

        // 射程检测
        this.distanceTraveled += moveDistance;
        if (this.distanceTraveled >= this.range) {
            this.entity.destroy();
        }
    }

    /**
     * 碰撞回调 (需要物理组件支持)
     */
    onTriggerEnter(other: pc.Entity) {
        if (other.tags.has('enemy')) {
            // 造成伤害逻辑 (假设 Enemy 有 takeDamage 方法)
            // (other.script as any).enemyBehavior?.takeDamage(this.damage);

            // 销毁子弹 (除非有穿透属性)
            this.entity.destroy();
        }
    }
}

ScriptRegistry.register(BulletBehavior, 'bulletBehavior');
