import * as pc from 'playcanvas';
import { IGameSystem } from '../share/IGameSystem';
import { GameContext } from '../../core/GameContext';
import { EventBus } from '../../core/EventBus';
import { UIManager } from '../../core/UIManager';
import { PlayerStats } from '../../entities/characters/share/PlayerStats';
import { PlayerController } from '../../entities/characters/share/PlayerController';
import { CardEffect } from '../../config/types';

export class CharacterSystem implements IGameSystem {
    private eventBus: EventBus;
    private ui: UIManager;

    constructor(ui: UIManager) {
        GameContext.getInstance().getApp(); // Ensure context is ready
        this.eventBus = EventBus.getInstance();
        this.ui = ui;
    }

    initialize() {
        console.log("CharacterSystem initialized");

        // 绑定摇杆到玩家控制器
        this.setupPlayerController();

        // 监听事件
        this.eventBus.on('player:gainExp', this.onGainExp, this);
        this.eventBus.on('combat:hit', this.onHit, this);
        this.eventBus.on('card:applyEffect', this.onApplyEffect, this);

        // 初始UI更新
        this.updateHUD();
    }

    update(dt: number) {
        // 可以在这里处理持续性状态效果 (Buffs/Debuffs)
        void dt;
    }

    private setupPlayerController() {
        const player = GameContext.getInstance().getPlayer();
        if (player && player.script) {
            const controller = player.script.get('playerController') as PlayerController;
            if (controller) {
                controller.setup(this.ui.getJoystick());
            }
        }
    }

    private onGainExp(amount: number) {
        const player = GameContext.getInstance().getPlayer();
        if (!player || !player.script) return;

        const stats = player.script.get('playerStats') as PlayerStats;
        if (!stats) return;

        // 计算实际经验值 (基础值 * 效率)
        const actualExp = amount * stats.stats.expEfficiency;

        stats.currentExp += actualExp;

        // 升级逻辑
        while (stats.currentExp >= stats.expToNextLevel) {
            stats.currentExp -= stats.expToNextLevel;
            this.levelUp(stats);
        }

        this.updateHUD(stats);
    }

    private levelUp(stats: PlayerStats) {
        stats.level++;
        stats.updateLevelRequirements();

        console.log(`Level Up! New Level: ${stats.level}`);

        // 触发升级事件 (CardSystem 会监听此事件并暂停游戏)
        this.eventBus.fire('player:levelUp', stats.level);

        // 升级回血? (可选)
        // stats.stats.currentHealth = stats.stats.maxHealth;
    }

    private onHit(target: pc.Entity, damage: number) {
        const player = GameContext.getInstance().getPlayer();
        // 确认受击者是玩家
        if (target !== player) return;

        const stats = player.script?.get('playerStats') as PlayerStats;
        if (!stats) return;

        this.takeDamage(stats, damage);
    }

    private takeDamage(stats: PlayerStats, rawDamage: number) {
        // 简化的伤害公式: 伤害 - 防御
        let actualDamage = rawDamage - stats.stats.defense;
        if (actualDamage < 1) actualDamage = 1;

        stats.stats.currentHealth -= actualDamage;

        // 死亡逻辑
        if (stats.stats.currentHealth <= 0) {
            stats.stats.currentHealth = 0;
            this.handleDeath();
        }

        this.updateHUD(stats);
    }

    private handleDeath() {
        console.log("Player Died!");
        this.eventBus.fire('game:over');
        // 可以添加复活逻辑
    }

    private updateHUD(stats?: PlayerStats) {
        if (!stats) {
            const player = GameContext.getInstance().getPlayer();
            if (player && player.script) {
                stats = player.script.get('playerStats') as PlayerStats;
            }
        }

        if (stats) {
            this.eventBus.fire('ui:updateHealth', stats.stats.currentHealth, stats.stats.maxHealth, 0); // Shield removed for now
            this.eventBus.fire('ui:updateExp', stats.currentExp, stats.expToNextLevel, stats.level);
        }
    }

    private onApplyEffect(effect: CardEffect) {
        // 默认 target 为 player
        if (effect.target && effect.target !== 'player') return;

        const player = GameContext.getInstance().getPlayer();
        const stats = player?.script?.get('playerStats') as PlayerStats;
        if (!stats) return;

        const val = effect.value;
        const key = effect.stat;

        // 简单的属性修改逻辑
        if (key in stats.stats) {
            if (effect.type === 'add') {
                (stats.stats as any)[key] += val;
            } else if (effect.type === 'multiply') {
                (stats.stats as any)[key] *= (1 + val);
            }
        }

        // 特殊处理：最大生命值增加时，回复对应血量
        if (key === 'maxHealth' && effect.type === 'add') {
            stats.stats.currentHealth += val;
        }

        this.updateHUD(stats);
    }
}
