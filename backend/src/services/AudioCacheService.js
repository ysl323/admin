import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import archiver from 'archiver';
import AdmZip from 'adm-zip';
import { AudioCache, sequelize } from '../models/index.js';
import { Op } from 'sequelize';
import logger from '../utils/logger.js';

/**
 * 音频缓存服务
 * 管理 TTS 音频的缓存存储和查询
 */
class AudioCacheService {
  constructor() {
    // 缓存目录路径
    this.cacheDir = path.join(process.cwd(), 'audio-cache');
    this.initCacheDirectory();
  }

  /**
   * 初始化缓存目录
   */
  async initCacheDirectory() {
    try {
      await fs.mkdir(this.cacheDir, { recursive: true });
      logger.info(`音频缓存目录已初始化: ${this.cacheDir}`);
    } catch (error) {
      logger.error('初始化缓存目录失败:', error);
    }
  }

  /**
   * 生成缓存键（文本的 MD5 哈希）
   * @param {string} text - 文本内容
   * @returns {string} MD5 哈希值
   */
  generateCacheKey(text) {
    return crypto.createHash('md5').update(text.trim().toLowerCase()).digest('hex');
  }

  /**
   * 查询缓存
   * @param {string} text - 文本内容
   * @returns {Promise<Object|null>} 缓存记录或 null
   */
  async getCache(text) {
    try {
      const cacheKey = this.generateCacheKey(text);
      const cache = await AudioCache.findOne({
        where: { cacheKey }
      });

      if (cache) {
        // 更新访问统计
        await cache.update({
          hitCount: cache.hitCount + 1,
          lastAccessedAt: new Date()
        });

        logger.info(`缓存命中: ${text.substring(0, 50)}... (key: ${cacheKey})`);
        return cache;
      }

      logger.info(`缓存未命中: ${text.substring(0, 50)}... (key: ${cacheKey})`);
      return null;
    } catch (error) {
      logger.error('查询缓存失败:', error);
      return null;
    }
  }

  /**
   * 保存音频到缓存
   * @param {string} text - 文本内容
   * @param {Buffer} audioBuffer - 音频数据
   * @param {string} provider - TTS 提供商
   * @returns {Promise<Object>} 缓存记录
   */
  async saveCache(text, audioBuffer, provider = 'volcengine') {
    try {
      const cacheKey = this.generateCacheKey(text);
      
      // 检查是否已存在
      const existing = await AudioCache.findOne({ where: { cacheKey } });
      if (existing) {
        logger.info(`缓存已存在，跳过保存: ${cacheKey}`);
        return existing;
      }

      // 生成文件名和路径
      const fileName = `${cacheKey}.mp3`;
      const filePath = path.join(this.cacheDir, fileName);

      // 保存音频文件
      await fs.writeFile(filePath, audioBuffer);

      // 保存元数据到数据库
      const cache = await AudioCache.create({
        cacheKey,
        text,
        filePath: fileName, // 只存储文件名，不存储完整路径
        fileSize: audioBuffer.length,
        provider,
        hitCount: 0,
        lastAccessedAt: new Date()
      });

      logger.info(`音频已缓存: ${text.substring(0, 50)}... (size: ${audioBuffer.length} bytes)`);
      return cache;
    } catch (error) {
      logger.error('保存缓存失败:', error);
      throw error;
    }
  }

  /**
   * 读取缓存的音频文件
   * @param {Object} cache - 缓存记录
   * @returns {Promise<Buffer>} 音频数据
   */
  async readCacheFile(cache) {
    try {
      const filePath = path.join(this.cacheDir, cache.filePath);
      const audioBuffer = await fs.readFile(filePath);
      return audioBuffer;
    } catch (error) {
      logger.error(`读取缓存文件失败: ${cache.filePath}`, error);
      throw error;
    }
  }

  /**
   * 获取所有缓存列表
   * @param {Object} options - 查询选项
   * @returns {Promise<Object>} 缓存列表和统计信息
   */
  async listCaches(options = {}) {
    try {
      const { search, provider, limit = 100, offset = 0, orderBy = 'createdAt', order = 'DESC' } = options;

      const where = {};
      if (search) {
        where.text = { [Op.like]: `%${search}%` };
      }
      if (provider) {
        where.provider = provider;
      }

      const { count, rows } = await AudioCache.findAndCountAll({
        where,
        limit,
        offset,
        order: [[orderBy, order]]
      });

      // 计算统计信息
      const stats = await this.getStatistics();

      return {
        caches: rows,
        total: count,
        stats
      };
    } catch (error) {
      logger.error('获取缓存列表失败:', error);
      throw error;
    }
  }

