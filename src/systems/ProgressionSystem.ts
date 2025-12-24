import * as pc from 'playcanvas';
import { IGameSystem } from './share/IGameSystem';
import { GameContext } from '../core/GameContext';
import { EventBus } from '../core/EventBus';
import { UIManager } from '../core/UIManager';
import { Cards } from '../config/cards';
import { questions } from '../config/questions';
import { Card, QuestionData } from '../config/types';
import { PlayerStats } from '../entities/characters/share/PlayerStats';

/**
 升级->技能选择(内置答题)->增益
 */

export class ProgressionSystem implements IGameSystem {
    private app: pc.Application;
    private eventBus: EventBus;
    private ui: UIManager;
    // private pendingCard: Card | null = null; // No longer needed as quiz is inline

    constructor(ui: UIManager) {
        this.app = GameContext.getInstance().getApp();
        this.eventBus = EventBus.getInstance();
        this.ui = ui;
    }

    initialize() {
        this.eventBus.on('player:levelUp', this.onLevelUp, this);
        // this.eventBus.on('quiz:end', this.onQuizEnd, this); // Handled in UI callback
    }

    update(dt: number) {
        // Unused
        void dt;
    }

    private onLevelUp(level: number) {
        console.log(`Level Up to ${level}!`);
        this.app.timeScale = 0; // Pause game

        // Pick 3 random cards with questions
        const options = this.getRandomCards(3);

        this.ui.showSkillSelect(options, (selectedCard) => {
            if (selectedCard) {
                // Card selected and question answered correctly
                this.applyCard(selectedCard);
            }
            // Whether selected or skipped (null), resume game
            this.app.timeScale = 1;
        });
    }

    private applyCard(card: Card) {
        const player = GameContext.getInstance().getPlayer();
        if (player) {
            const stats = player.script!.get('playerStats') as PlayerStats;
            if (stats) {
                stats.applyCard(card, true); // Success is always true here as UI handles verification
                console.log(`Applied card ${card.name}`);
            }
        }
    }

    private getRandomCards(count: number): Card[] {
        const shuffledCards = [...Cards].sort(() => 0.5 - Math.random());
        const selectedCards = shuffledCards.slice(0, count);

        // Assign random questions
        return selectedCards.map(card => {
            // Clone card to avoid modifying the config object permanently (though shallow clone is enough for top level)
            const newCard = { ...card };
            
            // Pick a random question
            // We can filter by difficulty if needed, but for now just random
            const randomQ = questions[Math.floor(Math.random() * questions.length)];
            
            // Clone question too just in case
            newCard.question = { ...randomQ };
            
            return newCard;
        });
    }
}
