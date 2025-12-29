import { CardType, QuestionCard, BuffCard, WeaponCard } from '../config/types';
import { CardSelectComponent, CardPair, CardFaceState, RarityWeight } from './components/CardSelectComponent';

/**
 * 卡牌选择管理器 (CardSelect)
 * 
 * 职责:
 * 1. 接收原始卡牌数据。
 * 2. 执行配对算法 (核心逻辑)。
 * 3. 管理 UI 组件的状态。
 * 4. 返回用户选择的结果。
 */
export class CardSelect {
    private component: CardSelectComponent;
    private pairs: CardPair[] = [];
    private onCompleted: ((selectedCardIds: string[]) => void) | null = null;

    constructor() {
        this.component = new CardSelectComponent();

        // 绑定组件事件
        this.component.onFlip = this.handleFlip.bind(this);
        this.component.onDiscard = this.handleDiscard.bind(this);
        this.component.onSelect = this.handleSelect.bind(this);
        this.component.onAnswer = this.handleAnswer.bind(this);
    }

    /**
     * 开始选择流程
     * @param questions 3张问题卡
     * @param rewards 3张增益/武器卡
     * @param callback 完成回调
     */
    public start(questions: QuestionCard[], rewards: (BuffCard | WeaponCard)[], callback: (selectedCardIds: string[]) => void) {
        this.onCompleted = callback;
        this.pairs = this.pairCards(questions, rewards);

        const questionFrontPairs = this.pairs.filter(p => p.front.type === CardType.Question);
        if (questionFrontPairs.length > 0 && questionFrontPairs.length < this.pairs.length) {
            const nonQuestionFrontPairs = this.pairs.filter(p => p.front.type !== CardType.Question);
            this.pairs = [...nonQuestionFrontPairs, ...questionFrontPairs];
        }

        this.component.show(this.pairs);
    }

    /**
     * 配对算法
     * 规则:
     * 1. 遍历问题卡，计算概率决定是否为"卡面"。
     * 2. 若为卡面，尝试匹配剩余中稀有度最高的增武卡 (需满足 BW > Q 稀有度)。
     * 3. 剩余卡牌按稀有度低对低、高对高匹配，且问题卡为卡背。
     */
    private pairCards(questions: QuestionCard[], rewards: (BuffCard | WeaponCard)[]): CardPair[] {
        // 1. 排序
        const sortedQ = [...questions].sort((a, b) => RarityWeight[a.rarity] - RarityWeight[b.rarity]);
        const sortedR = [...rewards].sort((a, b) => RarityWeight[a.rarity] - RarityWeight[b.rarity]);

        const pairs: CardPair[] = [];
        const usedQ = new Set<string>();
        const usedR = new Set<string>();

        // 临时辅助：按概率尝试让问题卡做正面
        // 由于没有具体的概率参数，这里假设 50% 概率
        const PROBABILITY_Q_FRONT = 0.5;

        // 2. 第一轮：尝试让问题卡做正面 (盲盒模式)
        // 按照用户描述 "先为每张问题卡计算一个概率"
        // 我们遍历所有问题卡
        for (const q of questions) {
            if (usedQ.has(q.id)) continue;

            if (Math.random() < PROBABILITY_Q_FRONT) {
                // 命中概率，尝试成为卡面
                // 寻找剩余奖励中稀有度最高的
                let bestRIndex = -1;
                for (let i = sortedR.length - 1; i >= 0; i--) {
                    if (!usedR.has(sortedR[i].id)) {
                        bestRIndex = i;
                        break;
                    }
                }

                if (bestRIndex !== -1) {
                    const bestR = sortedR[bestRIndex];
                    // 检查条件：BW稀有度必须 > Q稀有度
                    if (RarityWeight[bestR.rarity] > RarityWeight[q.rarity]) {
                        // 配对成功
                        usedQ.add(q.id);
                        usedR.add(bestR.id);

                        pairs.push({
                            id: bestR.id, // 使用奖励卡ID作为组合ID
                            front: q,
                            back: bestR,
                            isQuestionFront: true,
                            currentFace: CardFaceState.Front, // Q 在正面
                            isAnswered: false,
                            answerState: 'unanswered',
                            isDiscarded: false,
                            isSelected: false
                        });
                    } else {
                        // 稀有度不够，取消做卡面的资格 -> 留给后续兜底逻辑
                    }
                }
            }
        }

        // 3. 第二轮：处理剩余卡牌 (默认逻辑：问题卡做背面，稀有度对应)
        const remainQ = sortedQ.filter(q => !usedQ.has(q.id));
        const remainR = sortedR.filter(r => !usedR.has(r.id));

        // 此时 remainQ 和 remainR 已经是按稀有度排序的
        // 且数量应该相等 (除非输入数据有误)
        const count = Math.min(remainQ.length, remainR.length);
        for (let i = 0; i < count; i++) {
            const q = remainQ[i];
            const r = remainR[i];

            pairs.push({
                id: r.id,
                front: r,
                back: q,
                isQuestionFront: false,
                currentFace: CardFaceState.Front, // R 在正面
                isAnswered: false,
                answerState: 'unanswered',
                isDiscarded: false,
                isSelected: false
            });
        }

        return pairs;
    }

