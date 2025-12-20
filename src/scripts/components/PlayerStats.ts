import * as pc from 'playcanvas';
import { GameConfig } from '../../config/evolution';
import { PlayerStats as IPlayerStats, Card, CardEffect } from '../../config/types';
import { EventBus } from '../../core/EventBus';

export class PlayerStats extends pc.ScriptType {
    public stats!: IPlayerStats;

    // Leveling
    public level: number = 1;
    public currentExp: number = 0;
    public expToNextLevel: number = 100;

    private eventBus!: EventBus;

    initialize() {
        this.eventBus = EventBus.getInstance();

        // Deep copy default stats
        this.stats = JSON.parse(JSON.stringify(GameConfig.defaultPlayerStats));

        this.updateLevelRequirements();

        // Listen for exp gain events
        this.eventBus.on('player:gainExp', this.addExp, this);
    }

    updateLevelRequirements() {
        const config = GameConfig.levelTable.find(l => l.level === this.level);
        if (config) {
            this.expToNextLevel = config.expRequired;
        } else {
            // Fallback for high levels
            this.expToNextLevel = Math.floor(100 * Math.pow(1.2, this.level - 1));
        }
    }

    addExp(amount: number) {
        // Apply multipliers
        const actualExp = amount * this.stats.expMultiplier * GameConfig.baseExpEfficiency;

        this.currentExp += actualExp;

        // Check for level up
        while (this.currentExp >= this.expToNextLevel) {
            this.currentExp -= this.expToNextLevel;
            this.levelUp();
        }

        this.eventBus.fire('ui:updateExp', this.currentExp, this.expToNextLevel, this.level);
    }

    levelUp() {
        this.level++;
        this.updateLevelRequirements();

        // Fire level up event to trigger UI/Game pause
        this.eventBus.fire('player:levelUp', this.level);

        // Heal on level up? Optional.
        // this.heal(this.stats.maxHealth * 0.1);
    }

    applyCard(card: Card, success: boolean) {
        // success determines if we amplify or weaken the effect
        // Simple logic: Correct = 1.2x, Wrong = 0.5x
        const multiplier = success ? 1.2 : 0.5;

        card.effects.forEach(effect => {
            this.applyEffect(effect, multiplier);
        });

        this.eventBus.fire('player:statsChanged', this.stats);
    }

    private applyEffect(effect: CardEffect, multiplier: number) {
        const finalValue = effect.value * multiplier;

        if (effect.type === 'add') {
            (this.stats as any)[effect.stat] += finalValue;
        } else if (effect.type === 'multiply') {
            (this.stats as any)[effect.stat] *= (1 + finalValue); // Assuming value is 0.1 for 10%
        }

        // Handle max health/shield changes
        if (effect.stat === 'maxHealth') {
            this.stats.currentHealth += finalValue; // Heal the amount added?
        }
    }

    // Health management
    takeDamage(amount: number) {
        // Apply defense/armor
        let actualDamage = amount * (1 - this.stats.damageReduction);
        actualDamage -= this.stats.armor;
        if (actualDamage < 1) actualDamage = 1;

        // Shield first
        if (this.stats.tempShield > 0) {
            if (this.stats.tempShield >= actualDamage) {
                this.stats.tempShield -= actualDamage;
                actualDamage = 0;
            } else {
                actualDamage -= this.stats.tempShield;
                this.stats.tempShield = 0;
            }
        }

        this.stats.currentHealth -= actualDamage;

        if (this.stats.currentHealth <= 0) {
            this.die();
        }

        this.eventBus.fire('ui:updateHealth', this.stats.currentHealth, this.stats.maxHealth, this.stats.tempShield);
    }

    heal(amount: number) {
        this.stats.currentHealth = Math.min(this.stats.currentHealth + amount, this.stats.maxHealth);
        this.eventBus.fire('ui:updateHealth', this.stats.currentHealth, this.stats.maxHealth, this.stats.tempShield);
    }

    die() {
        if (this.stats.revives > 0) {
            this.stats.revives--;
            this.stats.currentHealth = this.stats.maxHealth * 0.5;
            this.eventBus.fire('player:revive');
            // Add invincibility logic here or in CombatSystem
        } else {
            this.eventBus.fire('game:over');
        }
    }
}
