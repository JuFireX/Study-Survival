import { QuestionData } from '../../config/types';

export class QuestionUIComponent {
    container: HTMLElement;
    text: HTMLElement;
    optionsContainer: HTMLElement;
    callback: ((answer: number | string | number[]) => void) | null = null;

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

    public destroy() {
        this.container.remove();
    }

    show(question: QuestionData, onAnswer: (answer: number | string | number[]) => void) {
        this.text.textContent = `[${question.subject.toUpperCase()}] ${question.text}`;
        this.optionsContainer.innerHTML = '';
        this.callback = onAnswer;

        if (question.type === 'fill') {
            const input = document.createElement('input');
            input.type = 'text';
            input.placeholder = 'Type your answer...';
            input.style.padding = '10px';
            input.style.fontSize = '16px';
            input.style.marginBottom = '10px';
            input.style.width = '100%';
            input.style.boxSizing = 'border-box';
            this.optionsContainer.appendChild(input);

            const btn = document.createElement('button');
            btn.textContent = 'Submit';
            btn.style.padding = '10px';
            btn.style.fontSize = '16px';
            btn.style.cursor = 'pointer';
            btn.onclick = () => {
                const val = input.value.trim();
                if (!val) return;

                // Prevent double clicks
                btn.onclick = null;
                this.hide();
                if (this.callback) this.callback(val);
            };
            this.optionsContainer.appendChild(btn);

            // Auto focus
            setTimeout(() => input.focus(), 100);
        } else if (question.type === 'multi-choice') {
            const selected = new Set<number>();
            (question.options || []).forEach((opt, idx) => {
                const wrapper = document.createElement('div');
                wrapper.style.display = 'flex';
                wrapper.style.alignItems = 'center';
                wrapper.style.gap = '10px';
                wrapper.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                wrapper.style.padding = '10px';
                wrapper.style.cursor = 'pointer';

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.style.transform = 'scale(1.5)';

                const label = document.createElement('span');
                label.textContent = opt;
                label.style.flex = '1';

                wrapper.appendChild(checkbox);
                wrapper.appendChild(label);

                wrapper.onclick = (e) => {
                    // Toggle checkbox if clicked on wrapper (but not if clicked directly on checkbox)
                    if (e.target !== checkbox) {
                        checkbox.checked = !checkbox.checked;
                    }
                    if (checkbox.checked) {
                        selected.add(idx);
                        wrapper.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                    } else {
                        selected.delete(idx);
                        wrapper.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                    }
                };

                // Sync checkbox click
                checkbox.onclick = (e) => {
                    e.stopPropagation();
                    if (checkbox.checked) {
                        selected.add(idx);
                        wrapper.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                    } else {
                        selected.delete(idx);
                        wrapper.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                    }
                }

                this.optionsContainer.appendChild(wrapper);
            });

            const btn = document.createElement('button');
            btn.textContent = 'Submit';
            btn.style.padding = '10px';
            btn.style.marginTop = '10px';
            btn.style.fontSize = '16px';
            btn.style.cursor = 'pointer';
            btn.onclick = () => {
                if (selected.size === 0) return; // Must select at least one

                btn.onclick = null;
                this.hide();
                if (this.callback) this.callback(Array.from(selected).sort());
            };
            this.optionsContainer.appendChild(btn);
        } else {
            // Default to single choice
            (question.options || []).forEach((opt, idx) => {
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
        }

        this.container.style.display = 'block';
    }

    hide() {
        this.container.style.display = 'none';
    }
}
