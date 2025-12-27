import { PlayerStats } from '../config/types';
import { EventBus } from '../core/EventBus';
import { PlayerStatusComponent } from './components/PlayerStatusComponent';

/**
 * 玩家状态管理器 (PlayerStatus)
 * 
 * 职责:
 * 1. 监听玩家血量和经验变化事件。
 * 2. 计算血量百分比并决定血条颜色。
 * 3. 更新 UI 组件。
 */
export class PlayerStatus {
    private component: PlayerStatusComponent;
    private eventBus: EventBus;

    constructor() {
        this.component = new PlayerStatusComponent();
        this.eventBus = EventBus.getInstance();

        // 绑定事件
        this.eventBus.on('player:damage', this.onPlayerDamage, this);
        this.eventBus.on('player:heal', this.onPlayerHeal, this);
        this.eventBus.on('player:exp', this.onPlayerExp, this);
        this.eventBus.on('player:levelup', this.onPlayerLevelUp, this);
        this.eventBus.on('player:init', this.onPlayerInit, this);
    }

    private updateHealthUI(current: number, max: number) {
        if (max <= 0) return;

        const percent = (current / max) * 100;

        // 决定颜色
        let color = '#4caf50'; // Green
        if (percent < 20) {
            color = '#f44336'; // Red
        } else if (percent < 50) {
            color = '#ff9800'; // Orange/Yellow
        }

        this.component.updateHP(percent, current, max, color);
    }

    private onPlayerInit(stats: PlayerStats, level: number, currentExp: number, maxExp: number) {
        this.updateHealthUI(stats.currentHealth, stats.maxHealth);
        this.onPlayerExp(currentExp, maxExp, level);
    }

    private onPlayerDamage(_damage: number, current: number, max: number) {
        this.updateHealthUI(current, max);
    }

    private onPlayerHeal(_amount: number, current: number, max: number) {
        this.updateHealthUI(current, max);
    }

    private onPlayerExp(current: number, max: number, level: number) {
        if (max <= 0) max = 1; // 防止除零
        const percent = (current / max) * 100;
        const levelText = `Lv.${level}`;
        this.component.updateEXP(percent, levelText);
    }

    private onPlayerLevelUp(_level: number) {
        // 升级时，经验值通常会重置或变更，通常会紧接着收到 player:exp 事件
        // 这里可以只更新等级文字，或者播放特效
        // 为简单起见，这里不做特殊处理，依赖 player:exp 更新
    }

    public destroy() {
        this.eventBus.off('player:damage', this.onPlayerDamage, this);
        this.eventBus.off('player:heal', this.onPlayerHeal, this);
        this.eventBus.off('player:exp', this.onPlayerExp, this);
        this.eventBus.off('player:levelup', this.onPlayerLevelUp, this);
        this.eventBus.off('player:init', this.onPlayerInit, this);
        this.component.destroy();
    }
}
