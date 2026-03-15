import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { SequentialStrategy } from '../SequentialStrategy';
import { RandomStrategy } from '../RandomStrategy';
import { LoopStrategy } from '../LoopStrategy';
import { RandomLoopStrategy } from '../RandomLoopStrategy';
import type { Word } from '../../types/learningModes';

// 生成测试用的单词
const wordArbitrary = fc.record({
  id: fc.integer({ min: 1, max: 10000 }),
  english: fc.string({ minLength: 1, maxLength: 20 }),
  chinese: fc.string({ minLength: 1, maxLength: 20 }),
  audioUrl: fc.string()
});

const wordsArrayArbitrary = fc.array(wordArbitrary, { minLength: 1, maxLength: 20 })
  .map(words => {
    // 确保 ID 唯一
    const uniqueWords = words.map((word, index) => ({
      ...word,
      id: index + 1
    }));
    return uniqueWords;
  });

describe('策略属性测试', () => {
  describe('属性 4: 随机选择有效性', () => {
    it('对于任意非空单词集合，随机模式选择的下一个单词应该始终是集合中的一个元素', () => {
      fc.assert(
        fc.property(wordsArrayArbitrary, (words) => {
          const strategy = new RandomStrategy();
          strategy.initialize(words);

          const wordIds = new Set(words.map(w => w.id));
          
          // 测试多次选择
          for (let i = 0; i < Math.min(words.length * 2, 20); i++) {
            const nextWord = strategy.getNextWord();
            if (nextWord !== null) {
              expect(wordIds.has(nextWord.id)).toBe(true);
            }
          }
        }),
        { numRuns: 3 }
      );
    });

    it('对于任意非空单词集合，所有策略选择的单词都应该在原始集合中', () => {
      fc.assert(
        fc.property(wordsArrayArbitrary, (words) => {
          const strategies = [
            new SequentialStrategy(),
            new RandomStrategy(),
            new LoopStrategy(),
            new RandomLoopStrategy()
          ];

          const wordIds = new Set(words.map(w => w.id));

          strategies.forEach(strategy => {
            strategy.initialize(words);
            
            // 测试前 5 个单词
            for (let i = 0; i < Math.min(5, words.length); i++) {
              const nextWord = strategy.getNextWord();
              if (nextWord !== null) {
                expect(wordIds.has(nextWord.id)).toBe(true);
              }
            }
          });
        }),
        { numRuns: 3 }
      );
    });
  });

  describe('属性 3: 随机模式无重复保证', () => {
    it('对于任意单词集合，在随机模式下，一轮内每个单词都被选择恰好一次', () => {
      fc.assert(
        fc.property(wordsArrayArbitrary, (words) => {
          const strategy = new RandomStrategy();
          strategy.initialize(words);

          const selectedIds = new Set<number>();
          
          // 选择 words.length 次
          for (let i = 0; i < words.length; i++) {
            const nextWord = strategy.getNextWord();
            expect(nextWord).not.toBeNull();
            
            if (nextWord) {
              // 确保没有重复
              expect(selectedIds.has(nextWord.id)).toBe(false);
              selectedIds.add(nextWord.id);
            }
          }

          // 确保所有单词都被选择了
          expect(selectedIds.size).toBe(words.length);
          words.forEach(word => {
            expect(selectedIds.has(word.id)).toBe(true);
          });
        }),
        { numRuns: 3 }
      );
    });
  });

  describe('属性 6: 循环模式序列连续性', () => {
    it('对于任意单词序列，在循环模式下，序列应该连续且循环', () => {
      fc.assert(
        fc.property(wordsArrayArbitrary, (words) => {
          const strategy = new LoopStrategy();
          strategy.initialize(words);

          // 测试一轮完整循环
          for (let i = 0; i < words.length; i++) {
            const nextWord = strategy.getNextWord();
            expect(nextWord).not.toBeNull();
            
            if (nextWord) {
              // 验证顺序正确
              expect(nextWord.id).toBe(words[i].id);
            }
          }
        }),
        { numRuns: 3 }
      );
    });
  });

  describe('属性 8: 循环计数递增性', () => {
    it('对于循环模式，每完成一轮所有单词的学习后，循环计数应该恰好增加 1', () => {
      fc.assert(
        fc.property(wordsArrayArbitrary, (words) => {
          const strategy = new LoopStrategy();
          strategy.initialize(words);

          let initialLoopCount = strategy.getProgress().loopCount;
          expect(initialLoopCount).toBe(0);

          // 完成一轮
          for (let i = 0; i < words.length; i++) {
            strategy.getNextWord();
          }

          let afterOneRound = strategy.getProgress().loopCount;
          expect(afterOneRound).toBe(1);
        }),
        { numRuns: 3 }
      );
    });
  });

  describe('属性 9: 随机循环排列完整性', () => {
    it('对于任意单词集合，在随机循环模式的每一轮中，展示的单词集合应该是原集合的一个排列', () => {
      fc.assert(
        fc.property(wordsArrayArbitrary, (words) => {
          const strategy = new RandomLoopStrategy();
          strategy.initialize(words);

          const selectedIds = new Set<number>();
          
          for (let i = 0; i < words.length; i++) {
            const nextWord = strategy.getNextWord();
            expect(nextWord).not.toBeNull();
            
            if (nextWord) {
              selectedIds.add(nextWord.id);
            }
          }

          // 验证是完整排列
          expect(selectedIds.size).toBe(words.length);
          words.forEach(word => {
            expect(selectedIds.has(word.id)).toBe(true);
          });
        }),
        { numRuns: 3 }
      );
    });
  });
});