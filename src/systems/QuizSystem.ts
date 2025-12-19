import * as pc from 'playcanvas';
import { QuestionUI, type QuestionData } from '../ui/QuestionUI';

export class QuestionManager {
    private app: pc.Application;
    private ui: QuestionUI;
    private questions: QuestionData[] = [];
    private active = false;
    private prevTimeScale = 1;

    constructor(app: pc.Application) {
        this.app = app;
        this.ui = new QuestionUI();
        void this.loadQuestions();
    }

    triggerQuestion() {
        if (this.active) return;
        this.active = true;

        this.prevTimeScale = (this.app as unknown as { timeScale?: number }).timeScale ?? 1;
        (this.app as unknown as { timeScale: number }).timeScale = 0;

        const question = this.pickQuestion();
        this.ui.show(question, (answer) => {
            const ok = this.checkAnswer(question, answer);
            this.onResult(ok);
            this.active = false;
            (this.app as unknown as { timeScale: number }).timeScale = this.prevTimeScale;
        });
    }

    private async loadQuestions() {
        try {
            const res = await fetch('/questions.json', { cache: 'no-store' });
            if (!res.ok) throw new Error(`Failed to load questions.json: ${res.status}`);
            const json: unknown = await res.json();
            if (this.isQuestionArray(json) && json.length > 0) {
                this.questions = json;
            } else {
                this.questions = this.getFallbackQuestions();
            }
        } catch {
            this.questions = this.getFallbackQuestions();
        }
    }

    private pickQuestion(): QuestionData {
        const list = this.questions.length > 0 ? this.questions : this.getFallbackQuestions();
        const idx = Math.floor(Math.random() * list.length);
        const q = list[idx];

        if (q.type === 'fill') {
            return {
                ...q,
                type: 'fill',
                answer: (q.answer ?? '').toString()
            };
        }

        const options = (q.options ?? []).map((x) => x.toString());
        const correct = typeof q.correct === 'number' ? q.correct : 0;

        if (options.length === 0) {
            return this.getFallbackQuestions()[0];
        }

        return {
            ...q,
            type: 'choice',
            options,
            correct: Math.max(0, Math.min(correct, options.length - 1))
        };
    }

    private checkAnswer(question: QuestionData, answer: number | string): boolean {
        if (question.type === 'fill') {
            const expected = this.normalizeText(question.answer ?? '');
            const got = this.normalizeText(typeof answer === 'string' ? answer : String(answer));
            return expected.length > 0 && expected === got;
        }

        if (typeof answer !== 'number') return false;
        return answer === (question.correct ?? -1);
    }

    private onResult(ok: boolean) {
        const gm = (window as any).gameManager as any;
        if (gm?.floatingText && gm?.player?.getPosition) {
            const pos = gm.player.getPosition().clone();
            pos.y += 2;
            gm.floatingText.spawn(ok ? 'Correct!' : 'Wrong!', pos, ok ? 'lime' : 'red');
            return;
        }
        console.log(ok ? 'Correct!' : 'Wrong!');
    }

    private normalizeText(s: string): string {
        return s.trim().toLowerCase();
    }

    private isQuestionArray(x: unknown): x is QuestionData[] {
        return Array.isArray(x) && x.every((q) => typeof q === 'object' && q !== null && 'text' in q);
    }

    private getFallbackQuestions(): QuestionData[] {
        return [
            {
                id: 0,
                subject: 'math',
                difficulty: 1,
                text: '1 + 1 = ?',
                type: 'choice',
                options: ['1', '2', '3', '4'],
                correct: 1
            }
        ];
    }
}