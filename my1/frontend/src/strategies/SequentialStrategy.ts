import { BaseWordSelectionStrategy } from './WordSelectionStrategy';
import type { Word } from '../types/learningModes';

/**
 * 顺序策略
 * 按照单词原始顺序依次展示，到达末尾后返回 null
 */
export class SequentialStrategy extends BaseWordSelectionStrategy {
  getNextWord(): Word | null {
    if (this.currentIndex >= this.words.length) {
      return null;
    }

    // 返回当前单词，不递增索引
    // 索引在 markWordLearned() 中递增
    return this.words[this.currentIndex];
  }

  markWordLearned(wordId: number): void {
    super.markWordLearned(wordId);
    // 标记已学习后，移动到下一个单词
    this.currentIndex++;
  }
}
