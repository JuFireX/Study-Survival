import { IGameSystem } from '../config/types';

/**
 * 调试系统 (DebugSystem)
 * 
 * 职责:
 * 1. 提供调试功能: 如打印日志, 绘制调试图形等
 * 2. 可供调配的UI: 调试UI (如日志窗口, 调试选项等)
 * 
 * 由于调试系统主要用于开发阶段, 所以这里可以直接调用相关的调试函数, 而不需要考虑性能问题
 */
export class DebugSystem implements IGameSystem {
    name = 'DebugSystem';

    initialize(): void {
        console.log('DebugSystem initialized');
    }

    update(dt: number): void {
        console.log(`DebugSystem updated with delta time: ${dt}`);
    }
}