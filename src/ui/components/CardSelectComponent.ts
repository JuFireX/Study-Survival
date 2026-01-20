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
        title.style.fontSize = '5vmin';
        title.style.marginBottom = '3vmin';
        title.style.fontFamily = 'Arial, sans-serif';
        title.style.textShadow = '0 0 10px rgba(255, 255, 255, 0.5)';
        this.container.appendChild(title);

        // 卡牌容器
        this.cardsContainer = document.createElement('div');
        this.cardsContainer.style.display = 'flex';
        this.cardsContainer.style.gap = '6vmin';
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
        wrapper.style.width = '28vmin';
        wrapper.style.height = '45vmin';
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
        face.style.backgroundColor = '#333'; // 深灰色背景
        face.style.border = `0.2vmin solid ${RarityColor[card.rarity]}`;
        // face.style.boxShadow = `0 0 1vmin ${RarityColor[card.rarity]}`; // 减弱辉光
        face.style.display = 'flex';
        face.style.flexDirection = 'column';
        face.style.padding = '2vmin';
        face.style.boxSizing = 'border-box';
        face.style.overflow = 'hidden';
        face.style.gap = '1.5vmin'; // 元素间距

        // 顶部 Header: 类型 + 名称
        const header = document.createElement('div');
        header.style.display = 'flex';
        header.style.flexDirection = 'column';
        header.style.alignItems = 'center';
        header.style.marginBottom = '1vmin';

        // 类型标签
        const typeLabel = document.createElement('div');
        typeLabel.innerText = card.type.toUpperCase();
        typeLabel.style.fontSize = '2vmin';
        typeLabel.style.color = '#fff';
        typeLabel.style.opacity = '0.8';
        typeLabel.style.marginBottom = '0.5vmin';
        header.appendChild(typeLabel);

        // 名称
        const nameLabel = document.createElement('div');
        nameLabel.style.fontSize = '3.5vmin';
        nameLabel.style.fontWeight = 'bold';
        nameLabel.style.color = '#fff';
        if (card.type === CardType.Buff) nameLabel.innerText = (card as BuffCard).name;
        else if (card.type === CardType.Weapon) nameLabel.innerText = (card as WeaponCard).name;
        else if (card.type === CardType.Question) nameLabel.innerText = (card as QuestionCard).question.subject || '题目科目'; // 假设有 subject 字段，或者默认
        header.appendChild(nameLabel);

        face.appendChild(header);

        // 内容块 1: 描述/题干
        const contentBlock1 = document.createElement('div');
        contentBlock1.style.flex = '1';
        contentBlock1.style.backgroundColor = '#555'; // 浅一点的灰
        contentBlock1.style.borderRadius = '1vmin';
        contentBlock1.style.padding = '1.5vmin';
        contentBlock1.style.color = '#fff';
        contentBlock1.style.display = 'flex';
        contentBlock1.style.flexDirection = 'column';
        // contentBlock1.style.justifyContent = 'center'; // 垂直居中还是顶部对齐？看图是顶部
        contentBlock1.style.overflowY = 'auto';

        // 内容块 2: 详情/答案区
        const contentBlock2 = document.createElement('div');
        contentBlock2.style.flex = '1';
        contentBlock2.style.backgroundColor = '#555';
        contentBlock2.style.borderRadius = '1vmin';
        contentBlock2.style.padding = '1.5vmin';
        contentBlock2.style.color = '#fff';
        contentBlock2.style.display = 'flex';
        contentBlock2.style.flexDirection = 'column';
        contentBlock2.style.overflowY = 'auto';

        // 渲染卡牌内容到两个块中
        this.renderCardContentBlocks(contentBlock1, contentBlock2, card, pair);

        face.appendChild(contentBlock1);
        face.appendChild(contentBlock2);

        // 按钮区域
        const btnGroup = document.createElement('div');
        btnGroup.style.height = '6vmin';
        btnGroup.style.display = 'flex';
        btnGroup.style.justifyContent = 'space-around'; // 均匀分布
        btnGroup.style.alignItems = 'center';
        btnGroup.style.marginTop = '1vmin';
        btnGroup.style.gap = '2vmin'; // 按钮间距

        // 翻转按钮
        const flipBtn = this.createButton('', '#2196f3', () => { // 图标用 CSS 或 SVG 更好，这里暂空
            if (this.onFlip) this.onFlip(pair.id);
        });
        flipBtn.classList.add('btn-flip');
        // 添加简单图标
        flipBtn.innerHTML = '<span style="font-size: 3vmin">↻</span>';

        // 弃置按钮
        const discardBtn = this.createButton('', '#f44336', () => {
            if (this.onDiscard) this.onDiscard(pair.id);
        });
        discardBtn.classList.add('btn-discard');
        discardBtn.innerHTML = '<span style="font-size: 3vmin">✕</span>';

        // 选择按钮
        const selectBtn = this.createButton('', '#4caf50', () => {
            if (this.onSelect) this.onSelect(pair.id);
        });
        selectBtn.classList.add('btn-select');
        selectBtn.innerHTML = '<span style="font-size: 3vmin">✓</span>';

        btnGroup.appendChild(flipBtn);
        btnGroup.appendChild(discardBtn);
        btnGroup.appendChild(selectBtn);

        face.appendChild(btnGroup);

        return face;
    }

    private renderCardContentBlocks(block1: HTMLElement, block2: HTMLElement, card: Card, pair: CardPair) {
        if (card.type === CardType.Question) {
            const qCard = card as QuestionCard;

            // Block 1: 题干
            const qText = document.createElement('div');
            qText.innerText = qCard.question.text;
            qText.style.fontSize = '2.5vmin';
            qText.style.lineHeight = '1.4';
            block1.appendChild(qText);

            // Block 2: 答题区
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
                    input.style.padding = '1vmin';
                    input.style.fontSize = '2vmin';
                    input.style.borderRadius = '0.5vmin';
                    input.style.border = 'none';
                    input.style.background = 'rgba(0,0,0,0.3)';
                    input.style.color = '#fff';
                    input.style.outline = 'none';
                    input.style.marginBottom = '1vmin';

                    const submit = document.createElement('button');
                    submit.innerText = '提交';
                    submit.style.padding = '1vmin';
                    submit.style.fontSize = '2vmin';
                    submit.style.cursor = 'pointer';
                    submit.style.border = 'none';
                    submit.style.borderRadius = '0.5vmin';
                    submit.style.backgroundColor = '#ddd';
                    submit.style.color = '#333';

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
                        optBtn.style.padding = '1vmin';
                        optBtn.style.fontSize = '2vmin';
                        optBtn.style.cursor = 'pointer';
                        optBtn.style.border = 'none';
                        optBtn.style.borderRadius = '0.5vmin';
                        optBtn.style.backgroundColor = 'rgba(0,0,0,0.3)';
                        optBtn.style.color = '#fff';
                        optBtn.style.textAlign = 'left';

                        optBtn.onclick = (e) => {
                            e.stopPropagation();
                            if (this.onAnswer) this.onAnswer(pair.id, idx);
                        };
                        optionsContainer.appendChild(optBtn);
                    });
                }
                block2.appendChild(optionsContainer);
            } else {
                // 已回答，显示结果
                const result = document.createElement('div');
                const isWrong = pair.answerState === 'wrong';
                result.innerText = isWrong ? 'WRONG' : 'SOLVED';
                result.style.fontSize = '3.5vmin';
                result.style.color = isWrong ? '#f44336' : '#4caf50';
                result.style.fontWeight = 'bold';
                result.style.marginBottom = '1vmin';
                block2.appendChild(result);

                let standardAnswer = '';
                if (qCard.question.type === 'fill' || !qCard.question.options) {
                    if (typeof qCard.question.answer === 'string') {
                        standardAnswer = qCard.question.answer;
                    }
                } else if (qCard.question.options) {
                    const correct = qCard.question.correct;
                    if (typeof correct === 'number') {
                        standardAnswer = qCard.question.options[correct] ?? '';
                        if (!standardAnswer) standardAnswer = `选项 ${correct + 1}`;
                    } else if (Array.isArray(correct) && correct.length > 0) {
                        const texts = correct
                            .map(i => qCard.question.options?.[i])
                            .filter((v): v is string => typeof v === 'string' && v.length > 0);
                        standardAnswer = texts.length > 0 ? texts.join(' / ') : correct.map(i => `选项 ${i + 1}`).join(' / ');
                    }
                }

                const answerLine = document.createElement('div');
                answerLine.innerText = `答案：${standardAnswer || '（未配置）'}`;
                answerLine.style.fontSize = '2vmin';
                answerLine.style.color = 'rgba(255,255,255,0.7)';
                block2.appendChild(answerLine);
            }

        } else if (card.type === CardType.Buff) {
            const bCard = card as BuffCard;

            // Block 1: 描述
            const desc = document.createElement('div');
            desc.innerText = bCard.description;
            desc.style.fontSize = '2.5vmin';
            desc.style.lineHeight = '1.4';
            block1.appendChild(desc);

            // Block 2: 详细信息/挂载点
            const detail = document.createElement('div');
            detail.innerText = '挂载点: 玩家属性\n数值详细信息...'; // 占位
            detail.style.fontSize = '2vmin';
            detail.style.color = '#ccc';
            block2.appendChild(detail);

        } else if (card.type === CardType.Weapon) {
            const wCard = card as WeaponCard;

            // Block 1: 描述
            const desc = document.createElement('div');
            desc.innerText = wCard.description;
            desc.style.fontSize = '2.5vmin';
            desc.style.lineHeight = '1.4';
            block1.appendChild(desc);

            // Block 2: 详细信息
            const stats = document.createElement('div');
            stats.innerText = `挂载点: 武器槽\nDMG: ${wCard.stats.damage}\nRange: ${wCard.stats.range}`;
            stats.style.fontSize = '2vmin';
            stats.style.color = '#ccc';
            stats.style.whiteSpace = 'pre-wrap';
            block2.appendChild(stats);
        }
    }

    private createButton(text: string, color: string, onClick: () => void): HTMLElement {
        const btn = document.createElement('div');
        btn.innerText = text;
        btn.style.width = '6vmin'; // 方形按钮
        btn.style.height = '6vmin';
        btn.style.borderRadius = '1vmin';
        btn.style.backgroundColor = '#555'; // 按钮背景统一深灰，图标带色？或者保持原色
        // 根据图示，按钮是有颜色的方块
        btn.style.backgroundColor = color;

        btn.style.color = '#fff';
        btn.style.display = 'flex';
        btn.style.alignItems = 'center';
        btn.style.justifyContent = 'center';
        btn.style.cursor = 'pointer';
        btn.style.userSelect = 'none';
        // btn.style.boxShadow = '0 0.2vmin 0.5vmin rgba(0,0,0,0.5)';

        btn.onclick = (e) => {
            e.stopPropagation();
            btn.style.transform = 'scale(0.95)';
            setTimeout(() => btn.style.transform = 'scale(1)', 100);
            onClick();
        };

        return btn;
    }

    private updateButtons(pair: CardPair, face: HTMLElement, isVisualFront: boolean) {
        // 判定当前面是否是逻辑上的 Front 或 Back
        // 如果 currentFace 是 Front (0), 那么 visualFront 是当前显示面
        // 如果 currentFace 是 Back (1), 那么 visualBack 是当前显示面

        // 我们需要根据规则禁用/启用按钮

        // 获取当前面的卡牌数据
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

        // 默认都启用
        this.setButtonEnabled(btnFlip, true);
        this.setButtonEnabled(btnDiscard, true);
        this.setButtonEnabled(btnSelect, true);

        if (pair.isAnswered && pair.answerState === 'wrong') {
            this.setButtonEnabled(btnSelect, false);
        }

        // 规则 2: 如果该卡为问题卡卡面, 在回答问题前禁用其翻转功能
        if (isCurrentFace && card.type === CardType.Question && !pair.isAnswered) {
            this.setButtonEnabled(btnFlip, false);
        }

        // 规则 3: 如果该卡为其他卡卡面 (BW), 在回答问题前禁用其选择功能
        if (isCurrentFace && card.type !== CardType.Question && !pair.isAnswered) {
            this.setButtonEnabled(btnSelect, false);
        }

        // 额外逻辑：如果当前面是问题卡，且未回答，禁用选择（因为通常要答对才能选奖励，或者是说选了就代表开始答题？根据需求描述，"回答问题前禁用其选择功能"是针对BW卡面的。
        // 对于问题卡面，需求没明说禁用选择，但逻辑上盲盒答题后才能拿奖励。
        // 假设问题卡本身不能被"Select"作为最终奖励，Select 只能选增武卡？
        // 或者 Select 意味着"我要这张卡(及其背面)"。
        // 如果背面是增武卡，选了问题卡面等于选了背后的增武卡。
        // 既然规定了“回答问题前禁用翻转”，说明必须先答题。
        // 那么在答题前，能不能 Select？ -> 应该是不能。
        if (isCurrentFace && card.type === CardType.Question && !pair.isAnswered) {
            this.setButtonEnabled(btnSelect, false);
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
