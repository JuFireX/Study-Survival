import { Card, CardRarity, CardType, QuestionCard, BuffCard, WeaponCard } from '../../config/types';

// 定义卡牌面类型
export enum CardFaceState {
    Front,
    Back
}

// 稀有度权重映射
export const RarityWeight: Record<CardRarity, number> = {
    [CardRarity.Common]: 1,
    [CardRarity.Rare]: 2,
    [CardRarity.Epic]: 3,
    [CardRarity.Legendary]: 4
};

// 稀有度颜色映射
export const RarityColor: Record<CardRarity, string> = {
    [CardRarity.Common]: '#a0a0a0', // Grey
    [CardRarity.Rare]: '#1e90ff',   // Blue
    [CardRarity.Epic]: '#9400d3',   // Purple
    [CardRarity.Legendary]: '#ffd700' // Gold
};

export interface CardPair {
    id: string; // 组合ID (通常用 reward card id)
    front: Card;
    back: Card;
    isQuestionFront: boolean; // 是否问题卡在正面
    isAnswered: boolean; // 是否已回答
    answerState: 'unanswered' | 'correct' | 'wrong';
    isDiscarded: boolean; // 是否已弃置
    isSelected: boolean; // 是否已选择
    currentFace: CardFaceState; // 当前朝向
}

/**
 * 卡牌选择 UI 组件 (CardSelectComponent)
 * 
 * 职责:
 * 1. 渲染三张可翻转的 3D 卡牌。
 * 2. 处理卡牌的翻转、按钮点击交互。
 * 3. 渲染题目内容和选项。
 */
export class CardSelectComponent {
    private container: HTMLElement;
    private cardsContainer: HTMLElement;
    private cardElements: Map<string, HTMLElement> = new Map(); // pairId -> card element

    // 回调
    public onFlip: ((pairId: string) => void) | null = null;
    public onDiscard: ((pairId: string) => void) | null = null;
    public onSelect: ((pairId: string) => void) | null = null;
    public onAnswer: ((pairId: string, answer: number | string) => void) | null = null;

    constructor() {
        this.container = document.createElement('div');
        this.container.id = 'card-select-overlay';
        this.container.style.position = 'absolute';
        this.container.style.top = '0';
        this.container.style.left = '0';
        this.container.style.width = '100%';
        this.container.style.height = '100%';
        this.container.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        this.container.style.display = 'none'; // 默认隐藏
        this.container.style.zIndex = '200';
        this.container.style.flexDirection = 'column';
        this.container.style.alignItems = 'center';
        this.container.style.justifyContent = 'center';

        // 标题
        const title = document.createElement('h2');
        title.innerText = 'Choose Your Reward';
        title.style.color = '#fff';
        title.style.marginBottom = '5vmin';
        title.style.fontFamily = 'Arial, sans-serif';
        title.style.textShadow = '0 0 10px rgba(255, 255, 255, 0.5)';
        this.container.appendChild(title);

        // 卡牌容器
        this.cardsContainer = document.createElement('div');
        this.cardsContainer.style.display = 'flex';
        this.cardsContainer.style.gap = '5vmin';
        this.cardsContainer.style.perspective = '1000px'; // 3D 透视
        this.cardsContainer.style.flexWrap = 'wrap';
        this.cardsContainer.style.justifyContent = 'center';
        this.cardsContainer.style.maxWidth = '95vw';
        this.cardsContainer.style.padding = '0 2vmin';
        this.cardsContainer.style.boxSizing = 'border-box';
        this.container.appendChild(this.cardsContainer);

        document.body.appendChild(this.container);
    }

    public show(pairs: CardPair[]) {
        this.cardsContainer.innerHTML = '';
        this.cardElements.clear();

        pairs.forEach(pair => {
            const cardEl = this.createCardElement(pair);
            this.cardsContainer.appendChild(cardEl);
            this.cardElements.set(pair.id, cardEl);
        });

        this.container.style.display = 'flex';
    }

    public hide() {
        this.container.style.display = 'none';
    }

