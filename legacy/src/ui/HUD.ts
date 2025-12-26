import { GameConfig } from '../config/evolution';
import type { PlayerStats as IPlayerStats } from '../config/types';
import { EventBus } from '../core/EventBus';
import { GameContext } from '../core/GameContext';
import { HUDStatusBars } from './components/HUDStatusBars';
import { HUDInventory } from './components/HUDInventory';

export class HUD {
    private eventBus: EventBus;
    private statusBars: HUDStatusBars;
    private inventory: HUDInventory;

    private level: number = 1;
    private currentExp: number = 0;
    private expToNextLevel: number = 100;

    constructor() {
        this.eventBus = EventBus.getInstance();
        this.statusBars = new HUDStatusBars();
        this.inventory = new HUDInventory();
        this.bindEvents();

        const expCfg = GameConfig.levelTable.find(l => l.level === 1);
        this.level = 1;
        this.currentExp = 0;
        this.expToNextLevel = expCfg?.expRequired ?? 100;

        // Initialize with default values
        this.statusBars.updateHealth(GameConfig.defaultPlayerStats.currentHealth, GameConfig.defaultPlayerStats.maxHealth, GameConfig.defaultPlayerStats.tempShield);
        this.statusBars.updateExp(this.currentExp, this.expToNextLevel, this.level);

        this.trySyncFromPlayer(0);
    }

    public destroy() {
        this.eventBus.off('ui:updateHealth', this.onUpdateHealth, this);
        this.eventBus.off('ui:updateExp', this.onUpdateExp, this);
        this.eventBus.off('player:statsChanged', this.onStatsChanged, this);
        this.eventBus.off('player:levelUp', this.onLevelUp, this);

        this.statusBars.destroy();
        this.inventory.destroy();
    }

    public addItem(id: string, icon: string, rarity: string) {
        this.inventory.addItem(id, icon, rarity);
    }

    public removeItem(id: string) {
        this.inventory.removeItem(id);
    }

    private bindEvents() {
        this.eventBus.on('ui:updateHealth', this.onUpdateHealth, this);
        this.eventBus.on('ui:updateExp', this.onUpdateExp, this);
        this.eventBus.on('player:statsChanged', this.onStatsChanged, this);
        this.eventBus.on('player:levelUp', this.onLevelUp, this);
    }

    private onUpdateHealth = (current: number, max: number, shield: number) => {
        this.statusBars.updateHealth(current, max, shield);
    };

    private onUpdateExp = (currentExp: number, expToNext: number, level: number) => {
        this.currentExp = currentExp;
        this.expToNextLevel = expToNext;
        this.level = level;
        this.statusBars.updateExp(currentExp, expToNext, level);
    };

    private onStatsChanged = (stats: IPlayerStats) => {
        // Only update health from stats, other stats are not displayed in the new simplified HUD
        this.statusBars.updateHealth(stats.currentHealth, stats.maxHealth, stats.tempShield);
    };

    private onLevelUp = (level: number) => {
        this.level = level;

        const expCfg = GameConfig.levelTable.find(l => l.level === level);
        if (expCfg) {
            this.expToNextLevel = expCfg.expRequired;
            this.statusBars.updateExp(this.currentExp, this.expToNextLevel, this.level);
        }
    };

    private trySyncFromPlayer(attempt: number) {
        const player = GameContext.getInstance().getPlayer();
        const scripts = (player as any)?.script;
        const statsComp = scripts ? (scripts.get('playerStats') as any) : null;

        if (statsComp && statsComp.stats) {
            const stats = statsComp.stats as IPlayerStats;
            const lvl = typeof statsComp.level === 'number' ? statsComp.level : this.level;
            const cur = typeof statsComp.currentExp === 'number' ? statsComp.currentExp : this.currentExp;
            const next = typeof statsComp.expToNextLevel === 'number' ? statsComp.expToNextLevel : this.expToNextLevel;

            this.statusBars.updateExp(cur, next, lvl);
            this.statusBars.updateHealth(stats.currentHealth, stats.maxHealth, stats.tempShield);
            return;
        }

        if (attempt < 90) {
            window.requestAnimationFrame(() => this.trySyncFromPlayer(attempt + 1));
        }
    }
}
