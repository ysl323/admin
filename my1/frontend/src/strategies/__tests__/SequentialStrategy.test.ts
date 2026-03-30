import { describe, it, expect, beforeEach } from 'vitest';
import { SequentialStrategy } from '../SequentialStrategy';
import type { Word } from '../../types/learningModes';

describe('SequentialStrategy', () => {
  let strategy: SequentialStrategy;
  let testWords: Word[];

  beforeEach(() => {
    strategy = new SequentialStrategy();
    testWords = [
      { id: 1, english: 'hello', chinese: '你好', audioUrl: '/audio/1.mp3' },
      { id: 2, english: 'world', chinese: '世界', audioUrl: '/audio/2.mp3' },
      { id: 3, english: 'test', chinese: '测试', audioUrl: '/audio/3.mp3' }
    ];
  });

  describe('顺序遍历', () => {
    it('应该按顺序返回所有单词', () => {
      strategy.initialize(testWords);

      const word1 = strategy.getNextWord();
      expect(word1?.id).toBe(1);

      const word2 = strategy.getNextWord();
      expect(word2?.id).toBe(2);

      const word3 = strategy.getNextWord();
      expect(word3?.id).toBe(3);
    });

    it('到达末尾后应该返回 null', () => {
      strategy.initialize(testWords);

      // 获取所有单词
      for (let i = 0; i < testWords.length; i++) {
        strategy.getNextWord();
      }

      // 再次获取应该返回 null
      const nextWord = strategy.getNextWord();
      expect(nextWord).toBeNull();
    });
  });

  describe('边界条件', () => {
    it('空列表应该立即返回 null', () => {
      strategy.initialize([]);
      const word = strategy.getNextWord();
      expect(word).toBeNull();
    });

    it('单个单词应该正确处理', () => {
      const singleWord = [testWords[0]];
      strategy.initialize(singleWord);

      const word1 = strategy.getNextWord();
      expect(word1?.id).toBe(1);

      const word2 = strategy.getNextWord();
      expect(word2).toBeNull();
    });
  });

  describe('进度追踪', () => {
    it('应该正确追踪当前索引', () => {
      strategy.initialize(testWords);

      let progress = strategy.getProgress();
      expect(progress.currentIndex).toBe(0);

      strategy.getNextWord();
      progress = strategy.getProgress();
      expect(progress.currentIndex).toBe(1);

      strategy.getNextWord();
      progress = strategy.getProgress();
      expect(progress.currentIndex).toBe(2);
    });

    it('应该正确报告总单词数', () => {
      strategy.initialize(testWords);
      const progress = strategy.getProgress();
      expect(progress.totalWords).toBe(3);
    });
  });

  describe('标记已学习', () => {
    it('应该正确追踪已学习的单词', () => {
      strategy.initialize(testWords);

      strategy.markWordLearned(1);
      let progress = strategy.getProgress();
      expect(progress.learnedCount).toBe(1);

      strategy.markWordLearned(2);
      progress = strategy.getProgress();
      expect(progress.learnedCount).toBe(2);
    });
  });

  describe('重置', () => {
    it('重置后应该从头开始', () => {
      strategy.initialize(testWords);

      // 获取一些单词
      strategy.getNextWord();
      strategy.getNextWord();

      // 重置
      strategy.reset();

      // 应该从头开始
      const word = strategy.getNextWord();
      expect(word?.id).toBe(1);

      const progress = strategy.getProgress();
      expect(progress.currentIndex).toBe(1);
      expect(progress.learnedCount).toBe(0);
    });
  });
});