    public updateCardState(pair: CardPair) {
        const cardEl = this.cardElements.get(pair.id);
        if (!cardEl) return;

        const inner = cardEl.querySelector('.card-inner') as HTMLElement;
        const frontFace = inner.querySelector('.card-front') as HTMLElement;
        const backFace = inner.querySelector('.card-back') as HTMLElement;

        // 1. 处理翻转
        if (pair.currentFace === CardFaceState.Back) {
            inner.style.transform = 'rotateY(180deg)';
        } else {
            inner.style.transform = 'rotateY(0deg)';
        }

        // 2. 更新按钮状态
        this.updateButtons(pair, frontFace, true); // Front is front
        this.updateButtons(pair, backFace, false); // Back is back

        // 3. 弃置/选择状态视效
        if (pair.isDiscarded) {
            cardEl.style.opacity = '0.5';
            cardEl.style.filter = 'grayscale(100%)';
            cardEl.style.boxShadow = 'none';
        } else if (pair.isSelected) {
            cardEl.style.opacity = '1';
            cardEl.style.filter = 'none';
            cardEl.style.boxShadow = '0 0 2vmin rgba(76, 175, 80, 0.8)';
        } else {
            cardEl.style.opacity = '1';
            cardEl.style.filter = 'none';
            cardEl.style.boxShadow = 'none';
        }

        // 4. 如果是问题卡且未回答，可能需要更新题目状态（例如答错显示错误，答对显示正确）
        // 这里简化：重新渲染内容比较复杂，假设内容已经在 create 时渲染好，或者通过特定方法更新
    }

    private createCardElement(pair: CardPair): HTMLElement {
        const wrapper = document.createElement('div');
        wrapper.className = 'card-wrapper';
        wrapper.style.width = '32vmin';
        wrapper.style.height = '50vmin';
        wrapper.style.position = 'relative';

        const inner = document.createElement('div');
        inner.className = 'card-inner';
        inner.style.width = '100%';
        inner.style.height = '100%';
        inner.style.position = 'relative';
        inner.style.transformStyle = 'preserve-3d';
        inner.style.transition = 'transform 0.6s';

        // Set initial transform based on currentFace
        if (pair.currentFace === CardFaceState.Back) {
            inner.style.transform = 'rotateY(180deg)';
        }

        wrapper.appendChild(inner);

        // 创建正反面
        // 注意：逻辑上的 Front 和 Back 对应 CardPair 的 front/back 属性
        // 但在 DOM 结构中，inner 的 children[0] 是视觉正面 (0deg)，children[1] 是视觉背面 (180deg)

        const visualFront = this.createFace(pair, pair.front, true);
        const visualBack = this.createFace(pair, pair.back, false);
        visualBack.style.transform = 'rotateY(180deg)';

        inner.appendChild(visualFront);
        inner.appendChild(visualBack);

        // 初始化状态
        this.updateButtons(pair, visualFront, true);
        this.updateButtons(pair, visualBack, false);

        return wrapper;
    }

    private createFace(pair: CardPair, card: Card, isVisualFront: boolean): HTMLElement {
        const face = document.createElement('div');
        if (isVisualFront) {
            face.className = 'card-front';
        } else {
            face.className = 'card-back';
        }

        // 基础样式
        face.style.position = 'absolute';
        face.style.width = '100%';
        face.style.height = '100%';
        face.style.backfaceVisibility = 'hidden'; // 关键：隐藏背面
        face.style.borderRadius = '1vmin';
        face.style.backgroundColor = '#222';
        face.style.border = `0.3vmin solid ${RarityColor[card.rarity]}`;
        face.style.boxShadow = `0 0 2vmin ${RarityColor[card.rarity]}`; // 辉光
        face.style.display = 'flex';
        face.style.flexDirection = 'column';
        face.style.padding = '1vmin';
        face.style.boxSizing = 'border-box';
        face.style.overflow = 'hidden';

        // 内容区域
        const content = document.createElement('div');
        content.style.flex = '1';
        content.style.display = 'flex';
        content.style.flexDirection = 'column';
        content.style.alignItems = 'center';
        content.style.color = '#fff';

        // 渲染卡牌内容
        this.renderCardContent(content, card, pair);
        face.appendChild(content);

        // 按钮区域
        const btnGroup = document.createElement('div');
        btnGroup.style.height = '5vmin';
        btnGroup.style.display = 'flex';
        btnGroup.style.justifyContent = 'space-around';
        btnGroup.style.alignItems = 'center';
        btnGroup.style.marginTop = '1vmin';

        // 翻转按钮
        const flipBtn = this.createButton('↻', '#2196f3', () => {
            if (this.onFlip) this.onFlip(pair.id);
        });
        flipBtn.classList.add('btn-flip');

        // 弃置按钮
        const discardBtn = this.createButton('✕', '#f44336', () => {
            if (this.onDiscard) this.onDiscard(pair.id);
        });
        discardBtn.classList.add('btn-discard');

        // 选择按钮
        const selectBtn = this.createButton('✓', '#4caf50', () => {
            if (this.onSelect) this.onSelect(pair.id);
        });
        selectBtn.classList.add('btn-select');

        btnGroup.appendChild(flipBtn);
        btnGroup.appendChild(discardBtn);
        btnGroup.appendChild(selectBtn);

        face.appendChild(btnGroup);

        return face;
    }

