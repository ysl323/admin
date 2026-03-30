import type { Word, ProgressInfo } from '../types/learningModes';

/**
 * 单词选择策略接口
 * 定义所有学习模式策略必须实现的方法
 */
export interface WordSelectionStrategy {
  /**
   * 初始化策略，传入单词列表
   * @param words 单词列表
   */
  initialize(words: Word[]): void;

  /**
   * 获取下一个单词
   * @returns 下一个单词，如果没有则返回 null
   */
  getNextWord(): Word | null;

  /**
   * 标记单词为已学习
   * @param wordId 单词 ID
   */
  markWordLearned(wordId: number): void;

  /**
   * 获取当前学习进度
   * @returns 进度信息
   */
  getProgress(): ProgressInfo;

  /**
   * 重置策略状态
   */
  reset(): void;
}

/**
 * 单词选择策略基类
 * 提供通用的实现和辅助方法
 */
export abstract class BaseWordSelectionStrategy implements WordSelectionStrategy {
  protected words: Word[] = [];
  protected currentIndex: number = 0;
  protected learnedWords: Set<number> = new Set();
  protected loopCount: number = 0;
  protected sessionStartTime: Date = new Date();

  initialize(words: Word[]): void {
    this.words = [...words];
    this.currentIndex = 0;
    this.learnedWords.clear();
    this.loopCount = 0;
    this.sessionStartTime = new Date();
  }

  abstract getNextWord(): Word | null;

  markWordLearned(wordId: number): void {
    this.learnedWords.add(wordId);
  }

  getProgress(): ProgressInfo {
    return {
      currentIndex: this.currentIndex,
      totalWords: this.words.length,
      learnedCount: this.learnedWords.size,
      loopCount: this.loopCount,
      sessionStartTime: this.sessionStartTime
    };
  }

  reset(): void {
    this.currentIndex = 0;
    this.learnedWords.clear();
    this.loopCount = 0;
    this.sessionStartTime = new Date();
  }

  /**
   * 检查是否所有单词都已学习
   */
  protected isAllWordsLearned(): boolean {
    return this.learnedWords.size === this.words.length;
  }

  /**
   * 获取未学习的单词列表
   */
  protected getUnlearnedWords(): Word[] {
    return this.words.filter(word => !this.learnedWords.has(word.id));
  }
}
