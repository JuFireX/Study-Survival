import { IGameSystem } from '../share/IGameSystem';
import { QuestionData } from '../../config/types';
import { questions } from '../../config/questions';

export class QuestionSystem implements IGameSystem {
    private questions: QuestionData[] = [];

    initialize() {
        this.loadQuestions();
        console.log("QuestionSystem initialized");
    }

    update(dt: number) {
        void dt;
    }

    /**
     * 获取随机题目
     */
    public getRandomQuestion(difficulty: number = 1): QuestionData {
        const list = this.questions.length > 0 ? this.questions : this.getFallbackQuestions();
        // 简单随机，后续可以根据 difficulty 筛选
        const idx = Math.floor(Math.random() * list.length);
        const q = list[idx];
        return this.processQuestion(q);
    }

    /**
     * 校验答案
     */
    public checkAnswer(question: QuestionData, answer: number | string | number[]): boolean {
        if (question.type === 'fill') {
            const expected = this.normalizeText(question.answer ?? '');
            const got = this.normalizeText(typeof answer === 'string' ? answer : String(answer));
            return expected.length > 0 && expected === got;
        }

        if (question.type === 'multi-choice') {
            if (!Array.isArray(answer) || !Array.isArray(question.correct)) return false;
            const ans = answer.sort((a, b) => a - b);
            const corr = question.correct.sort((a, b) => a - b);

            if (ans.length !== corr.length) return false;
            for (let i = 0; i < ans.length; i++) {
                if (ans[i] !== corr[i]) return false;
            }
            return true;
        }

        if (typeof answer !== 'number') return false;
        return answer === (question.correct ?? -1);
    }

    private loadQuestions() {
        try {
            if (!Array.isArray(questions) || questions.length === 0) {
                console.warn('questions.ts empty or not an array, using fallback');
                this.questions = this.getFallbackQuestions();
                return;
            }

            this.questions = questions.map((q: any) => {
                return {
                    id: Number(q.id ?? 0),
                    subject: String(q.subject ?? 'general'),
                    difficulty: Number(q.difficulty ?? 1),
                    text: String(q.text ?? ''),
                    type: q.type === 'fill' ? 'fill' : q.type === 'multi-choice' ? 'multi-choice' : 'choice',
                    options: Array.isArray(q.options) ? q.options.map((o: any) => String(o)) : [],
                    correct: Array.isArray(q.correct) ? q.correct.map((n: any) => Number(n)) : (typeof q.correct === 'number' ? q.correct : undefined),
                    answer: q.answer !== undefined ? String(q.answer) : undefined
                } as QuestionData;
            });
        } catch (err) {
            console.error('Failed to load questions:', err);
            this.questions = this.getFallbackQuestions();
        }
    }

    private processQuestion(q: QuestionData): QuestionData {
        // Clone to avoid mutation
        if (q.type === 'fill') {
            return {
                ...q,
                type: 'fill',
                answer: (q.answer ?? '').toString()
            };
        }

        if (q.type === 'multi-choice') {
            return {
                ...q,
                type: 'multi-choice',
                options: (q.options ?? []).map((x) => x.toString()),
                correct: Array.isArray(q.correct) ? q.correct : [typeof q.correct === 'number' ? q.correct : 0]
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

    private normalizeText(s: string): string {
        return s.trim().toLowerCase();
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
