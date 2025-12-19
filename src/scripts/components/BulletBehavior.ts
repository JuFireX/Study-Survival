import * as pc from 'playcanvas';
import { EventBus } from '../../core/EventBus';

/**
 * 子弹行为脚本
 * 控制子弹移动和碰撞检测。
 */
export class BulletBehavior extends pc.ScriptType {
    target: pc.Entity | null = null;
    speed: number = 20;
    damage: number = 10;
    
    // 缓存 EventBus 实例
    private eventBus: EventBus | null = null;

    initialize() {
        this.eventBus = EventBus.getInstance();
    }

    update(dt: number) {
        if (!this.target || !this.target.parent) { // 目标死亡或移除
            this.entity.destroy();
            return;
        }

        const pos = this.entity.getPosition();
        const targetPos = this.target.getPosition();

        const dir = new pc.Vec3().sub2(targetPos, pos);
        const dist = dir.length();

        if (dist < 0.5) {
            // 命中逻辑：触发事件
            if (this.eventBus) {
                this.eventBus.fire('combat:hit', this.target, this.damage, targetPos.clone());
            }

            // 子弹销毁
            this.entity.destroy();
            return;
        }

        // 移动逻辑
        dir.normalize().mulScalar(this.speed * dt);
        this.entity.translate(dir);
    }
}
