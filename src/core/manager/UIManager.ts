import * as pc from 'playcanvas';
import { GameContext } from '../GameContext';
// 待导入 UI 组件
// import { Joystick } from '../../ui/Joystick';
// import { HUD } from '../../ui/HUD';
// import { QuestionUI } from '../../ui/QuestionUI';
// import { SkillSelectUI } from '../../ui/SkillSelectUI';
// import { FloatingTextManager } from '../../ui/FloatingText';

/**
 * UI 管理器 (UIManager)
 * 
 * 职责:
 * 1. 实例化并管理所有具体的 UI 组件 (Joystick, HUD, QuestionUI 等)。
 * 2. 提供统一的接口供其他系统 (Systems) 调用 UI 功能。
 * 3. 负责 UI 相关的摄像机绑定 (如 FloatingText)。
 */
export class UIManager {
    private app: pc.Application;

    // UI 组件实例
    private joystick: Joystick;
    private hud: HUD;
    private questionUI: QuestionUI;
    private skillSelectUI: SkillSelectUI;
    private floatingText: FloatingTextManager;

    constructor() {
        const ctx = GameContext.getInstance();
        this.app = ctx.getApp();

        // 1. 初始化各类 UI 组件
        this.joystick = new Joystick();
        this.hud = new HUD();
        this.questionUI = new QuestionUI();
        this.skillSelectUI = new SkillSelectUI();
        this.floatingText = new FloatingTextManager(this.app);

        // 2. 绑定摄像机 (用于 3D 空间 UI，如飘字)
        const camera = ctx.getCamera();
        if (camera) {
            this.setCamera(camera);
        }
    }

    /**
     * 更新 UI 绑定的摄像机
     * 当主摄像机发生变化时调用
     */
    public setCamera(camera: pc.Entity) {
        this.floatingText.setCamera(camera);
    }

    // ==========================================
    // 组件访问接口
    // ==========================================

    public getJoystick(): Joystick {
        return this.joystick;
    }

    public getHUD(): HUD {
        return this.hud;
    }

    // ==========================================
    // 业务逻辑接口
    // ==========================================

    /**
     * 显示问题 UI
     * @param question 问题数据
     * @param onAnswer 回调函数，参数为答案
     */
    public showQuestion(question: QuestionData, onAnswer: (answer: number | string | number[]) => void) {
        this.questionUI.show(question, onAnswer);
    }

    /**
     * 显示技能选择 UI
     * @param cards 可选卡牌列表
     * @param onCheck 检查条件的回调
     * @param onSelect 选择后的回调
     */
    public showSkillSelect(cards: Card[], onCheck: (card: Card, answer: any) => boolean, onSelect: (card: Card | null) => void) {
        this.skillSelectUI.show(cards, onCheck, onSelect);
    }

    /**
     * 显示飘字效果
     * @param text 文本内容
     * @param worldPos 世界坐标
     * @param color 颜色字符串 (css color)
     */
    public showFloatingText(text: string, worldPos: pc.Vec3, color: string = 'white') {
        this.floatingText.spawn(text, worldPos, color);
    }
}
