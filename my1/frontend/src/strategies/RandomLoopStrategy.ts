import { BaseWordSelectionStrategy } from './WordSelectionStrategy';
import type { Word } from '../types/learningModes';

/**
 * 随机循环策略
 * 随机打乱单词顺序后循环展示，每轮结束后重新打乱
 */
export class RandomLoopStrategy extends BaseWordSelectionStrategy {
  private shuffledWords: Word[] = [];

  initialize(words: Word[]): void {
    super.initialize(words);
    this.shuffleWords();
  }

  getNextWord(): Word | null {
    if (this.shuffledWords.length === 0) {
      return null;
    }

    const word = this.shuffledWords[this.currentIndex];
    this.currentIndex++;

    // 到达末尾时，重新打乱并重置索引
    if (this.currentIndex >= this.shuffledWords.length) {
      this.currentIndex = 0;
      this.loopCount++;
      this.shuffleWords();
    }

    return word;
  }

  reset(): void {
    super.reset();
    this.shuffleWords();
  }

  /**
   * 使用 Fisher-Yates 算法打乱单词顺序
   */
  private shuffleWords(): void {
    this.shuffledWords = [...this.words];
    
    for (let i = this.shuffledWords.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.shuffledWords[i], this.shuffledWords[j]] = 
        [this.shuffledWords[j], this.shuffledWords[i]];
    }
  }
}