    private tryFinalize() {
        if (this.pairs.length === 0) return;
        if (!this.pairs.every(p => p.isDiscarded || p.isSelected)) return;

        const selectedIds = this.pairs.filter(p => p.isSelected).map(p => p.id);
        const callback = this.onCompleted;
        this.onCompleted = null;

        this.component.hide();
        if (callback) {
            callback(selectedIds);
        }
    }

    private handleFlip(pairId: string) {
        const pair = this.pairs.find(p => p.id === pairId);
        if (!pair || pair.isDiscarded) return;

        // 规则校验已经在 Component 中通过 updateButtons 做了一部分 UI 禁用
        // 这里做逻辑校验
        // 规则 2: 如果该卡为问题卡卡面, 在回答问题前禁用其翻转功能
        const currentCard = pair.currentFace === CardFaceState.Front ? pair.front : pair.back;
        if (currentCard.type === CardType.Question && !pair.isAnswered) {
            console.warn("Cannot flip unsolved question card!");
            return;
        }

        // 执行翻转
        pair.currentFace = pair.currentFace === CardFaceState.Front ? CardFaceState.Back : CardFaceState.Front;
        this.component.updateCardState(pair);
    }

    private handleDiscard(pairId: string) {
        const pair = this.pairs.find(p => p.id === pairId);
        if (!pair || pair.isDiscarded || pair.isSelected) return;

        pair.isDiscarded = true;
        this.component.updateCardState(pair);

        this.tryFinalize();
    }

    private handleSelect(pairId: string) {
        const pair = this.pairs.find(p => p.id === pairId);
        if (!pair || pair.isDiscarded || pair.isSelected) return;

        const currentCard = pair.currentFace === CardFaceState.Front ? pair.front : pair.back;
        if (currentCard.type !== CardType.Question && !pair.isAnswered) {
            console.warn("Cannot select reward before solving question!");
            return;
        }

        pair.isSelected = true;
        this.component.updateCardState(pair);

        this.tryFinalize();
    }

    private handleAnswer(pairId: string, answer: number | string) {
        const pair = this.pairs.find(p => p.id === pairId);
        if (!pair || pair.isAnswered || pair.isDiscarded || pair.isSelected) return;

        const qCard = (pair.front.type === CardType.Question ? pair.front : pair.back) as QuestionCard;

        let isCorrect = false;

        if (typeof answer === 'number') {
            const correct = qCard.question.correct;
            if (typeof correct === 'number') {
                isCorrect = correct === answer;
            } else if (Array.isArray(correct)) {
                isCorrect = correct.includes(answer);
            }
        } else {
            const rawInput = answer;
            const input = typeof rawInput === 'string' ? rawInput.trim().toLowerCase() : '';
            const expectedRaw = qCard.question.answer;

            if (input.length > 0 && typeof expectedRaw === 'string') {
                const candidates = expectedRaw
                    .split(/[\|\/;,，]/g)
                    .map(s => s.trim().toLowerCase())
                    .filter(Boolean);

                isCorrect = candidates.length > 0 ? candidates.includes(input) : expectedRaw.trim().toLowerCase() === input;
            }
        }

        pair.isAnswered = true;
        pair.answerState = isCorrect ? 'correct' : 'wrong';

        this.component.show(this.pairs);
    }

    public destroy() {
        this.component.destroy();
    }
}
