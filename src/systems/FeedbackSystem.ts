import * as pc from 'playcanvas';
import { IGameSystem } from './share/IGameSystem';
import { GameContext } from '../core/GameContext';
import { EventBus } from '../core/EventBus';
import { FloatingTextManager } from '../ui/FloatingTextManager';

/**
 * 反馈系统
 * 管理视觉和听觉反馈，如飘字、屏幕震动、音效等。
 */
export class FeedbackSystem implements IGameSystem {
    private app: pc.Application;
    private eventBus: EventBus;
    private floatingText: FloatingTextManager;

    constructor() {
        this.app = GameContext.getInstance().getApp();
        this.eventBus = EventBus.getInstance();
        this.floatingText = new FloatingTextManager(this.app);
    }

    initialize() {
        const camera = GameContext.getInstance().getCamera();
        if (camera) {
            this.floatingText.setCamera(camera);
        }

        this.eventBus.on('combat:damage', this.onDamage, this);
        this.eventBus.on('feedback:show', this.onFeedback, this);

        console.log("FeedbackSystem initialized");
    }

    update(dt: number) {
        // 更新飘字等效果（如果需要逐帧逻辑）
        dt = dt; // 使用dt变量以规避警告
    }

    /**
     * 处理伤害飘字
     */
    private onDamage(damage: number, pos: pc.Vec3, color: string) {
        // 如果伤害为0，可能是未命中或无敌，这里假设0也显示
        // 如果是 Quiz 结果，damage 为 0，但有 color 区别
        const text = damage > 0 ? damage.toString() : (color === 'lime' ? 'Correct!' : 'Wrong!');
        // 实际上 QuizSystem 可能直接发 feedback:show
        // 这里只处理纯数值伤害
        if (damage > 0) {
            this.floatingText.spawn(text, pos, color);
        }
    }

    /**
     * 处理通用反馈飘字
     */
    private onFeedback(text: string, pos: pc.Vec3, color: string) {
        this.floatingText.spawn(text, pos, color);
    }
}
