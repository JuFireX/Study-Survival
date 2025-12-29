import * as pc from 'playcanvas';
import { PlayerStats } from '../../../config/types';
import { GameContext } from '../../../core/GameContext';

/**
 * 角色基类 (BaseCharacter)
 * 
 * 职责:
 * 1. 定义角色的缺省属性 (生命值, 移动速度, 攻击力等)。
 * 2. 提供通用的角色状态管理 (如受伤, 死亡, 治疗)。
 * 3. 作为 Player 和 NPC 的父类，提供共享逻辑。
 * 4. 应当从 types 中的 PlayerStats 作为参考
 */
export abstract class BaseCharacter {
    public entity: pc.Entity;
    public stats: PlayerStats;

    protected level: number = 1;
    protected currentExp: number = 0;
    protected maxExp: number = 100; // 简单起见，固定或按公式增长
    protected isDead: boolean = false;

    constructor(entity: pc.Entity, stats: PlayerStats) {
        this.entity = entity;
        this.stats = { ...stats }; // 复制属性

        // 绑定逻辑类到实体，方便从 Entity 获取 Logic
        (this.entity as any).baseCharacter = this;

        // 确保实体有标识
        if (!this.entity.name) {
            this.entity.name = 'Player';
        }
    }

    public getLevel(): number {
        return this.level;
    }

    public getCurrentExp(): number {
        return this.currentExp;
    }

    public getMaxExp(): number {
        return this.maxExp;
    }

    /**
     * 帧更新
     */
    public update(_dt: number) {
        // 子类可以在此添加特定逻辑
    }

    /**
     * 移动角色
     * @param direction 移动方向 (标准化向量)
     * @param dt 时间增量
     */
    public move(direction: pc.Vec3, dt: number) {
        if (direction.lengthSq() > 0) {
            // 计算位移
            const speed = this.stats.moveSpeed;
            const moveVec = direction.clone().mulScalar(speed * dt);

            // 更新位置
            const currentPos = this.entity.getPosition();
            const newPos = currentPos.add(moveVec);
            this.entity.setPosition(newPos);

            // 旋转朝向移动方向
            // PlayCanvas Y-up system: atan2(x, z) gives angle in radians
            const angle = Math.atan2(direction.x, direction.z) * pc.math.RAD_TO_DEG;
            const targetRotation = new pc.Quat().setFromAxisAngle(pc.Vec3.UP, angle);

            const currentRotation = this.entity.getRotation();
            // 平滑旋转
            const newRotation = new pc.Quat().slerp(currentRotation, targetRotation, 10 * dt);
            this.entity.setRotation(newRotation);
        }
    }

    /**
     * 受伤
     */
    public takeDamage(amount: number) {
        // 计算减免后的伤害 (简单示例: 伤害 - 防御)
        const damage = Math.max(1, amount - this.stats.defense);
        this.stats.currentHealth = Math.max(0, this.stats.currentHealth - damage);

        // 广播事件
        GameContext.getInstance().getEventBus().fire('player:damage', damage, this.stats.currentHealth, this.stats.maxHealth);

        if (this.stats.currentHealth <= 0) {
            this.die();
        }
    }

    /**
     * 治疗
     */
    public heal(amount: number) {
        this.stats.currentHealth = Math.min(this.stats.maxHealth, this.stats.currentHealth + amount);

        // 广播事件
        GameContext.getInstance().getEventBus().fire('player:heal', amount, this.stats.currentHealth, this.stats.maxHealth);
    }

    /**
     * 获得经验
     */
    public addExp(amount: number) {
        const effectiveExp = amount * this.stats.expEfficiency;
        this.currentExp += effectiveExp;

        // 检查升级
        while (this.currentExp >= this.maxExp) {
            this.levelUp();
        }

        // 广播事件
        GameContext.getInstance().getEventBus().fire('player:exp', this.currentExp, this.maxExp, this.level);
    }

    protected levelUp() {
        this.level++;
        this.currentExp -= this.maxExp;
        this.maxExp = Math.floor(this.maxExp * 1.2); // 经验需求递增

        // 提升属性 (示例)
        this.stats.maxHealth += 10;
        this.stats.currentHealth = this.stats.maxHealth; // 升级回满血?
        this.stats.defense += 1;

        GameContext.getInstance().getEventBus().fire('player:levelup', this.level);
    }

    protected die() {
        if (this.isDead) return;
        this.isDead = true;

        const context = GameContext.getInstance();
        context.getEventBus().fire('player:dead');
        context.getApp().timeScale = 0;
    }
}
