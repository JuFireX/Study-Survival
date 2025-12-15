export interface QuestionData {
    id: number;
    subject: string;
    difficulty: number;
    text: string;
    options: string[];
    correct: number; // Index
}

export class QuestionUI {
    container: HTMLElement;
    text: HTMLElement;
    optionsContainer: HTMLElement;
    callback: ((index: number) => void) | null = null;

    constructor() {
        this.container = document.createElement('div');
        this.container.id = 'question-ui';
        this.container.style.position = 'absolute';
        this.container.style.top = '50%';
        this.container.style.left = '50%';
        this.container.style.transform = 'translate(-50%, -50%)';
        this.container.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
        this.container.style.padding = '20px';
        this.container.style.borderRadius = '10px';
        this.container.style.color = 'white';
        this.container.style.display = 'none';
        this.container.style.zIndex = '1000';
        this.container.style.minWidth = '300px';
        this.container.style.textAlign = 'center';

        this.text = document.createElement('h2');
        this.container.appendChild(this.text);

        this.optionsContainer = document.createElement('div');
        this.optionsContainer.style.display = 'flex';
        this.optionsContainer.style.flexDirection = 'column';
        this.optionsContainer.style.gap = '10px';
        this.container.appendChild(this.optionsContainer);

        document.body.appendChild(this.container);
    }

    show(question: QuestionData, onAnswer: (index: number) => void) {
        this.text.textContent = `[${question.subject.toUpperCase()}] ${question.text}`;
        this.optionsContainer.innerHTML = '';
        this.callback = onAnswer;

        question.options.forEach((opt, idx) => {
            const btn = document.createElement('button');
            btn.textContent = opt;
            btn.style.padding = '10px';
            btn.style.fontSize = '16px';
            btn.style.cursor = 'pointer';
            btn.onclick = () => {
                // Prevent double clicks
                btn.onclick = null;
                this.hide();
                if (this.callback) this.callback(idx);
            };
            this.optionsContainer.appendChild(btn);
        });

        this.container.style.display = 'block';
    }

    hide() {
        this.container.style.display = 'none';
    }
}
