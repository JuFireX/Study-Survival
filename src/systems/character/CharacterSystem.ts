import * as pc from 'playcanvas';
import type { CardEffect, IGameSystem, PlayerStats } from '../../config/types';
import { WorldLevelConfig } from '../../config/evolution';
import { GameContext } from '../../core/GameContext';
import type { EventBus } from '../../core/EventBus';
import type { UIManager } from '../../core/manager/UIManager';

/**
 * 角色系统 (CharacterSystem)
 * 
 * 职责:
 * 1. 管理实体及其状态: 玩家角色 (健康、能量、状态效果)
 *  - 因为玩家后期可以选择不同的英雄进入游戏. 现在暂时可以固定死
 * 2. 可供调配的UI: 玩家状态UI (如血条、经验等), 玩家操作UI (如虚拟摇杆等)
 * 
 */

type StatusEffect = {
    id: string;
    kind: string;
    duration: number;
    maxDuration: number;
    stacks: number;
};

export class CharacterSystem implements IGameSystem {
    private app: pc.Application;
    private eventBus: EventBus;
    private ui: UIManager;

    private player: pc.Entity | null = null;

    private stats: PlayerStats;
    private level: number = 1;
    private currentExp: number = 0;
    private expToNextLevel: number = 100;

    private energy = {
        current: 100,
        max: 100,
        regenPerSec: 12
    };

    private statusEffects: StatusEffect[] = [];

    private lastHudHealth: { current: number; max: number } | null = null;
    private lastHudExp: { current: number; max: number; level: number } | null = null;
    private lastBuffCount: number = -1;

    constructor(ui: UIManager) {
        const context = GameContext.getInstance();
        this.app = context.getApp();
        this.eventBus = context.getEventBus();
        this.ui = ui;

        this.stats = this.createDefaultPlayerStats();
        this.syncExpRequirementFromLevel();
    }

    public initialize(): void {
        this.player = GameContext.getInstance().getPlayer();

        this.bindJoystickToPlayerController();

        this.eventBus.on('player:gainExp', this.onGainExp, this);
        this.eventBus.on('player:heal', this.onHeal, this);
        this.eventBus.on('player:consumeEnergy', this.onConsumeEnergy, this);
        this.eventBus.on('combat:hitPlayer', this.onHitPlayer, this);
        this.eventBus.on('enemy:died', this.onEnemyDied, this);
        this.eventBus.on('card:applyEffect', this.onApplyEffect, this);
        this.eventBus.on('status:add', this.onAddStatusEffect, this);
        this.eventBus.on('status:remove', this.onRemoveStatusEffect, this);
        this.eventBus.on('status:clear', this.onClearStatusEffects, this);

        this.updateHUD(true);
    }

    public update(dt: number): void {
        if (!this.player) {
            this.player = GameContext.getInstance().getPlayer();
            if (!this.player) return;
        }

        if (dt > 0) {
            const next = Math.min(this.energy.max, this.energy.current + this.energy.regenPerSec * dt);
            if (next !== this.energy.current) {
                this.energy.current = next;
            }

            if (this.statusEffects.length > 0) {
                for (let i = this.statusEffects.length - 1; i >= 0; i--) {
                    const eff = this.statusEffects[i];
                    eff.duration = Math.max(0, eff.duration - dt);
                    if (eff.duration <= 0) {
                        this.statusEffects.splice(i, 1);
                    }
                }
            }
        }

        this.updateHUD(false);
    }

    private bindJoystickToPlayerController() {
        const player = this.player ?? GameContext.getInstance().getPlayer();
        if (!player?.script) return;

        const joystick = this.ui.getJoystick();
        if (!joystick) return;

        const controller = player.script.get('playerController') as any;
        if (!controller) return;

        if (typeof controller.setup === 'function') {
            controller.setup(joystick);
            return;
        }

        if (typeof controller.setJoystick === 'function') {
            controller.setJoystick(joystick);
            return;
        }

        if ('joystick' in controller) {
            controller.joystick = joystick;
        }
    }

    private onEnemyDied(_entity: pc.Entity, _pos: pc.Vec3, expValue: number) {
        this.onGainExp(expValue);
    }

