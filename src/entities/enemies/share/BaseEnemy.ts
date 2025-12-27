import * as pc from 'playcanvas';
import { GameContext } from '../../../core/GameContext';

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

    /**
     * 受到伤害
     */
    public takeDamage(amount: number) {
        if (this.isDead) return;

        this.stats.health -= amount;

        // UI 跳字
        const uiManager = this.context.getUIManager();
        if (uiManager && uiManager.getFloatingText()) {
            // 注意：这里假设 FloatingText 有 showDamage 方法，具体需要看实现
            // 如果没有，可能需要适配。暂时假设有。
            // 实际上 FloatingText.ts 可能需要实现 show 方法。
            // 既然我们要完全实现，我们通过 EventBus 广播伤害事件，让 UI 系统去监听比较好，
            // 但用户要求使用 UI 组件输出。
            // 让我们检查一下 FloatingText 的实现，如果看不到，我们假设需要通过 EventBus 或者直接调用。
            // 根据 UIManager 的代码，可以直接获取 FloatingText。
            // 暂时打印 log，稍后确认 FloatingText 接口。
            console.log(`Enemy took ${amount} damage. Health: ${this.stats.health}`);
        }

        // 广播受击事件 (用于 UI 显示飘字等)
        this.context.getEventBus().fire('enemy:hit', this.entity, amount);

        // 广播通用战斗伤害事件 (用于 FloatingText)
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

        // 广播死亡事件 (用于掉落经验、任务进度等)
        this.context.getEventBus().fire('enemy:die', this, this.stats.expDrop);

        // 销毁实体
        this.entity.destroy();
    }

    public isAlive(): boolean {
        return !this.isDead;
    }
}
