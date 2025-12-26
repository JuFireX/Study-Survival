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
        this.eventBus.on('ui:updateHealth', this.onUpdateHealth, this);
        this.eventBus.on('ui:updateExp', this.onUpdateExp, this);
    }

    private onUpdateHealth(current: number, max: number) {
        if (max <= 0) return;

        // 计算百分比
        // 注意：这里我们主要显示生命值，护盾可以叠加显示或另行处理，目前简化为只显示生命值
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

    private onUpdateExp(current: number, max: number, level: number) {
        if (max <= 0) max = 1; // 防止除零
        const percent = (current / max) * 100;
        const levelText = `Lv.${level}`;
        this.component.updateEXP(percent, levelText);
    }

    public destroy() {
        this.eventBus.off('ui:updateHealth', this.onUpdateHealth, this);
        this.eventBus.off('ui:updateExp', this.onUpdateExp, this);
        this.component.destroy();
    }
}
