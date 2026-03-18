// server/src/storage.js - 文件存储模块
const fs = require('fs');
const path = require('path');

// 存储配置
const STORAGE_DIR = path.join(__dirname, '..', 'uploads');

// 确保目录存在
if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

/**
 * 本地存储上传
 * @param {Buffer} fileBuffer 文件内容
 * @param {string} filename 文件名
 * @param {string} folder 目录分类
 * @returns {Promise<{url: string, path: string}>}
 */
async function uploadLocal(fileBuffer, filename, folder = 'misc') {
  const ext = path.extname(filename);
  const timestamp = Date.now();
  const newFilename = `${folder}/${timestamp}${ext}`;
  const dirPath = path.join(STORAGE_DIR, folder);
  
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  
  const filePath = path.join(STORAGE_DIR, newFilename);
  fs.writeFileSync(filePath, fileBuffer);
  
  return {
    url: `/uploads/${newFilename}`,
    path: filePath
  };
}

/**
 * 阿里云OSS上传（需配置）
 */
async function uploadAliyun(fileBuffer, filename, folder = 'misc') {
  const OSS = require('ali-oss');
  const config = getStorageConfig('aliyun');
  
  if (!config || !config.enabled) {
    throw new Error('阿里云OSS未配置');
  }
  
  const client = new OSS({
    region: config.region,
    accessKeyId: config.access_key_id,
    accessKeySecret: config.access_key_secret,
    bucket: config.bucket
  });
  
  const ext = path.extname(filename);
  const key = `${folder}/${Date.now()}${ext}`;
  
  const result = await client.put(key, fileBuffer);
  
  return {
    url: result.url,
    key: key
  };
}

/**
 * 腾讯云COS上传（需配置）
 */
async function uploadTencent(fileBuffer, filename, folder = 'misc') {
  const COS = require('cos-nodejs-sdk-v5');
  const config = getStorageConfig('tencent');
  
  if (!config || !config.enabled) {
    throw new Error('腾讯云COS未配置');
  }
  
  const cos = new COS({
    SecretId: config.access_key_id,
    SecretKey: config.access_key_secret
  });
  
  const ext = path.extname(filename);
  const key = `${folder}/${Date.now()}${ext}`;
  
  return new Promise((resolve, reject) => {
    cos.putObject({
      Bucket: config.bucket,
      Region: config.region,
      Key: key,
      Body: fileBuffer
    }, (err, data) => {
      if (err) reject(err);
      else resolve({ url: `https://${config.domain || config.bucket + '.cos.' + config.region + '.myqcloud.com/' + key}` });
    });
  });
}

/**
 * 统一上传接口
 */
async function upload(fileBuffer, filename, folder = 'misc') {
  // 从数据库获取当前存储配置
  const db = require('./db');
  let provider = 'local';
  
  try {
    const [rows] = await db.query('SELECT * FROM storage_config WHERE enabled = 1');
    if (rows.length > 0) {
      provider = rows[0].provider;
    }
  } catch (e) {
    console.log('使用本地存储');
  }
  
  switch (provider) {
    case 'aliyun':
      return uploadAliyun(fileBuffer, filename, folder);
    case 'tencent':
      return uploadTencent(fileBuffer, filename, folder);
    default:
      return uploadLocal(fileBuffer, filename, folder);
  }
}

/**
 * 获取存储配置
 */
async function getStorageConfig(provider) {
  const db = require('./db');
  try {
    const [rows] = await db.query('SELECT * FROM storage_config WHERE provider = ? AND enabled = 1', [provider]);
    return rows[0] || null;
  } catch (e) {
    return null;
  }
}

module.exports = {
  upload,
  uploadLocal,
  STORAGE_DIR
};
