import { BaseWordSelectionStrategy } from './WordSelectionStrategy';
import type { Word } from '../types/learningModes';

/**
 * 循环策略
 * 按照单词原始顺序循环展示，到达末尾后自动返回开头
 */
export class LoopStrategy extends BaseWordSelectionStrategy {
  getNextWord(): Word | null {
    if (this.words.length === 0) {
      return null;
    }

    const word = this.words[this.currentIndex];
    this.currentIndex++;

    // 到达末尾时，重置索引并增加循环计数
    if (this.currentIndex >= this.words.length) {
      this.currentIndex = 0;
      this.loopCount++;
    }

    return word;
  }
}
