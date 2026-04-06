/**
 * 元音组合高亮标注工具
 * 用于识别并标注单词中的元音和元音组合
 */

// 元音组合配置（按长度降序，优先匹配长组合）
const VOWEL_PATTERNS = {
  // 三元音
  threeVowels: ['igh', 'augh', 'eigh', 'ough'],
  
  // 双元音
  diphthongs: ['ai', 'ay', 'ea', 'ee', 'ei', 'eu', 'ie', 'oa', 'oe', 'oi', 'oo', 'ou', 'ow', 'oy', 'ue', 'ui', 'ew'],
  
  // R控制
  rControlled: ['ar', 'er', 'ir', 'or', 'ur'],
  
  // 单个元音
  singleVowels: ['a', 'e', 'i', 'o', 'u', 'y']
};

/**
 * 识别并标注单词中的元音组合
 * @param {string} word - 要标注的单词
 * @returns {string} 带HTML标注的字符串
 */
function highlightVowels(word) {
  if (!word || typeof word !== 'string') {
    return word;
  }

  const result = [];
  let i = 0;

  while (i < word.length) {
    let matched = false;

    // 1. 尝试匹配三元音
    for (const pattern of VOWEL_PATTERNS.threeVowels) {
      if (matchPattern(word, i, pattern)) {
        result.push(`<u>${word.substr(i, 3)}</u>`);
        i += 3;
        matched = true;
        break;
      }
    }

    // 2. 尝试匹配双元音
    if (!matched) {
      for (const pattern of VOWEL_PATTERNS.diphthongs) {
        if (matchPattern(word, i, pattern)) {
          result.push(`<u>${word.substr(i, 2)}</u>`);
          i += 2;
          matched = true;
          break;
        }
      }
    }

    // 3. 尝试匹配R控制
    if (!matched) {
      for (const pattern of VOWEL_PATTERNS.rControlled) {
        if (matchPattern(word, i, pattern)) {
          result.push(`<u>${word.substr(i, 2)}</u>`);
          i += 2;
          matched = true;
          break;
        }
      }
    }

    // 4. 尝试匹配单个元音
    if (!matched) {
      for (const vowel of VOWEL_PATTERNS.singleVowels) {
        if (matchPattern(word, i, vowel)) {
          result.push(`<u>${word[i]}</u>`);
          i += 1;
          matched = true;
          break;
        }
      }
    }

    // 5. 非元音字符（辅音、标点、空格等）
    if (!matched) {
      result.push(word[i]);
      i += 1;
    }
  }

  return result.join('');
}

/**
 * 检查字符串是否匹配指定模式（忽略大小写）
 * @param {string} text - 原始文本
 * @param {number} startIndex - 开始索引
 * @param {string} pattern - 要匹配的模式
 * @returns {boolean} 是否匹配
 */
function matchPattern(text, startIndex, pattern) {
  if (startIndex + pattern.length > text.length) {
    return false;
  }
  
  const substring = text.substr(startIndex, pattern.length);
  return substring.toLowerCase() === pattern.toLowerCase();
}

/**
 * 对句子或短语进行元音高亮标注
 * @param {string} text - 要标注的文本
 * @returns {string} 带HTML标注的字符串
 */
function highlightText(text) {
  if (!text || typeof text !== 'string') {
    return text;
  }

  // 按空格分割单词，保留空格
  const words = text.split(/(\s+)/);
  
  return words.map(word => {
    // 如果是空格，直接返回
    if (/^\s+$/.test(word)) {
      return word;
    }
    // 否则对单词进行标注
    return highlightVowels(word);
  }).join('');
}

export default {
  highlightVowels,
  highlightText
};
