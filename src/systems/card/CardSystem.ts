import { BuffCard, Card, IGameSystem, QuestionCard, WeaponCard } from '../../config/types';
import { GameContext } from '../../core/GameContext';

/**
 * 卡牌系统 (CardSystem)
 * 
 * 职责:
 * 1. 管理所有卡牌数据的加载、解析和缓存。
 * 2. 处理卡牌的抽取、洗牌、弃牌等逻辑。
 * 3. 维护当前手牌、牌库和弃牌堆的状态。
 * 4. 响应玩家的选卡操作，并触发相应的卡牌效果。
 * 5. 与 UI 系统交互，通知卡牌数据的变更。
 */
export class CardSystem implements IGameSystem {


    private context: GameContext;
    private isInitialized = false;

    private questionPool: QuestionCard[] = [];
    private rewardPool: (BuffCard | WeaponCard)[] = [];

    private questionDeck: QuestionCard[] = [];
    private rewardDeck: (BuffCard | WeaponCard)[] = [];

    private questionDiscard: QuestionCard[] = [];
    private rewardDiscard: (BuffCard | WeaponCard)[] = [];

    private rewardHand: (BuffCard | WeaponCard)[] = [];
    private ownedRewards: (BuffCard | WeaponCard)[] = [];

    private isSelecting = false;
    private lastSelectionSnapshot: { questions: QuestionCard[]; rewards: (BuffCard | WeaponCard)[] } | null = null;

    constructor() {
        this.context = GameContext.getInstance();
    }

    initialize(): void {
        console.log('[CardSystem] Initializing...');
        this.loadPoolsFromManager();
        this.resetDecks();
        this.bindEvents();
        this.publishPiles();
        this.isInitialized = true;
    }

    public update(dt: number): void {
        void dt;
        if (!this.isInitialized) return;
    }

    private bindEvents(): void {
        const eventBus = this.context.getEventBus();
        eventBus.on('player:levelup', this.onPlayerLevelUp, this);
        eventBus.on('player:drawCard', this.onDrawCards, this);
        eventBus.on('card:draw', this.onDrawCards, this);
        eventBus.on('card:discard', this.onDiscard, this);
        eventBus.on('card:discardAll', this.onDiscardAll, this);
        eventBus.on('card:showSelect', this.onShowSelect, this);
    }

    private loadPoolsFromManager(): void {
        const cm = this.context.getCardManager();
        if (!cm) {
            this.questionPool = [];
            this.rewardPool = [];
            return;
        }

        this.questionPool = cm.getAllQuestionCards();
        this.rewardPool = [...cm.getAllWeaponCards(), ...cm.getAllBuffCards()];
    }

    private resetDecks(): void {
        this.questionDeck = this.shuffleCopy(this.questionPool);
        this.rewardDeck = this.shuffleCopy(this.rewardPool);
        this.questionDiscard = [];
        this.rewardDiscard = [];
        this.rewardHand = [];
    }

    private onPlayerLevelUp(_level: number): void {
        this.startSelectionFlow();
    }

    private onShowSelect(): void {
        this.startSelectionFlow();
    }

    private startSelectionFlow(): void {
        if (this.isSelecting) return;
        this.isSelecting = true;

        const ui = this.context.getUIManager();
        const cardSelect = ui?.getCardSelect();
        if (!cardSelect) {
            this.isSelecting = false;
            this.context.getEventBus().fire('card:selectionFailed');
            return;
        }

        this.context.getEventBus().fire('game:pause');

        const questions = this.drawQuestions(3);
        const rewards = this.drawRewards(3);

        this.lastSelectionSnapshot = { questions, rewards };
        this.publishPiles();

        cardSelect.start(questions, rewards, (selectedCardId) => {
            this.onSelectionCompleted(selectedCardId);
        });
    }

