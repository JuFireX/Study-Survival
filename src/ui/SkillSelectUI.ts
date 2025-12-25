import { Card } from '../config/types';
import { SkillSelectUIComponent } from './components/SkillSelectUIComponent';

export class SkillSelectUI {
    private component: SkillSelectUIComponent;

    constructor() {
        this.component = new SkillSelectUIComponent();
    }

    public destroy() {
        this.component.destroy();
    }

    public show(cards: Card[], onCheck: (card: Card, answer: any) => boolean, callback: (card: Card | null) => void) {
        this.component.show(cards, onCheck, callback);
    }

    public hide() {
        this.component.hide();
    }
}