    private onGainExp(amount: number) {
        const gain = Math.max(0, amount) * (this.stats.expEfficiency || 1);
        if (gain <= 0) return;

        this.currentExp += gain;

        while (this.currentExp >= this.expToNextLevel) {
            this.currentExp -= this.expToNextLevel;
            this.levelUp();
        }

        this.updateHUD(true);
    }

    private levelUp() {
        const prevLevel = this.level;
        const prevMaxHealth = this.stats.maxHealth;

        this.level = Math.min(999, this.level + 1);
        this.applyLevelBaseStats(prevLevel, this.level);
        this.syncExpRequirementFromLevel();

        const deltaMax = this.stats.maxHealth - prevMaxHealth;
        if (deltaMax > 0) {
            this.stats.currentHealth = Math.min(this.stats.maxHealth, this.stats.currentHealth + deltaMax);
        }

        this.eventBus.fire('player:levelUp', this.level);
        this.updateHUD(true);
    }

    private onHitPlayer(rawDamage: number, hitPos?: pc.Vec3) {
        const damage = this.takeDamage(rawDamage);
        if (damage <= 0) return;

        if (hitPos) {
            this.eventBus.fire('combat:damage', damage, hitPos.clone(), '#ff6b6b');
        }
    }

    private takeDamage(rawDamage: number): number {
        if (this.stats.currentHealth <= 0) return 0;

        const defense = this.stats.defense || 0;
        const actualDamage = Math.max(1, Math.floor(rawDamage) - defense);
        this.stats.currentHealth = Math.max(0, this.stats.currentHealth - actualDamage);

        if (this.stats.currentHealth <= 0) {
            this.handleDeath();
        }

        this.updateHUD(true);
        return actualDamage;
    }

    private onHeal(amount: number, pos?: pc.Vec3) {
        const heal = Math.max(0, amount);
        if (heal <= 0) return;

        const before = this.stats.currentHealth;
        this.stats.currentHealth = Math.min(this.stats.maxHealth, this.stats.currentHealth + heal);
        const actual = this.stats.currentHealth - before;

        if (actual > 0 && pos) {
            this.eventBus.fire('combat:damage', actual, pos.clone(), '#66ff99');
        }

        this.updateHUD(true);
    }

    private onConsumeEnergy(amount: number): boolean {
        const cost = Math.max(0, amount);
        if (cost <= 0) return true;
        if (this.energy.current < cost) return false;

        this.energy.current -= cost;
        return true;
    }

    private handleDeath() {
        this.stats.currentHealth = 0;
        this.eventBus.fire('game:over');
    }

    private onApplyEffect(effect: CardEffect) {
        if (!effect?.target?.startsWith('c_')) return;

        const targetId = effect.target;
        if (targetId !== 'c_player' && targetId !== 'c_*') return;

        const key = effect.stat as keyof PlayerStats;
        const beforeMax = this.stats.maxHealth;

        if (key in this.stats) {
            const curr = this.stats[key] as unknown as number;
            if (typeof curr === 'number') {
                if (effect.type === 'add') {
                    (this.stats as any)[key] = curr + effect.value;
                } else if (effect.type === 'multiply') {
                    (this.stats as any)[key] = curr * (1 + effect.value);
                }
            }
        }

        if (key === 'maxHealth') {
            this.stats.maxHealth = Math.max(1, this.stats.maxHealth);
            const delta = this.stats.maxHealth - beforeMax;
            if (delta > 0) {
                this.stats.currentHealth = Math.min(this.stats.maxHealth, this.stats.currentHealth + delta);
            }
        }

        this.stats.currentHealth = Math.min(this.stats.maxHealth, Math.max(0, this.stats.currentHealth));

        this.updateHUD(true);
    }

    private onAddStatusEffect(kind: string, duration: number = 5, stacks: number = 1, id?: string) {
        const k = String(kind ?? '').trim();
        if (!k) return;

        const effId = (id && String(id).trim()) || `se_${pc.guid.create()}`;
        const maxDuration = Math.max(0, duration);

        const existing = this.statusEffects.find(e => e.id === effId);
        if (existing) {
            existing.stacks = Math.max(1, existing.stacks + Math.max(0, stacks));
            existing.maxDuration = Math.max(existing.maxDuration, maxDuration);
            existing.duration = Math.max(existing.duration, maxDuration);
        } else {
            this.statusEffects.push({
                id: effId,
                kind: k,
                duration: maxDuration,
                maxDuration,
                stacks: Math.max(1, stacks)
            });
        }

        this.updateHUD(true);
    }

