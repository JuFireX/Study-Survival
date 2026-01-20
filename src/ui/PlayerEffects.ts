import { EventBus } from '../core/EventBus';
import { PlayerEffectsComponent } from './components/PlayerEffectsComponent';

/**
 * 玩家效果管理器 (PlayerEffects)
 * 
 * 职责:
 * 1. 监听 EventBus 上的 Buff/Weapon 更新事件。
 * 2. 控制 UI 组件显示对应数量的小方块。
 */
export class PlayerEffects {
    private component: PlayerEffectsComponent;
    private eventBus: EventBus;

    constructor() {
        this.component = new PlayerEffectsComponent();
        this.eventBus = EventBus.getInstance();

        // 监听事件：接收每帧挂载输入（简化成数量）
        // 假设事件名为 'ui:updateBuffCount'，参数为 count: number
        this.eventBus.on('ui:updateBuffCount', this.onUpdateBuffCount, this);
    }

    private onUpdateBuffCount(count: number) {
        this.component.updateIcons(count);
    }

    public setVisible(visible: boolean) {
        this.component.setVisible(visible);
    }

    public destroy() {
        this.eventBus.off('ui:updateBuffCount', this.onUpdateBuffCount, this);
        this.component.destroy();
    }
}
