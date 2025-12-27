import * as pc from 'playcanvas';
import { ScriptRegistry } from '../../../core/ScriptRegistry';

/**
 * 手枪子弹脚本 (PistolBullet)
 * 
 * 职责:
 * 1. 控制子弹的直线飞行。
 * 2. 处理射程销毁。
 * 3. 简单的碰撞处理 (预留)。
 */
export class PistolBullet extends pc.Script {
    // 基础属性
    public speed: number = 20;
    public damage: number = 10;
    public range: number = 20;
    
    // 运行时状态
    private direction: pc.Vec3 = new pc.Vec3();
    private distanceTraveled: number = 0;

    /**
     * 初始化子弹参数
     * @param speed 飞行速度
     * @param damage 伤害值
     * @param range 最大射程
     * @param direction 飞行方向 (会被归一化)
     */
    public setup(speed: number, damage: number, range: number, direction: pc.Vec3) {
        this.speed = speed;
        this.damage = damage;
        this.range = range;
        this.direction.copy(direction).normalize();
    }

    update(dt: number) {
        // 如果没有设置方向，不移动
        if (this.direction.lengthSq() === 0) return;

        // 1. 计算移动量
        const moveDistance = this.speed * dt;
        const moveVec = this.direction.clone().mulScalar(moveDistance);
        
        // 2. 移动实体
        this.entity.translate(moveVec);

        // 3. 射程检测
        this.distanceTraveled += moveDistance;
        if (this.distanceTraveled >= this.range) {
            this.destroyBullet();
        }
    }

    /**
     * 销毁子弹
     */
    private destroyBullet() {
        this.entity.destroy();
    }

    /**
     * 碰撞回调 (需要物理组件支持)
     * 目前仅作为预留接口
     */
    onTriggerEnter(other: pc.Entity) {
        if (other.tags.has('enemy')) {
            // TODO: 调用敌人的受击方法
            // (other.script as any).enemyBehavior?.takeDamage(this.damage);
            
            this.destroyBullet();
        }
    }
}

// 注册脚本
ScriptRegistry.register(PistolBullet, 'pistolBullet');
