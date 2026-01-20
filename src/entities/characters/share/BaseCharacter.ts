import * as pc from 'playcanvas';
import { PlayerStats } from '../../../config/types';
import { GameContext } from '../../../core/GameContext';
import { EventBus } from '../../../core/EventBus';
import { WorldLevelConfig } from '../../../config/evolution';
import { DropSystem } from '../../../systems/drop/DropSystem';

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
    protected context: GameContext;
    protected eventBus: EventBus;
    public entity: pc.Entity;
    protected isDead: boolean = false;
    public stats: PlayerStats;          // 角色基础属性
    protected level: number = 1;        // 角色等级
    protected currentExp: number = 0;   // 当前经验值
    protected maxExp: number = 100;     // 最大经验值

    // 临时向量用于计算
    private tmpVec: pc.Vec3 = new pc.Vec3();

    constructor(entity: pc.Entity, stats: PlayerStats) {
        this.entity = entity;
        this.context = GameContext.getInstance();
        this.eventBus = this.context.getEventBus();

        // 初始化等级 1 的配置（如果存在），确保初始状态一致
        const initialConfig = WorldLevelConfig.find(c => c.level === 1);
        if (initialConfig && initialConfig.playerStats) {
            // 优先使用 Config 中的基础值，stats 参数作为覆盖或补充
            this.stats = { ...initialConfig.playerStats as PlayerStats, ...stats };
            this.maxExp = initialConfig.expRequired;
        } else {
            this.stats = { ...stats };
        }

        // 监听实体事件
        this.entity.on('damage', (amount: number) => this.takeDamage(amount));
        this.entity.on('heal', (amount: number) => this.heal(amount));
        this.entity.on('exp', (amount: number) => this.addExp(amount));

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
        this.checkPickup();
    }

    /**
     * 检查并拾取范围内的掉落物
     */
    private checkPickup() {
        if (this.isDead) return;

        // 获取掉落系统实例
        const dropSystem = DropSystem.getInstance();
        if (!dropSystem) return;

        const drops = dropSystem.getDrops();
        if (drops.length === 0) return;

        const myPos = this.entity.getPosition();
        // 拾取范围平方
        const rangeSq = this.stats.pickupRange * this.stats.pickupRange;

        for (const drop of drops) {
            // 跳过已拾取的物品
            if (drop.isPickedUp()) continue;

            const dropPos = drop.getPosition();

            // 计算距离
            this.tmpVec.sub2(myPos, dropPos);

            if (this.tmpVec.lengthSq() < rangeSq) {
                // 触发拾取
                drop.entity.fire('pickup');
            }
        }
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
        this.eventBus.fire('player:damage', damage, this.stats.currentHealth, this.stats.maxHealth);

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
        this.eventBus.fire('player:heal', amount, this.stats.currentHealth, this.stats.maxHealth);
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
        this.eventBus.fire('player:exp', this.currentExp, this.maxExp, this.level);
    }

    protected levelUp() {
        this.level++;
        this.currentExp -= this.maxExp;

        // 从配置获取下一级数据
        const nextLevelConfig = WorldLevelConfig.find(c => c.level === this.level);

        if (nextLevelConfig) {
            this.maxExp = nextLevelConfig.expRequired;

            // 应用属性成长
            if (nextLevelConfig.playerStats) {
                // 覆盖基础属性 (注意：这里直接覆盖可能会丢失之前的临时 buff，但 BaseCharacter 主要管理基础属性)
                // 更好的做法可能是：计算增量，或者假定 playerStats 就是当前等级的"裸"属性
                // 鉴于这是一个简化系统，我们直接更新 stats
                Object.assign(this.stats, nextLevelConfig.playerStats);

                // 确保当前生命值不超过新的最大生命值 (或者你可以选择在这里回满血)
                this.stats.currentHealth = Math.min(this.stats.currentHealth, this.stats.maxHealth);
            }
        } else {
            // 超出配置等级时的 Fallback
            this.maxExp = Math.floor(this.maxExp * 1.2);
            // 简单的属性提升
            this.stats.maxHealth += 10;
            this.stats.defense += 1;
        }

        this.eventBus.fire('player:levelup', this.level);
    }

    protected die() {
        if (this.isDead) return;
        this.isDead = true;

        // 广播死亡事件
        this.eventBus.fire('player:dead');
        this.context.getApp().timeScale = 0;
    }

    /**
     * 销毁角色
     */
    public destroy() {
        // 子类清理逻辑
    }
}
