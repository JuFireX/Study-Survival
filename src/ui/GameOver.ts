import { EventBus } from '../core/EventBus';
import { GameOverComponent } from './components/GameOverComponent';

/**
 * 游戏结束界面管理器 (GameOver)
 * 
 * 职责:
 * 1. 监听玩家死亡事件。
 * 2. 显示游戏结束 UI。
 * 3. 处理重新开始逻辑。
 */
export class GameOver {
    private component: GameOverComponent;
    private eventBus: EventBus;

    constructor() {
        this.component = new GameOverComponent();
        this.eventBus = EventBus.getInstance();

        // 绑定事件
        this.eventBus.on('player:dead', this.onPlayerDead, this);
    }

    private onPlayerDead() {
        console.log('[GameOver] Player died, showing UI...');
        this.component.show(() => {
            console.log('[GameOver] Restarting game...');
            // 目前简单的重开方式是刷新页面
            // 如果后续有更复杂的场景管理，可以调用 GameApplication 或 GameManager 的 reset 方法
            window.location.reload();
        });
    }

    public destroy() {
        this.eventBus.off('player:dead', this.onPlayerDead, this);
        this.component.destroy();
    }
}
