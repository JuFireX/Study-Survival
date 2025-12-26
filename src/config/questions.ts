/**
 * 题库数据 (Questions Data)
 * 
 * 职责:
 * 1. 存储所有静态题目数据。
 * 2. 作为卡牌系统中题目卡的数据源。
 */
import { QuestionData } from '../config/types';

export const questions: QuestionData[] = [
  {
    "id": 1,
    "subject": "数学",
    "difficulty": 1,
    "text": "1 + 1 = ?",
    "options": ["1", "2", "3", "4"],
    "correct": 1
  },
  {
    "id": 2,
    "subject": "数学",
    "difficulty": 1,
    "text": "2 * 3 = ?",
    "options": ["5", "6", "9", "12"],
    "correct": 1
  },
  {
    "id": 3,
    "subject": "英语",
    "difficulty": 1,
    "text": "Apple means?",
    "options": ["香蕉", "苹果", "橙子", "葡萄"],
    "correct": 1
  },
  {
    "id": 4,
    "subject": "中文",
    "difficulty": 1,
    "text": "下列中哪一位不是诗人？",
    "options": ["李白", "杜甫", "白居易", "英语"],
    "correct": 3
  },
  {
    "id": 5,
    "subject": "英语",
    "difficulty": 1,
    "text": "What is the capital of France?",
    "type": "fill",
    "answer": "Paris"
  },
  {
    "id": 6,
    "subject": "数学",
    "difficulty": 2,
    "text": "10 / 2 = ?",
    "type": "fill",
    "answer": "5"
  },
  {
    "id": 7,
    "subject": "英语",
    "difficulty": 2,
    "text": "Which of the following are fruits?",
    "type": "multi-choice",
    "options": ["Apple", "Carrot", "Banana", "Potato"],
    "correct": [0, 2]
  }
]
