import { Card, CardRarity, CardType, QuestionCard, BuffCard, WeaponCard } from '../config/types';
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
    private onCompleted: ((selectedCardId: string) => void) | null = null;

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
    public start(questions: QuestionCard[], rewards: (BuffCard | WeaponCard)[], callback: (selectedCardId: string) => void) {
        this.onCompleted = callback;
        this.pairs = this.pairCards(questions, rewards);
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
                            isDiscarded: false
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
                isDiscarded: false
            });
        }

        return pairs;
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
        if (!pair || pair.isDiscarded) return;

        pair.isDiscarded = true;
        this.component.updateCardState(pair);
    }

    private handleSelect(pairId: string) {
        const pair = this.pairs.find(p => p.id === pairId);
        if (!pair || pair.isDiscarded) return;

        // 规则 3: 如果该卡为其他卡卡面 (BW), 在回答问题前禁用其选择功能
        const currentCard = pair.currentFace === CardFaceState.Front ? pair.front : pair.back;
        if (currentCard.type !== CardType.Question && !pair.isAnswered) {
            console.warn("Cannot select reward before solving question!");
            return;
        }

        // 提交选择
        if (this.onCompleted) {
            this.component.hide();
            this.onCompleted(pair.id);
        }
    }

    private handleAnswer(pairId: string, optionIndex: number) {
        const pair = this.pairs.find(p => p.id === pairId);
        if (!pair || pair.isAnswered || pair.isDiscarded) return;

        // 获取问题卡
        // 无论是 Front 还是 Back，找到是 Question 的那张
        const qCard = (pair.front.type === CardType.Question ? pair.front : pair.back) as QuestionCard;

        // 校验答案
        // 简化：假设 correct 是数字索引
        const correct = qCard.question.correct;
        let isCorrect = false;

        if (typeof correct === 'number') {
            isCorrect = correct === optionIndex;
        } else if (Array.isArray(correct)) {
            isCorrect = correct.includes(optionIndex);
        }

        if (isCorrect) {
            pair.isAnswered = true;
            // 答对后，更新 UI (显示 SOLVED，解锁按钮)
            // 重新渲染该卡片的内容需要 Component 支持局部更新，或者全量 updateCardState 触发
            // 由于 Component 中 renderCardContent 是在 create 时调用的，我们需要刷新 DOM
            // 简单起见，调用 show 刷新所有 (或者优化 Component 增加 refresh 方法)
            this.component.show(this.pairs);
        } else {
            // 答错逻辑：可能扣血、或者该卡直接销毁？需求没提。
            // 暂时 log
            console.log("Wrong answer!");
            // 也许可以加个震动反馈
        }
    }

    public destroy() {
        this.component.destroy();
    }
}
