import * as pc from 'playcanvas';
import { IGameSystem } from './IGameSystem';
import { GameContext } from '../core/GameContext';
import { EventBus } from '../core/EventBus';
import { SkillSelectUI } from '../ui/SkillSelectUI';
import { Cards } from '../config/cards';
import { Card } from '../config/types';
import { PlayerStats } from '../entities/characters/share/PlayerStats';

export class ProgressionSystem implements IGameSystem {
    private app: pc.Application;
    private eventBus: EventBus;
    private skillSelectUI: SkillSelectUI;
    private pendingCard: Card | null = null;

    constructor() {
        this.app = GameContext.getInstance().getApp();
        this.eventBus = EventBus.getInstance();
        this.skillSelectUI = new SkillSelectUI();
    }

    initialize() {
        this.eventBus.on('player:levelUp', this.onLevelUp, this);
        this.eventBus.on('quiz:end', this.onQuizEnd, this);
    }

    update(dt: number) {
        // Unused
        void dt;
    }

    private onLevelUp(level: number) {
        console.log(`Level Up to ${level}!`);
        this.app.timeScale = 0; // Pause game

        // Pick 3 random cards
        const options = this.getRandomCards(3);

        this.skillSelectUI.show(options, (selectedCard) => {
            if (selectedCard) {
                this.pendingCard = selectedCard;
                // Trigger Quiz
                this.eventBus.fire('quiz:request');
            } else {
                // Skip
                this.app.timeScale = 1;
            }
        });
    }

    private onQuizEnd(success: boolean) {
        if (this.pendingCard) {
            const player = GameContext.getInstance().getPlayer();
            if (player) {
                const stats = player.script!.get('playerStats') as PlayerStats;
                if (stats) {
                    stats.applyCard(this.pendingCard, success);
                    console.log(`Applied card ${this.pendingCard.name} with success=${success}`);
                }
            }
            this.pendingCard = null;
        }

        // Resume game is handled by QuizSystem calling 'quiz:end' 
        // BUT QuizSystem fires 'quiz:end' THEN we catch it here.
        // QuizSystem logic (checked earlier) resumes timeScale itself?
        // Let's check QuizSystem.ts again.
        // Yes: this.app.timeScale = 1; in onQuizEnd of GameManager (or QuizSystem?)
        // Wait, GameManager listens to quiz:end and resumes timeScale.
        // So we don't need to resume it here.
    }

    private getRandomCards(count: number): Card[] {
        const shuffled = [...Cards].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }
}
