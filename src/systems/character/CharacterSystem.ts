import { IGameSystem } from '../../config/types';
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
export class CharacterSystem implements IGameSystem {
    private eventBus: EventBus;
    private ui: UIManager;

    constructor(ui: UIManager) {
        GameContext.getInstance().getApp();
        this.eventBus = GameContext.getInstance().getEventBus();
        this.ui = ui;
    }

    initialize() {
        console.log("CharacterSystem initialized");
    }

    update(dt: number) {
        void dt;
    }
}
