import { QuestionData, QuestionUI } from '../ui/QuestionUI';
import * as pc from 'playcanvas';

export class QuestionManager {
    app: pc.Application;
    ui: QuestionUI;
    questions: QuestionData[] = [];
    
    constructor(app: pc.Application) {
        this.app = app;
        this.ui = new QuestionUI();
        this.loadQuestions();
    }
    
    async loadQuestions() {
        try {
            const res = await fetch('/questions.json');
            this.questions = await res.json();
            console.log("Loaded questions:", this.questions.length);
        } catch (e) {
            console.error("Failed to load questions", e);
        }
    }
    
    triggerQuestion() {
        if (this.questions.length === 0) return;
        
        // Pause game
        this.app.timeScale = 0;
        
        // Pick random question (TODO: Use weights based on player stats)
        const q = this.questions[Math.floor(Math.random() * this.questions.length)];
        
        this.ui.show(q, (answer) => {
            this.app.timeScale = 1; // Resume
            
            let isCorrect = false;
            if (typeof answer === 'number') {
                isCorrect = answer === q.correct;
            } else if (typeof answer === 'string') {
                isCorrect = answer.toLowerCase() === (q.answer || '').toLowerCase();
            }
            
            if (isCorrect) {
                console.log("Correct!");
                // TODO: Trigger Upgrade System
                // Flash Green?
            } else {
                console.log("Wrong!");
                // Flash Red?
            }
        });
    }
}