  /**
   * 获取缓存统计信息
   * @returns {Promise<Object>} 统计信息
   */
  async getStatistics() {
    try {
      const totalCount = await AudioCache.count();
      const totalSize = await AudioCache.sum('fileSize') || 0;
      const totalHits = await AudioCache.sum('hitCount') || 0;

      // 按提供商统计
      const byProvider = await AudioCache.findAll({
        attributes: [
          'provider',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
          [sequelize.fn('SUM', sequelize.col('file_size')), 'size']
        ],
        group: ['provider']
      });

      return {
        totalCount,
        totalSize,
        totalHits,
        averageSize: totalCount > 0 ? Math.round(totalSize / totalCount) : 0,
        hitRate: totalCount > 0 ? (totalHits / totalCount).toFixed(2) : 0,
        byProvider: byProvider.map(p => ({
          provider: p.provider,
          count: parseInt(p.getDataValue('count')),
          size: parseInt(p.getDataValue('size') || 0)
        }))
      };
    } catch (error) {
      logger.error('获取统计信息失败:', error);
      throw error;
    }
  }

  /**
   * 删除单个缓存
   * @param {number} id - 缓存 ID
   * @returns {Promise<boolean>} 是否成功
   */
  async deleteCache(id) {
    try {
      const cache = await AudioCache.findByPk(id);
      if (!cache) {
        throw new Error('缓存不存在');
      }

      // 删除文件
      const filePath = path.join(this.cacheDir, cache.filePath);
      try {
        await fs.unlink(filePath);
      } catch (error) {
        logger.warn(`删除缓存文件失败: ${filePath}`, error);
      }

      // 删除数据库记录
      await cache.destroy();

      logger.info(`缓存已删除: ${cache.text.substring(0, 50)}...`);
      return true;
    } catch (error) {
      logger.error('删除缓存失败:', error);
      throw error;
    }
  }

  /**
   * 批量删除缓存
   * @param {number[]} ids - 缓存 ID 数组
   * @returns {Promise<Object>} 删除结果
   */
  async batchDeleteCaches(ids) {
    const results = {
      success: [],
      failed: []
    };

    for (const id of ids) {
      try {
        await this.deleteCache(id);
        results.success.push(id);
      } catch (error) {
        results.failed.push({ id, error: error.message });
      }
    }

    return results;
  }

  /**
   * 清空所有缓存
   * @returns {Promise<number>} 删除的数量
   */
  async clearAllCaches() {
    try {
      const caches = await AudioCache.findAll();
      
      // 删除所有文件
      for (const cache of caches) {
        const filePath = path.join(this.cacheDir, cache.filePath);
        try {
          await fs.unlink(filePath);
        } catch (error) {
          logger.warn(`删除缓存文件失败: ${filePath}`, error);
        }
      }

      // 删除所有数据库记录
      const count = await AudioCache.destroy({ where: {}, truncate: true });

      logger.info(`已清空所有缓存: ${count} 条记录`);
      return count;
    } catch (error) {
      logger.error('清空缓存失败:', error);
      throw error;
    }
  }

