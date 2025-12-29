import * as pc from 'playcanvas';
import { IGameSystem, CardType, CardRarity, QuestionCard, BuffCard, WeaponCard } from '../../config/types';
import { GameContext } from '../../core/GameContext';
import { UIManager } from '../../core/manager/UIManager';


export class UIDebugSystem implements IGameSystem {
    name = 'UIDebugSystem';
    private app: pc.Application | null = null;
    private isInitialized = false;

    // 测试用状态
    private bossHealth = 1000;
    private playerHealth = 100;
    private playerExp = 0;
    private buffCount = 0;

    initialize(): void {
        try {
            const context = GameContext.getInstance();
            // 尝试获取应用实例, 但可能在初始化时还未准备好
            try {
                this.app = context.getApp();
                this.isInitialized = true;
            } catch (e) {
                // 忽略, 稍后在 update 中重试
            }
            console.log('DebugSystem initialized. Press 1-5 to test UI components.');
        } catch (e) {
            console.warn('DebugSystem initialization pending: ' + e);
        }
    }

    update(dt: number): void {
        if (!this.isInitialized) {
            try {
                this.app = GameContext.getInstance().getApp();
                this.isInitialized = true;
                console.log('UIDebugSystem fully initialized.' + dt);
            } catch (e) {
                return;
            }
        }

        if (!this.app || !this.app.keyboard) return;

        // Key 1: Test CardSelect
        if (this.app.keyboard.wasPressed(pc.KEY_1)) {
            this.testCardSelect();
        }

        // Key 2: Test BossStatus
        if (this.app.keyboard.wasPressed(pc.KEY_2)) {
            this.testBossStatus();
        }

        // Key 3: Test FloatingText
        if (this.app.keyboard.wasPressed(pc.KEY_3)) {
            this.testFloatingText();
        }

        // Key 4: Test PlayerStatus
        if (this.app.keyboard.wasPressed(pc.KEY_4)) {
            this.testPlayerStatus();
        }

        // Key 5: Test PlayerEffects
        if (this.app.keyboard.wasPressed(pc.KEY_5)) {
            this.testPlayerEffects();
        }

        // Key J: Log Joystick
        if (this.app.keyboard.isPressed(pc.KEY_J)) {
            const joystick = UIManager.getInstance().getJoystick();
            if (joystick) {
                if (Math.abs(joystick.value.x) > 0.01 || Math.abs(joystick.value.y) > 0.01) {
                    console.log('Joystick:', joystick.value);
                }
            }
        }
    }

    private testCardSelect() {
        console.log('Testing CardSelect...');
        const cardSelect = UIManager.getInstance().getCardSelect();
        if (!cardSelect) return;

        const questions: QuestionCard[] = [
            { id: 'q1', rarity: CardRarity.Common, type: CardType.Question, question: { id: 1, subject: 'Math', difficulty: 1, text: '1+1=?' } },
            { id: 'q2', rarity: CardRarity.Rare, type: CardType.Question, question: { id: 2, subject: 'Math', difficulty: 2, text: '2*2=?' } },
            { id: 'q3', rarity: CardRarity.Epic, type: CardType.Question, question: { id: 3, subject: 'Math', difficulty: 3, text: '3^2=?' } }
        ];

        const rewards: (BuffCard | WeaponCard)[] = [
            { id: 'b1', rarity: CardRarity.Common, type: CardType.Buff, name: 'Speed Up', description: 'Increases speed', effects: [] },
            {
                id: 'w1',
                rarity: CardRarity.Rare,
                type: CardType.Weapon,
                name: 'Sword',
                description: 'A sharp sword',
                effects: [],
                stats: {
                    damage: 10,
                    cooldown: 1,
                    range: 5,
                    projectileSpeed: 10,
                    projectileCount: 1,
                    pierceCount: 0,
                    areaSize: 1
                }
            },
            { id: 'b2', rarity: CardRarity.Epic, type: CardType.Buff, name: 'Health Up', description: 'Increases HP', effects: [] }
        ];

        cardSelect.start(questions, rewards, (selectedIds) => {
            console.log('Card selected:', selectedIds);
        });
    }

    private testBossStatus() {
        console.log('Testing BossStatus...');
        const bossStatus = UIManager.getInstance().getBossStatus();
        if (!bossStatus) return;

        this.bossHealth -= 100;
        if (this.bossHealth <= 0) this.bossHealth = 1000;

        bossStatus.setHealth(this.bossHealth, 1000);
        bossStatus.show();
    }

    private testFloatingText() {
        console.log('Testing FloatingText...');
        const floatingText = UIManager.getInstance().getFloatingTextManager();
        if (!floatingText) return;

        // Ensure we have a camera, otherwise FloatingText might fail or not show
        const camera = GameContext.getInstance().getCamera();
        if (!camera) {
            console.warn("No camera found for FloatingText test, texts might not appear correctly.");
        }

        // Random position around (0,0,0) or player position if available
        let pos = new pc.Vec3(0, 1, 0);
        const player = GameContext.getInstance().getPlayer();
        if (player) {
            pos = player.getPosition().clone().add(new pc.Vec3(0, 2, 0));
        } else {
            pos = new pc.Vec3((Math.random() - 0.5) * 5, 1, (Math.random() - 0.5) * 5);
        }

        const damage = Math.floor(Math.random() * 100);
        floatingText.spawn(damage.toString(), pos, 'red');
    }

    private testPlayerStatus() {
        console.log('Testing PlayerStatus...');
        // Dispatch events through EventBus
        const eventBus = GameContext.getInstance().getEventBus();

        this.playerHealth -= 10;
        if (this.playerHealth <= 0) this.playerHealth = 100;
        eventBus.fire('ui:updateHealth', this.playerHealth, 100);

        this.playerExp += 20;
        if (this.playerExp > 100) this.playerExp = 0;
        eventBus.fire('ui:updateExp', this.playerExp, 100, 1);
    }

    private testPlayerEffects() {
        console.log('Testing PlayerEffects...');
        const eventBus = GameContext.getInstance().getEventBus();

        this.buffCount = (this.buffCount + 1) % 10;
        eventBus.fire('ui:updateBuffCount', this.buffCount);
    }
}
