import { BuffCard, WeaponCard, QuestionCard } from '../../config/types';
import { QuestionCards, WeaponCards, BuffCards } from '../../config/cards';

/**
 * 卡牌管理器 (CardManager)
 * 
 * 职责:
 * 1. 从config/cards.ts加载所有卡牌数据
 * 2. 提供卡牌的查询接口
 * 3. 类似于 "只读" 数据库, 不允许修改卡牌数据
 */
export class CardManager {
    private static instance: CardManager;
    private questionCards: QuestionCard[];
    private weaponCards: WeaponCard[];
    private buffCards: BuffCard[];

    private constructor() {
        this.questionCards = QuestionCards;
        this.weaponCards = WeaponCards;
        this.buffCards = BuffCards;
    }

    /**
     * 获取单例实例
     */
    public static getInstance(): CardManager {
        if (!CardManager.instance) {
            CardManager.instance = new CardManager();
        }
        return CardManager.instance;
    }

    /**
     * 获取所有题目卡
     */
    public getAllQuestionCards(): QuestionCard[] {
        return this.questionCards;
    }

    /**
     * 获取所有武器卡
     */
    public getAllWeaponCards(): WeaponCard[] {
        return this.weaponCards;
    }

    /**
     * 获取所有增益卡
     */
    public getAllBuffCards(): BuffCard[] {
        return this.buffCards;
    }
}