    private onSelectionCompleted(selectedCardId: string): void {
        const snapshot = this.lastSelectionSnapshot;
        this.lastSelectionSnapshot = null;
        this.isSelecting = false;

        const eventBus = this.context.getEventBus();

        const selected =
            snapshot?.rewards.find(r => r.id === selectedCardId) ??
            this.rewardPool.find(r => r.id === selectedCardId) ??
            null;

        if (selected) {
            this.ownedRewards.push(selected);
        }

        if (snapshot) {
            this.questionDiscard.push(...snapshot.questions);
            this.rewardDiscard.push(...snapshot.rewards.filter(r => r.id !== selectedCardId));
        }

        this.publishPiles();
        eventBus.fire('card:selected', selectedCardId, selected);
        eventBus.fire('game:resume');
    }

    private onDrawCards(count?: number): void {
        const n = typeof count === 'number' && Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 1;
        if (n === 0) return;

        const cards = this.drawRewards(n);
        this.rewardHand.push(...cards);
        this.publishPiles();
        this.context.getEventBus().fire('card:drawn', cards);
    }

    private onDiscard(cardId: string): void {
        const index = this.rewardHand.findIndex(c => c.id === cardId);
        if (index === -1) return;

        const [card] = this.rewardHand.splice(index, 1);
        if (card) this.rewardDiscard.push(card);
        this.publishPiles();
        this.context.getEventBus().fire('card:discarded', card);
    }

    private onDiscardAll(): void {
        if (this.rewardHand.length === 0) return;

        this.rewardDiscard.push(...this.rewardHand);
        this.rewardHand = [];
        this.publishPiles();
        this.context.getEventBus().fire('card:discardedAll');
    }

    private drawQuestions(count: number): QuestionCard[] {
        return this.drawFromDeck(this.questionDeck, this.questionDiscard, this.questionPool, count);
    }

    private drawRewards(count: number): (BuffCard | WeaponCard)[] {
        return this.drawFromDeck(this.rewardDeck, this.rewardDiscard, this.rewardPool, count);
    }

    private drawFromDeck<T extends Card>(deck: T[], discard: T[], pool: T[], count: number): T[] {
        const requested = Math.max(0, Math.floor(count));
        if (requested === 0) return [];

        const result: T[] = [];
        const usedIds = new Set<string>();

        while (result.length < requested) {
            if (deck.length === 0) {
                if (discard.length > 0) {
                    this.shuffleInPlace(discard);
                    deck.push(...discard.splice(0));
                } else if (pool.length > 0) {
                    deck.push(...this.shuffleCopy(pool));
                } else {
                    break;
                }
            }

            const card = deck.pop();
            if (!card) break;

            if (usedIds.has(card.id)) {
                continue;
            }

            usedIds.add(card.id);
            result.push(card);
        }

        if (result.length < requested && pool.length > 0) {
            const candidates = pool.filter(c => !usedIds.has(c.id));
            while (result.length < requested && candidates.length > 0) {
                const idx = Math.floor(Math.random() * candidates.length);
                const [picked] = candidates.splice(idx, 1);
                if (!picked) break;

                usedIds.add(picked.id);
                result.push(picked);
            }
        }

        return result;
    }

    private publishPiles(): void {
        const eventBus = this.context.getEventBus();
        eventBus.fire('card:piles', {
            questionDeck: this.questionDeck.length,
            questionDiscard: this.questionDiscard.length,
            rewardDeck: this.rewardDeck.length,
            rewardDiscard: this.rewardDiscard.length,
            rewardHand: this.rewardHand.length,
            ownedRewards: this.ownedRewards.length
        });
        eventBus.fire('card:hand', [...this.rewardHand]);
        eventBus.fire('card:owned', [...this.ownedRewards]);
    }

    private shuffleCopy<T>(source: T[]): T[] {
        const copy = [...source];
        this.shuffleInPlace(copy);
        return copy;
    }

    private shuffleInPlace<T>(array: T[]): void {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
}