    private renderCardContent(container: HTMLElement, card: Card, pair: CardPair) {
        const typeLabel = document.createElement('div');
        typeLabel.innerText = card.type.toUpperCase();
        typeLabel.style.fontSize = '1.7vmin';
        typeLabel.style.color = RarityColor[card.rarity];
        typeLabel.style.marginBottom = '1vmin';
        container.appendChild(typeLabel);

        if (card.type === CardType.Question) {
            this.renderQuestionCard(container, card as QuestionCard, pair);
            return;
        }

        if (card.type === CardType.Buff) {
            this.renderBuffCard(container, card as BuffCard);
            return;
        }

        if (card.type === CardType.Weapon) {
            this.renderWeaponCard(container, card as WeaponCard);
        }
    }

    private renderQuestionCard(container: HTMLElement, qCard: QuestionCard, pair: CardPair) {
        const qText = document.createElement('div');
        qText.innerText = qCard.question.text;
        qText.style.fontSize = '2.0vmin';
        qText.style.textAlign = 'center';
        qText.style.marginBottom = '2vmin';
        container.appendChild(qText);

        if (!pair.isAnswered) {
            const optionsContainer = document.createElement('div');
            optionsContainer.style.display = 'flex';
            optionsContainer.style.flexDirection = 'column';
            optionsContainer.style.gap = '1vmin';
            optionsContainer.style.width = '100%';

            if (qCard.question.type === 'fill' || !qCard.question.options) {
                const input = document.createElement('input');
                input.type = 'text';
                input.placeholder = '请输入答案';
                input.style.padding = '0.8vmin';
                input.style.fontSize = '1.8vmin';
                input.style.borderRadius = '0.5vmin';
                input.style.border = '0.2vmin solid rgba(255,255,255,0.3)';
                input.style.background = 'rgba(0,0,0,0.2)';
                input.style.color = '#fff';
                input.style.outline = 'none';

                const submit = document.createElement('button');
                submit.innerText = '提交';
                submit.style.padding = '0.7vmin';
                submit.style.fontSize = '1.8vmin';
                submit.style.cursor = 'pointer';

                const submitAnswer = (e: Event) => {
                    e.stopPropagation();
                    const value = input.value;
                    if (this.onAnswer) this.onAnswer(pair.id, value);
                };

                submit.onclick = submitAnswer;
                input.onkeydown = (e) => {
                    if (e.key === 'Enter') submitAnswer(e);
                };

                optionsContainer.appendChild(input);
                optionsContainer.appendChild(submit);
            } else {
                qCard.question.options.forEach((opt, idx) => {
                    const optBtn = document.createElement('button');
                    optBtn.innerText = opt;
                    optBtn.style.padding = '0.5vmin';
                    optBtn.style.fontSize = '1.7vmin';
                    optBtn.style.cursor = 'pointer';
                    optBtn.onclick = (e) => {
                        e.stopPropagation();
                        if (this.onAnswer) this.onAnswer(pair.id, idx);
                    };
                    optionsContainer.appendChild(optBtn);
                });
            }

            container.appendChild(optionsContainer);
            return;
        }

        const resultGroup = document.createElement('div');
        resultGroup.style.width = '100%';
        resultGroup.style.display = 'flex';
        resultGroup.style.flexDirection = 'column';
        resultGroup.style.alignItems = 'flex-start';
        resultGroup.style.boxSizing = 'border-box';
        resultGroup.style.paddingLeft = '1.2vmin';
        resultGroup.style.gap = '0.8vmin';
        resultGroup.style.marginTop = 'auto';
        resultGroup.style.marginBottom = 'auto';

        const result = document.createElement('div');
        const isWrong = pair.answerState === 'wrong';
        result.innerText = isWrong ? 'WRONG' : 'SOLVED';
        result.style.fontSize = '3.2vmin';
        result.style.color = isWrong ? '#f44336' : '#4caf50';
        result.style.fontWeight = 'bold';
        result.style.textAlign = 'left';
        resultGroup.appendChild(result);

        const answerLine = document.createElement('div');
        const standardAnswer = this.getStandardAnswerText(qCard);
        answerLine.innerText = `答案：${standardAnswer || '（未配置）'}`;
        answerLine.style.fontSize = '1.7vmin';
        answerLine.style.color = 'rgba(255,255,255,0.55)';
        answerLine.style.lineHeight = '1.3';
        answerLine.style.whiteSpace = 'pre-wrap';
        answerLine.style.wordBreak = 'break-word';
        answerLine.style.paddingLeft = '1.2vmin';
        answerLine.style.boxSizing = 'border-box';
        resultGroup.appendChild(answerLine);

        container.appendChild(resultGroup);
    }

