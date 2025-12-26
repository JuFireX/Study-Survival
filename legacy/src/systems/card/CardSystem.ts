import * as pc from 'playcanvas';
import { IGameSystem } from '../share/IGameSystem';
import { GameContext } from '../../core/GameContext';
import { EventBus } from '../../core/EventBus';
import { UIManager } from '../../core/UIManager';
import { QuestionSystem } from '../question/QuestionSystem';
import { Card, CardEffect } from '../../config/types';
import { Cards } from '../../config/cards';

export class CardSystem implements IGameSystem {
    private app: pc.Application;
    private eventBus: EventBus;
    private ui: UIManager;
    private questionSystem: QuestionSystem;

    constructor(ui: UIManager, questionSystem: QuestionSystem) {
        this.app = GameContext.getInstance().getApp();
        this.eventBus = EventBus.getInstance();
        this.ui = ui;
        this.questionSystem = questionSystem;
    }

    initialize() {
        console.log("CardSystem initialized");
        this.eventBus.on('player:levelUp', this.onLevelUp, this);
    }

    update(dt: number) {
        void dt;
    }

    private onLevelUp(level: number) {
        console.log(`CardSystem handling Level Up: ${level}`);
        this.app.timeScale = 0; // Pause Game

        // 1. Pick 3 Random Cards
        const cards = this.getRandomCards(3);

        // 2. Assign Questions
        cards.forEach(card => {
            // Difficulty can be based on level or card rarity
            const diff = Math.min(5, Math.ceil(level / 2)); 
            card.question = this.questionSystem.getRandomQuestion(diff);
        });

        // 3. Show UI
        this.ui.showSkillSelect(
            cards,
            // Answer Validator
            (card, answer) => this.questionSystem.checkAnswer(card.question!, answer),
            // Selection Callback
            (selectedCard) => {
                if (selectedCard) {
                    this.applyCard(selectedCard);
                } else {
                    console.log("Card selection skipped/discarded.");
                }
                this.app.timeScale = 1; // Resume Game
            }
        );
    }

    private getRandomCards(count: number): Card[] {
        // Simple shuffle
        const shuffled = [...Cards].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count).map(c => ({ ...c })); // Shallow clone
    }

    private applyCard(card: Card) {
        console.log(`Applying Card: ${card.name}`);
        card.effects.forEach(effect => {
            // Dispatch effect to relevant systems
            this.eventBus.fire('card:applyEffect', effect);
        });
    }
}
