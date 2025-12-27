import * as pc from 'playcanvas';
import { WeaponStats, CardEffect } from '../../../config/types';

/**
 * 武器基类 (BaseWeapon)
 * 
 * 职责:
 * 1. 管理武器的基础属性和状态 (冷却, 等级)。
 * 2. 提供统一的攻击接口和更新循环。
 * 3. 处理属性的动态修改 (升级, 卡牌效果)。
 */
export abstract class BaseWeapon {
    public id: string;
    public owner: pc.Entity;
    public stats: WeaponStats;

    protected currentCooldown: number = 0;
    protected level: number = 1;
    protected isActive: boolean = true;

    constructor(id: string, owner: pc.Entity, stats: WeaponStats) {
        this.id = id;
        this.owner = owner;
        // 深拷贝属性，防止修改影响配置原件
        this.stats = JSON.parse(JSON.stringify(stats));
    }

    /**
     * 帧更新，由 WeaponSystem 统一调用
     */
    public update(dt: number) {
        if (!this.isActive) return;

        if (this.currentCooldown > 0) {
            this.currentCooldown -= dt;
        }

        // Survivor-like 游戏通常是自动攻击，这里检测冷却完毕即尝试攻击
        if (this.currentCooldown <= 0) {
            this.tryAttack();
        }
    }

    /**
     * 尝试执行攻击逻辑
     */
    protected tryAttack() {
        if (this.canAttack()) {
            this.attack();
            this.currentCooldown = this.stats.cooldown;
        }
    }

    /**
     * 子类实现具体的攻击行为 (发射子弹, 生成攻击框等)
     */
    protected abstract attack(): void;

    /**
     * 是否满足攻击条件 (可被子类重写，例如检测范围内是否有敌人)
     */
    protected canAttack(): boolean {
        return true;
    }

    /**
     * 应用卡牌/升级效果
     */
    public applyEffect(effect: CardEffect) {
        // 简单的属性修改逻辑示例
        if (effect.target === this.id || effect.target.startsWith('w_')) {
            const key = effect.stat as keyof WeaponStats;
            if (this.stats[key] !== undefined) {
                if (effect.type === 'add') {
                    this.stats[key] += effect.value;
                } else if (effect.type === 'multiply') {
                    this.stats[key] *= (1 + effect.value);
                }
            }
        }
    }

    public setLevel(level: number) {
        this.level = level;
    }
}
