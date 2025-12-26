import { QuestionCards, WeaponCards, BuffCards } from '../../config/cards';
import { QuestionCard } from '../../config/types';
import { WeaponCard } from '../../config/types';
import { BuffCard } from '../../config/types';

/**
 * 卡牌管理器 (CardManager)
 * 
 * 职责:
 * 1. 从config/cards.ts加载所有卡牌数据
 * 2. 提供卡牌的查询接口
 * 3. 类似于 "只读" 数据库, 不允许修改卡牌数据
 */
export class CardManager {
    private questionCards: QuestionCard[] = QuestionCards;
    private weaponCards: WeaponCard[] = WeaponCards;
    private buffCards: BuffCard[] = BuffCards;

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