    private getStandardAnswerText(qCard: QuestionCard): string {
        if (qCard.question.type === 'fill' || !qCard.question.options) {
            return typeof qCard.question.answer === 'string' ? qCard.question.answer : '';
        }

        if (qCard.question.options) {
            const correct = qCard.question.correct;
            if (typeof correct === 'number') {
                const optionText = qCard.question.options[correct] ?? '';
                return optionText || `选项 ${correct + 1}`;
            }

            if (Array.isArray(correct) && correct.length > 0) {
                const texts = correct
                    .map(i => qCard.question.options?.[i])
                    .filter((v): v is string => typeof v === 'string' && v.length > 0);
                return texts.length > 0 ? texts.join(' / ') : correct.map(i => `选项 ${i + 1}`).join(' / ');
            }
        }

        return '';
    }

    private renderBuffCard(container: HTMLElement, bCard: BuffCard) {
        const name = document.createElement('div');
        name.innerText = bCard.name;
        name.style.fontSize = '2.2vmin';
        name.style.fontWeight = 'bold';
        name.style.marginBottom = '1vmin';
        container.appendChild(name);

        const desc = document.createElement('div');
        desc.innerText = bCard.description;
        desc.style.fontSize = '1.7vmin';
        desc.style.textAlign = 'center';
        container.appendChild(desc);
    }

    private renderWeaponCard(container: HTMLElement, wCard: WeaponCard) {
        const name = document.createElement('div');
        name.innerText = wCard.name;
        name.style.fontSize = '2vmin';
        name.style.fontWeight = 'bold';
        name.style.marginBottom = '1vmin';
        container.appendChild(name);

        const desc = document.createElement('div');
        desc.innerText = wCard.description;
        desc.style.fontSize = '1.5vmin';
        desc.style.textAlign = 'center';
        container.appendChild(desc);

        const stats = document.createElement('div');
        stats.innerText = `DMG: ${wCard.stats.damage}`;
        stats.style.fontSize = '1.4vmin';
        stats.style.marginTop = '1vmin';
        stats.style.color = '#ccc';
        container.appendChild(stats);
    }

    private createButton(text: string, color: string, onClick: () => void): HTMLElement {
        const btn = document.createElement('div');
        btn.innerText = text;
        btn.style.width = '4vmin';
        btn.style.height = '4vmin';
        btn.style.borderRadius = '0.5vmin';
        btn.style.backgroundColor = color;
        btn.style.color = '#fff';
        btn.style.display = 'flex';
        btn.style.alignItems = 'center';
        btn.style.justifyContent = 'center';
        btn.style.fontSize = '2vmin';
        btn.style.cursor = 'pointer';
        btn.style.userSelect = 'none';
        btn.style.boxShadow = '0 0.2vmin 0.5vmin rgba(0,0,0,0.5)';

        btn.onclick = (e) => {
            e.stopPropagation();
            // 简单的点击动画
            btn.style.transform = 'scale(0.95)';
            setTimeout(() => btn.style.transform = 'scale(1)', 100);
            onClick();
        };

        return btn;
    }

    private updateButtons(pair: CardPair, face: HTMLElement, isVisualFront: boolean) {
        const card = isVisualFront ? pair.front : pair.back;
        const isCurrentFace = (isVisualFront && pair.currentFace === CardFaceState.Front) ||
            (!isVisualFront && pair.currentFace === CardFaceState.Back);

        const btnFlip = face.querySelector('.btn-flip') as HTMLElement;
        const btnDiscard = face.querySelector('.btn-discard') as HTMLElement;
        const btnSelect = face.querySelector('.btn-select') as HTMLElement;

        if (pair.isDiscarded || pair.isSelected) {
            this.setButtonEnabled(btnFlip, false);
            this.setButtonEnabled(btnDiscard, false);
            this.setButtonEnabled(btnSelect, false);
            return;
        }

        this.setButtonEnabled(btnFlip, true);
        this.setButtonEnabled(btnDiscard, true);
        this.setButtonEnabled(btnSelect, true);

        if (pair.isAnswered && pair.answerState === 'wrong') {
            this.setButtonEnabled(btnSelect, false);
        }

        if (isCurrentFace && !pair.isAnswered) {
            if (card.type === CardType.Question) {
                this.setButtonEnabled(btnFlip, false);
                this.setButtonEnabled(btnSelect, false);
            } else {
                this.setButtonEnabled(btnSelect, false);
            }
        }
    }

    private setButtonEnabled(btn: HTMLElement, enabled: boolean) {
        if (enabled) {
            btn.style.pointerEvents = 'auto';
            btn.style.opacity = '1';
            btn.style.filter = 'none';
        } else {
            btn.style.pointerEvents = 'none';
            btn.style.opacity = '0.5';
            btn.style.filter = 'grayscale(100%)';
        }
    }

    public destroy() {
        this.container.remove();
    }
}
