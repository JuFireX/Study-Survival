import * as pc from 'playcanvas';
import { GameContext } from '../../../core/GameContext';

import type { EnemyHealthBar } from '../../../ui/EnemyHealthBar';

export interface EnemyStats {
    maxHealth: number;
    health: number;
    speed: number;
    damage: number;
    expDrop: number;
}

/**
 * 敌人基类 (BaseEnemy)
 * 
 * 职责:
 * 1. 定义敌人的基础属性 (生命值, 攻击力, 掉落经验值等)。
 * 2. 管理敌人的通用状态 (如追踪玩家, 攻击, 受击, 死亡)。
 * 3. 提供敌人特有的行为接口，供 AI 系统调用。
 */
export abstract class BaseEnemy {
    public entity: pc.Entity;
    public stats: EnemyStats;
    protected context: GameContext;
    protected isDead: boolean = false;

    // UI 组件
    protected healthBar: EnemyHealthBar;

    constructor(stats: EnemyStats) {
        this.context = GameContext.getInstance();
        this.stats = { ...stats }; // Copy stats
        this.entity = new pc.Entity();

        // 默认模型（子类可以覆盖）
        this.setupModel();

        // 添加到场景
        this.context.getApp().root.addChild(this.entity);

        // 标记为敌人
        this.entity.tags.add('enemy');
        // 绑定实例到实体，方便碰撞检测时获取
        (this.entity as any).baseEnemy = this;

        // 初始化血条
        const uiManager = this.context.getUIManager();
        if (uiManager && uiManager.getEnemyHealthBarManager()) {
            this.healthBar = uiManager.getEnemyHealthBarManager()!.create(this.entity, 2.5);
        } else {
            console.error("UIManager not found when creating enemy!");
            throw new Error("UIManager not initialized");
        }
    }

    protected setupModel() {
        // 默认创建一个红色方块作为敌人
        this.entity.addComponent('model', {
            type: 'box'
        });
        const material = new pc.StandardMaterial();
        material.diffuse = new pc.Color(1, 0, 0); // 红色
        material.update();
        this.entity.model!.material = material;
    }

    public setPosition(x: number, y: number, z: number) {
        this.entity.setPosition(x, y, z);
    }

    public getPosition(): pc.Vec3 {
        return this.entity.getPosition();
    }

    /**
     * 是否存活
     */
    public isAlive(): boolean {
        return !this.isDead;
    }

    /**
     * 每帧更新
     */
    public update(dt: number) {
        if (this.isDead) return;

        const player = this.context.getPlayer();
        if (player) {
            this.chasePlayer(player, dt);
        }
    }

    /**
     * 简单的追踪逻辑
     */
    protected chasePlayer(player: pc.Entity, dt: number) {
        const playerPos = player.getPosition();
        const enemyPos = this.entity.getPosition();

        const dist = playerPos.distance(enemyPos);

        // 攻击范围检测 (假设所有敌人近战攻击距离为 1.5)
        if (dist < 1.5) {
            this.attackPlayer(dt);
            return; // 攻击时不移动
        }

        const direction = new pc.Vec3().sub2(playerPos, enemyPos);
        direction.y = 0; // 忽略高度差

        if (direction.lengthSq() > 0.1) {
            direction.normalize();

            // 移动
            const moveStep = direction.mulScalar(this.stats.speed * dt);
            this.entity.translate(moveStep);

            // 朝向玩家
            this.entity.lookAt(playerPos.x, enemyPos.y, playerPos.z);
        }
    }

    private attackCooldown: number = 0;
    private attackInterval: number = 1.0; // 1秒攻击一次

    protected attackPlayer(dt: number) {
        this.attackCooldown -= dt;
        if (this.attackCooldown <= 0) {
            this.attackCooldown = this.attackInterval;

            // 触发攻击事件
            console.log('Enemy attacking player!');
            // 这里可以播放攻击动画

            // 直接造成伤害 (或通过事件)
            // 方案：发送 'player:hit' 事件，携带伤害值
            this.context.getEventBus().fire('player:hit', this.stats.damage);
        }
    }

    /**
     * 受到伤害
     */
    public takeDamage(amount: number) {
        if (this.isDead) return;

        this.stats.health -= amount;

        // 更新血条
        this.healthBar.updateHealth(this.stats.health / this.stats.maxHealth);

        // UI 跳字 (通过 EventBus)
        // 确保 FloatingText 监听的是 'combat:damage'
        this.context.getEventBus().fire('combat:damage', amount, this.entity.getPosition());

        if (this.stats.health <= 0) {
            this.die();
        }
    }

    /**
     * 死亡处理
     */
    protected die() {
        if (this.isDead) return;
        this.isDead = true;

        console.log('Enemy died!');

        // 销毁血条
        // 通知 Manager 移除自己，或者直接 destroy (Manager 会在 update 中检测到无效引用)
        // 但这里我们显式调用 destroy，EnemyHealthBar 会标记自己为无效
        this.healthBar.destroy();

        // 广播死亡事件 (用于掉落经验、任务进度等)
        this.context.getEventBus().fire('enemy:die', this, this.stats.expDrop);

        // 销毁实体
        this.entity.destroy();
    }
}
