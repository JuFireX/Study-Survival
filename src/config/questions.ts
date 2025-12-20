import { QuestionData } from '../ui/QuestionUI';

export const questions: QuestionData[] = [
  {
    "id": 1,
    "subject": "math",
    "difficulty": 1,
    "text": "1 + 1 = ?",
    "options": ["1", "2", "3", "4"],
    "correct": 1
  },
  {
    "id": 2,
    "subject": "math",
    "difficulty": 1,
    "text": "2 * 3 = ?",
    "options": ["5", "6", "9", "12"],
    "correct": 1
  },
  {
    "id": 3,
    "subject": "english",
    "difficulty": 1,
    "text": "Apple means?",
    "options": ["Banana", "Apple", "Orange", "Grape"],
    "correct": 1
  },
  {
    "id": 4,
    "subject": "chinese",
    "difficulty": 1,
    "text": "Which is a poem?",
    "options": ["Code", "Li Bai", "Math", "English"],
    "correct": 1
  },
  {
    "id": 5,
    "subject": "general",
    "difficulty": 1,
    "text": "What is the capital of France?",
    "type": "fill",
    "answer": "Paris"
  },
  {
    "id": 6,
    "subject": "math",
    "difficulty": 2,
    "text": "10 / 2 = ?",
    "type": "fill",
    "answer": "5"
  },
  {
    "id": 7,
    "subject": "general",
    "difficulty": 2,
    "text": "Which of the following are fruits?",
    "type": "multi-choice",
    "options": ["Apple", "Carrot", "Banana", "Potato"],
    "correct": [0, 2]
  }
]
