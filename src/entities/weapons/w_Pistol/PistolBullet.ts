import * as pc from 'playcanvas';

/**
 * 手枪子弹类 (PistolBullet) - 非 Script 版本
 * 
 * 职责:
 * 1. 控制子弹的直线飞行。
 * 2. 处理射程销毁。
 * 3. 简单的碰撞处理。
 * 
 * 由 Pistol 武器实例直接管理，不依赖 PlayCanvas 脚本系统。
 */
export class PistolBullet {
    public entity: pc.Entity;

    // 基础属性
    public speed: number = 20;
    public damage: number = 10;
    public range: number = 20;

    // 运行时状态
    private direction: pc.Vec3 = new pc.Vec3();
    private distanceTraveled: number = 0;
    public isDead: boolean = false;

    constructor(entity: pc.Entity, speed: number, damage: number, range: number, direction: pc.Vec3) {
        this.entity = entity;
        this.speed = speed;
        this.damage = damage;
        this.range = range;
        this.direction.copy(direction).normalize();

        console.log('[手枪子弹] 创建实体:', { speed, damage, range, direction });
    }

    /**
     * 帧更新，由 Pistol 调用
     */
    public update(dt: number) {
        if (this.isDead) return;

        // 如果没有设置方向，不移动
        if (this.direction.lengthSq() === 0) return;

        // 1. 计算移动量
        const moveDistance = this.speed * dt;
        const moveVec = this.direction.clone().mulScalar(moveDistance);

        // 2. 移动实体
        this.entity.translate(moveVec);

        // 3. 简单的碰撞检测 (距离检测)
        this.checkCollision();

        // 4. 射程检测
        this.distanceTraveled += moveDistance;
        if (this.distanceTraveled >= this.range) {
            this.destroy();
        }
    }

    private checkCollision() {
        if (!this.entity.parent) return; // 安全检查

        // TODO: 优化 - 避免每帧都 findByTag，应该由 GameContext 或 EnemySystem 提供
        const app = pc.Application.getApplication();
        if (!app) return;

        const enemies = app.root.findByTag('enemy') as pc.Entity[];
        const myPos = this.entity.getPosition();
        const radiusSq = 2.0 * 2.0; // 增大碰撞半径平方

        for (const enemyEntity of enemies) {
            // 简单的距离检测
            const distSq = new pc.Vec3().sub2(enemyEntity.getPosition(), myPos).lengthSq();
            if (distSq < radiusSq) {
                // 使用实体事件通知伤害
                enemyEntity.fire('damage', this.damage);
                this.destroy();
                return; // 一次只打一个
            }
        }
    }

    /**
     * 销毁子弹
     */
    public destroy() {
        if (this.isDead) return;

        this.isDead = true;
        if (this.entity) {
            this.entity.destroy();
        }
    }
}
