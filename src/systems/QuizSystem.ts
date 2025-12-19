import * as pc from 'playcanvas';
import { IGameSystem } from './IGameSystem';
import { GameContext } from '../core/GameContext';
import { EventBus } from '../core/EventBus';
import { QuestionUI, type QuestionData } from '../ui/QuestionUI';

/**
 * 答题系统
 * 管理题目加载、触发、UI 显示和答案校验。
 */
export class QuizSystem implements IGameSystem {
    private app: pc.Application;
    private ui: QuestionUI;
    private questions: QuestionData[] = [];
    private active = false;
    private timer: number = 0;
    private interval: number = 10; // 每10秒触发一次
    private eventBus: EventBus;

    constructor() {
        this.app = GameContext.getInstance().getApp();
        this.eventBus = EventBus.getInstance();
        this.ui = new QuestionUI();
        void this.loadQuestions();
    }

    initialize() {
        console.log("QuizSystem initialized");
    }

    update(dt: number) {
        // 如果正在答题，暂停计时
        if (this.active) return;

        this.timer += dt;
        if (this.timer >= this.interval) {
            this.triggerQuestion();
            this.timer = 0;
        }
    }

    /**
     * 触发答题
     */
    private triggerQuestion() {
        if (this.active) return;
        this.active = true;

        // 通知 GameManager 暂停游戏
        this.eventBus.fire('quiz:start');

        const question = this.pickQuestion();
        this.ui.show(question, (answer) => {
            const ok = this.checkAnswer(question, answer);
            this.onResult(ok);
            
            this.active = false;
            // 通知 GameManager 恢复游戏
            this.eventBus.fire('quiz:end', ok);
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
        const player = GameContext.getInstance().getPlayer();
        if (player) {
            const pos = player.getPosition().clone();
            pos.y += 2;
            // 通过 EventBus 发送结果反馈，而不是直接调用 UI
            this.eventBus.fire('combat:damage', 0, pos, ok ? 'lime' : 'red'); // 复用 damage 显示，或者新建 feedback 事件
            // 或者发送专门的 feedback 事件
            this.eventBus.fire('feedback:show', ok ? 'Correct!' : 'Wrong!', pos, ok ? 'lime' : 'red');
        } else {
            console.log(ok ? 'Correct!' : 'Wrong!');
        }
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
