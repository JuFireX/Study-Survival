import { Joystick } from "../../ui/Joystick";
import { PlayerStatus } from "../../ui/PlayerStatus";
import { CardSelect } from "../../ui/CardSelect";
import { BossStatus } from "../../ui/BossStatus";
import { PlayerEffects } from "../../ui/PlayerEffects";
import { FloatingTextManager } from "../../ui/FloatingTextManager";
import { EnemyHealthBarManager } from "../../ui/EnemyHealthBarManager";
import { EventBus } from "../EventBus";
import { QuestionCard, BuffCard, WeaponCard } from "../../config/types";

/**
 * UI 管理器 (UIManager)
 * 
 * 职责:
 * 1. 实例化并管理所有具体的 UI 组件 (Joystick 等)。
 * 2. 提供统一的接口供其他系统 (Systems) 调用 UI 功能。
 * 3. 负责 UI 相关的摄像机绑定 (如 FloatingText)。
 */
export class UIManager {
    private static instance: UIManager;

    // UI Modules
    private joystick: Joystick | null = null;
    private playerStatus: PlayerStatus | null = null;
    private cardSelect: CardSelect | null = null;
    private bossStatus: BossStatus | null = null;
    private playerEffects: PlayerEffects | null = null;
    private floatingTextManager: FloatingTextManager | null = null;
    private enemyHealthBarManager: EnemyHealthBarManager | null = null;

    constructor() {
        this.initialize();
        this.bindEvents();
    }

    private bindEvents() {
        const eventBus = EventBus.getInstance();
        eventBus.on('ui:showCardSelection', this.onShowCardSelection, this);
    }

    private onShowCardSelection(data: { questions: QuestionCard[], rewards: (BuffCard | WeaponCard)[] }) {
        if (this.cardSelect) {
            this.cardSelect.start(data.questions, data.rewards, (selectedIds) => {
                EventBus.getInstance().fire('card:selectionCompleted', selectedIds);
            });
        }
    }

    /**
     * 获取单例实例
     */
    public static getInstance(): UIManager {
        if (!UIManager.instance) {
            UIManager.instance = new UIManager();
        }
        return UIManager.instance;
    }

    /**
     * 初始化所有 UI 组件
     */
    private initialize() {
        try {
            console.log("[UIManager] Initializing UI components...");

            this.joystick = new Joystick();
            this.playerStatus = new PlayerStatus();
            this.cardSelect = new CardSelect();
            this.bossStatus = new BossStatus();
            this.playerEffects = new PlayerEffects();
            this.floatingTextManager = new FloatingTextManager();
            this.enemyHealthBarManager = new EnemyHealthBarManager();

            console.log("[UIManager] UI components initialized successfully.");
        } catch (error) {
            console.error("[UIManager] Failed to initialize UI components:", error);
        }
    }

    // ==========================================
    // Accessors for UI Modules
    // ==========================================

    public getJoystick(): Joystick | null {
        return this.joystick;
    }

    public getPlayerStatus(): PlayerStatus | null {
        return this.playerStatus;
    }

    public getFloatingTextManager(): FloatingTextManager | null {
        return this.floatingTextManager;
    }

    /**
     * @deprecated Use getFloatingTextManager() instead
     */
    public getFloatingText(): FloatingTextManager | null {
        return this.floatingTextManager;
    }

    public getCardSelect(): CardSelect | null {
        return this.cardSelect;
    }

    public getBossStatus(): BossStatus | null {
        return this.bossStatus;
    }

    public getPlayerEffects(): PlayerEffects | null {
        return this.playerEffects;
    }

    public getEnemyHealthBarManager(): EnemyHealthBarManager | null {
        return this.enemyHealthBarManager;
    }

    /**
     * 清理所有 UI 组件
     */
    public destroy() {
        this.joystick?.destroy();
        this.playerStatus?.destroy();
        this.cardSelect?.destroy();
        this.bossStatus?.destroy();
        this.playerEffects?.destroy();
        this.floatingTextManager?.destroy();
        this.enemyHealthBarManager?.destroy();
    }
}