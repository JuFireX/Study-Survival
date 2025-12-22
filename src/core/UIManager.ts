import * as pc from 'playcanvas';
import type { Card } from '../config/types';
import { GameContext } from './GameContext';
import { FloatingTextManager } from '../ui/FloatingTextManager';
import { HUD } from '../ui/HUD';
import { Joystick } from '../ui/Joystick';
import { QuestionUI, type QuestionData } from '../ui/QuestionUI';
import { SkillSelectUI } from '../ui/SkillSelectUI';

export class UIManager {
    private app: pc.Application;

    private joystick: Joystick;
    private hud: HUD;

    private questionUI: QuestionUI;
    private skillSelectUI: SkillSelectUI;
    private floatingText: FloatingTextManager;

    constructor() {
        const ctx = GameContext.getInstance();
        this.app = ctx.getApp();

        this.joystick = new Joystick();
        this.hud = new HUD();

        this.questionUI = new QuestionUI();
        this.skillSelectUI = new SkillSelectUI();

        this.floatingText = new FloatingTextManager(this.app);
        const camera = ctx.getCamera();
        if (camera) {
            this.floatingText.setCamera(camera);
        }
    }

    public setCamera(camera: pc.Entity) {
        this.floatingText.setCamera(camera);
    }

    public getJoystick(): Joystick {
        return this.joystick;
    }

    public getHUD(): HUD {
        return this.hud;
    }

    public showQuestion(question: QuestionData, onAnswer: (answer: number | string | number[]) => void) {
        this.questionUI.show(question, onAnswer);
    }

    public showSkillSelect(cards: Card[], onSelect: (card: Card | null) => void) {
        this.skillSelectUI.show(cards, onSelect);
    }

    public showFloatingText(text: string, worldPos: pc.Vec3, color: string = 'white') {
        this.floatingText.spawn(text, worldPos, color);
    }
}