  /**
   * 导出所有音频文件为 ZIP
   * @returns {Promise<Buffer>} ZIP 文件的 Buffer
   */
  async exportAllAudioFiles() {
    return new Promise(async (resolve, reject) => {
      try {
        const caches = await AudioCache.findAll({
          order: [['createdAt', 'DESC']]
        });

        if (caches.length === 0) {
          throw new Error('没有可导出的音频文件');
        }

        // 创建 ZIP 归档
        const archive = archiver('zip', {
          zlib: { level: 9 } // 最高压缩级别
        });

        const chunks = [];

        // 收集数据
        archive.on('data', (chunk) => {
          chunks.push(chunk);
        });

        // 完成时返回 Buffer
        archive.on('end', () => {
          const buffer = Buffer.concat(chunks);
          logger.info(`音频文件导出完成: ${caches.length} 个文件, ${buffer.length} 字节`);
          resolve(buffer);
        });

        // 错误处理
        archive.on('error', (err) => {
          logger.error('创建 ZIP 归档失败:', err);
          reject(err);
        });

        // 添加元数据文件
        const metadata = caches.map(cache => ({
          fileName: cache.filePath,
          text: cache.text,
          provider: cache.provider,
          cacheKey: cache.cacheKey,
          fileSize: cache.fileSize,
          hitCount: cache.hitCount,
          createdAt: cache.createdAt,
          lastAccessedAt: cache.lastAccessedAt
        }));

        archive.append(JSON.stringify(metadata, null, 2), { name: 'metadata.json' });

        // 添加所有音频文件
        for (const cache of caches) {
          const filePath = path.join(this.cacheDir, cache.filePath);
          try {
            // 检查文件是否存在
            await fs.access(filePath);
            
            // 添加文件到归档，使用更友好的文件名
            const friendlyName = `${cache.text.substring(0, 50).replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_')}_${cache.cacheKey.substring(0, 8)}.mp3`;
            archive.file(filePath, { name: `audio/${friendlyName}` });
          } catch (error) {
            logger.warn(`跳过不存在的文件: ${filePath}`);
          }
        }

        // 完成归档
        archive.finalize();
      } catch (error) {
        logger.error('导出音频文件失败:', error);
        reject(error);
      }
    });
  }

  /**
   * 导入音频文件（从ZIP）
   * @param {Buffer} zipBuffer - ZIP 文件的 Buffer
   * @returns {Promise<Object>} 导入结果
   */
  async importAudioFiles(zipBuffer) {
    try {
      const zip = new AdmZip(zipBuffer);
      const zipEntries = zip.getEntries();

      let imported = 0;
      let skipped = 0;
      let errors = [];

      // 读取元数据
      const metadataEntry = zipEntries.find(entry => entry.entryName === 'metadata.json');
      if (!metadataEntry) {
        throw new Error('ZIP 文件中缺少 metadata.json');
      }

      const metadata = JSON.parse(metadataEntry.getData().toString('utf8'));
      logger.info(`开始导入 ${metadata.length} 个音频缓存`);

      // 导入每个音频文件
      for (const meta of metadata) {
        try {
          // 检查是否已存在
          const existing = await AudioCache.findOne({
            where: { cacheKey: meta.cacheKey }
          });

          if (existing) {
            skipped++;
            logger.info(`跳过已存在的缓存: ${meta.cacheKey}`);
            continue;
          }

          // 查找对应的音频文件
          // 先尝试用原始 fileName 匹配，再用 cacheKey 前8位匹配
          let audioEntry = zipEntries.find(entry => 
            entry.entryName === meta.fileName || 
            entry.entryName.endsWith('/' + meta.fileName)
          );

          // 如果找不到，尝试用 cacheKey 前8位匹配
          if (!audioEntry) {
            const cacheKeyPrefix = meta.cacheKey.substring(0, 8);
            audioEntry = zipEntries.find(entry => {
              const name = entry.entryName.toLowerCase();
              return name.includes(cacheKeyPrefix.toLowerCase()) && name.endsWith('.mp3');
            });
          }

          if (!audioEntry) {
            errors.push({ cacheKey: meta.cacheKey, error: '找不到对应的音频文件' });
            continue;
          }

          // 保存音频文件
          const audioBuffer = audioEntry.getData();
          const fileName = `${meta.cacheKey}.mp3`;
          const filePath = path.join(this.cacheDir, fileName);
          await fs.writeFile(filePath, audioBuffer);

          // 创建数据库记录
          await AudioCache.create({
            cacheKey: meta.cacheKey,
            text: meta.text,
            filePath: fileName,
            fileSize: audioBuffer.length,
            provider: meta.provider || 'volcengine',
            hitCount: meta.hitCount || 0,
            lastAccessedAt: meta.lastAccessedAt || new Date()
          });

          imported++;
          logger.info(`成功导入缓存: ${meta.text.substring(0, 50)}...`);
        } catch (error) {
          errors.push({ 
            cacheKey: meta.cacheKey, 
            text: meta.text.substring(0, 50),
            error: error.message 
          });
          logger.error(`导入缓存失败: ${meta.text}`, error);
        }
      }

      const result = {
        imported,
        skipped,
        errors,
        total: metadata.length
      };

      logger.info(`导入完成: 成功 ${imported}, 跳过 ${skipped}, 失败 ${errors.length}`);
      return result;
    } catch (error) {
      logger.error('导入音频文件失败:', error);
      throw error;
    }
  }
}

export default new AudioCacheService();
