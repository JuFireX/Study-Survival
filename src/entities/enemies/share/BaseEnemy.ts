import * as pc from 'playcanvas';
import type { EnemyStats } from '../../../config/types';
import { GameContext } from '../../../core/GameContext';
import type { EventBus } from '../../../core/EventBus';

/**
 * 敌人基类 (BaseEnemy)
 * 
 * 职责:
 * 1. 定义敌人的基础属性 (生命值, 攻击力, 掉落经验值等)。
 * 2. 管理敌人的通用状态 (如追踪玩家, 攻击, 受击, 死亡)。
 * 3. 提供敌人特有的行为接口，供 AI 系统调用。
 */
export class BaseEnemy {
    public readonly id: string;
    protected entity!: pc.Entity;
    protected stats!: EnemyStats;

    private app: pc.Application;
    private eventBus: EventBus;
    private alive: boolean = true;
    private attackCooldownLeft: number = 0;

    constructor() {
        const context = GameContext.getInstance();
        this.app = context.getApp();
        this.eventBus = context.getEventBus();
        this.id = pc.guid.create();
    }

    public initialize() {
        if (!this.stats) {
            this.stats = {
                currentHealth: 20,
                maxHealth: 20,
                damage: 5,
                defense: 0,
                moveSpeed: 2,
                expValue: 10
            };
        }

        this.entity = new pc.Entity(`Enemy_${this.id}`);
        this.entity.addComponent('model', { type: 'box' });
        this.entity.setLocalScale(1, 1, 1);
        this.entity.setPosition(0, 1, 0);
        (this.entity as any).__enemy = this;
    }

    public getEntity(): pc.Entity {
        return this.entity;
    }

    public getStats(): Readonly<EnemyStats> {
        return this.stats;
    }

    public setPosition(pos: pc.Vec3) {
        this.entity.setPosition(pos);
    }

    public getPosition(out?: pc.Vec3): pc.Vec3 {
        const p = this.entity.getPosition();
        if (out) {
            out.copy(p);
            return out;
        }
        return p.clone();
    }

    public isDead(): boolean {
        return !this.alive;
    }

    public update(dt: number, playerWorldPos: pc.Vec3) {
        if (!this.alive) return;

        const pos = this.entity.getPosition();
        const toPlayer = playerWorldPos.clone().sub(pos);
        toPlayer.y = 0;
        const dist = toPlayer.length();

        if (dist > 0.001) {
            toPlayer.normalize();
            const step = Math.min(dist, this.stats.moveSpeed * dt);
            this.entity.setPosition(pos.x + toPlayer.x * step, pos.y, pos.z + toPlayer.z * step);
        }

        this.attackCooldownLeft = Math.max(0, this.attackCooldownLeft - dt);
        if (dist <= 1.25 && this.attackCooldownLeft <= 0) {
            this.attackCooldownLeft = 0.6;
            const hitPos = this.entity.getPosition().clone();
            this.eventBus.fire('combat:hitPlayer', this.stats.damage, hitPos);
        }
    }

    public takeDamage(rawDamage: number, color: string = 'white'): number {
        if (!this.alive) return 0;

        const damage = Math.max(1, Math.floor(rawDamage) - this.stats.defense);
        this.stats.currentHealth = Math.max(0, this.stats.currentHealth - damage);
        this.eventBus.fire('combat:damage', damage, this.entity.getPosition().clone(), color);

        if (this.stats.currentHealth <= 0) {
            this.alive = false;
        }

        return damage;
    }

    public destroy() {
        this.alive = false;
        const parent = this.entity.parent;
        if (parent) {
            parent.removeChild(this.entity);
        }
        this.entity.destroy();
        void this.app;
    }
}