    private onRemoveStatusEffect(id: string) {
        const effId = String(id ?? '').trim();
        if (!effId) return;
        const before = this.statusEffects.length;
        this.statusEffects = this.statusEffects.filter(e => e.id !== effId);
        if (this.statusEffects.length !== before) {
            this.updateHUD(true);
        }
    }

    private onClearStatusEffects() {
        if (this.statusEffects.length === 0) return;
        this.statusEffects = [];
        this.updateHUD(true);
    }

    private updateHUD(force: boolean) {
        const nextHealth = { current: this.stats.currentHealth, max: this.stats.maxHealth };
        if (force || !this.lastHudHealth || this.lastHudHealth.current !== nextHealth.current || this.lastHudHealth.max !== nextHealth.max) {
            this.lastHudHealth = nextHealth;
            this.eventBus.fire('ui:updateHealth', nextHealth.current, nextHealth.max);
        }

        const nextExp = { current: this.currentExp, max: this.expToNextLevel, level: this.level };
        if (force || !this.lastHudExp || this.lastHudExp.current !== nextExp.current || this.lastHudExp.max !== nextExp.max || this.lastHudExp.level !== nextExp.level) {
            this.lastHudExp = nextExp;
            this.eventBus.fire('ui:updateExp', nextExp.current, nextExp.max, nextExp.level);
        }

        const buffCount = this.getBuffCountForUI();
        if (force || buffCount !== this.lastBuffCount) {
            this.lastBuffCount = buffCount;
            this.eventBus.fire('ui:updateBuffCount', buffCount);
        }
    }

    private getBuffCountForUI(): number {
        if (this.statusEffects.length === 0) return 0;
        let count = 0;
        for (const e of this.statusEffects) {
            count += Math.max(1, e.stacks);
        }
        return count;
    }

    private syncExpRequirementFromLevel() {
        const cfg = WorldLevelConfig.find(c => c.level === this.level);
        if (cfg) {
            this.expToNextLevel = cfg.expRequired;
            return;
        }
        this.expToNextLevel = Math.floor(100 * Math.pow(1.2, this.level - 1));
    }

    private applyLevelBaseStats(prevLevel: number, nextLevel: number) {
        const prev = WorldLevelConfig.find(c => c.level === prevLevel)?.playerStats;
        const next = WorldLevelConfig.find(c => c.level === nextLevel)?.playerStats;
        if (!next) return;

        const keys: (keyof PlayerStats)[] = [
            'maxHealth',
            'defense',
            'magicDefense',
            'moveSpeed',
            'pickupRange',
            'expEfficiency',
            'luck'
        ];

        for (const k of keys) {
            const nextVal = next[k];
            if (typeof nextVal !== 'number') continue;

            const prevVal = prev?.[k];
            if (typeof prevVal === 'number') {
                const delta = nextVal - prevVal;
                const curr = (this.stats as any)[k];
                if (typeof curr === 'number') {
                    (this.stats as any)[k] = curr + delta;
                } else {
                    (this.stats as any)[k] = nextVal;
                }
            } else {
                (this.stats as any)[k] = nextVal;
            }
        }

        this.stats.maxHealth = Math.max(1, this.stats.maxHealth);
        this.stats.currentHealth = Math.min(this.stats.maxHealth, Math.max(0, this.stats.currentHealth));
    }

    private createDefaultPlayerStats(): PlayerStats {
        const cfg = WorldLevelConfig.find(c => c.level === 1)?.playerStats;
        const maxHealth = cfg?.maxHealth ?? 100;
        const currentHealth = cfg?.currentHealth ?? maxHealth;
        return {
            currentHealth,
            maxHealth,
            defense: cfg?.defense ?? 0,
            magicDefense: cfg?.magicDefense ?? 0,
            moveSpeed: cfg?.moveSpeed ?? 10,
            pickupRange: cfg?.pickupRange ?? 3,
            expEfficiency: cfg?.expEfficiency ?? 1,
            luck: cfg?.luck ?? 1
        };
    }
}
