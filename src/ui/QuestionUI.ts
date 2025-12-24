import { QuestionData, QuestionUIComponent } from './components/QuestionUIComponent';

export type { QuestionData };

export class QuestionUI {
    private component: QuestionUIComponent;

    constructor() {
        this.component = new QuestionUIComponent();
    }

    public destroy() {
        this.component.destroy();
    }

    show(question: QuestionData, onAnswer: (answer: number | string | number[]) => void) {
        this.component.show(question, onAnswer);
    }

    hide() {
        this.component.hide();
    }
}
