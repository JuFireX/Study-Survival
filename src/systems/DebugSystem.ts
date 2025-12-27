import { IGameSystem } from '../config/types';
import { UIDebugSystem } from './debug/UIDebugSystem';
import { EnemySystem } from './enemy/EnemySystem';
import { UIManager } from '../core/manager/UIManager';

/**
 * 调试系统 (DebugSystem)
 * 
 * 职责:
 * 1. 提供调试功能: 从 debug/ 目录获取想要调试的系统
 * 2. 可供调配的UI: 调试UI (如日志窗口, 调试选项等)
 * 
 * 由于调试系统主要用于开发阶段, 所以这里可以直接调用相关的调试函数, 而不需要考虑性能问题
 */
export class DebugSystem implements IGameSystem {
    name = 'DebugSystem';
    private uiDebugSystem = new UIDebugSystem();
    private uiManager = new UIManager();
    private enemySystem = new EnemySystem(this.uiManager);


    initialize(): void {
        // 初始化调试系统
        console.log('DebugSystem initialized');
        this.uiDebugSystem.initialize();
        this.enemySystem.initialize();
    }

    update(dt: number): void {
        // 更新调试系统
        this.uiDebugSystem.update(dt);
        this.enemySystem.update(dt);
    }
}