import { BaseWordSelectionStrategy } from './WordSelectionStrategy';
import type { Word } from '../types/learningModes';

/**
 * 随机策略
 * 从未学习的单词中随机选择，确保每个单词在一轮中只出现一次
 */
export class RandomStrategy extends BaseWordSelectionStrategy {
  private unlearnedInCurrentRound: Set<number> = new Set();

  initialize(words: Word[]): void {
    super.initialize(words);
    this.unlearnedInCurrentRound = new Set(words.map(w => w.id));
  }

  getNextWord(): Word | null {
    // 如果当前轮次所有单词都已学习，开始新一轮
    if (this.unlearnedInCurrentRound.size === 0) {
      if (this.words.length === 0) {
        return null;
      }
      // 重置当前轮次的未学习集合
      this.unlearnedInCurrentRound = new Set(this.words.map(w => w.id));
      this.loopCount++;
    }

    // 从未学习的单词中随机选择
    const unlearnedWords = this.words.filter(w => 
      this.unlearnedInCurrentRound.has(w.id)
    );

    if (unlearnedWords.length === 0) {
      return null;
    }

    const randomIndex = Math.floor(Math.random() * unlearnedWords.length);
    const selectedWord = unlearnedWords[randomIndex];

    // 从当前轮次的未学习集合中移除
    this.unlearnedInCurrentRound.delete(selectedWord.id);
    this.currentIndex++;

    return selectedWord;
  }

  reset(): void {
    super.reset();
    this.unlearnedInCurrentRound = new Set(this.words.map(w => w.id));
  }
}
