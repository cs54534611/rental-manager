// server/src/routes/upload.js - 文件上传（安全版）
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const storage = require('../storage');

// 允许的文件类型
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_DOC_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const ALLOWED_ALL = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOC_TYPES];

// 配置multer
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.doc', '.docx'];
    
    if (allowedExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('不支持的文件类型'), false);
    }
  }
});

// 通用文件上传
router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ code: 1, message: '请选择文件' });
    }
    
    // 验证文件类型
    if (!ALLOWED_ALL.includes(req.file.mimetype)) {
      return res.status(400).json({ code: 1, message: '文件类型不允许' });
    }
    
    const folder = req.body.folder || 'misc';
    const result = await storage.upload(req.file.buffer, req.file.originalname, folder);
    
    res.json({ 
      code: 0, 
      message: '上传成功', 
      data: { url: result.url } 
    });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 房源照片上传（仅图片）
router.post('/house', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ code: 1, message: '请选择图片' });
    }
    
    // 验证文件类型
    if (!ALLOWED_IMAGE_TYPES.includes(req.file.mimetype)) {
      return res.status(400).json({ code: 1, message: '仅支持图片文件' });
    }
    
    const result = await storage.upload(req.file.buffer, req.file.originalname, 'houses');
    res.json({ code: 0, data: { url: result.url } });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 合同附件上传
router.post('/contract', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ code: 1, message: '请选择文件' });
    }
    
    // 验证文件类型
    if (!ALLOWED_DOC_TYPES.includes(req.file.mimetype)) {
      return res.status(400).json({ code: 1, message: '仅支持PDF和Word文档' });
    }
    
    const result = await storage.upload(req.file.buffer, req.file.originalname, 'contracts');
    res.json({ code: 0, data: { url: result.url } });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 报修照片上传（仅图片）
router.post('/repair', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ code: 1, message: '请选择图片' });
    }
    
    // 验证文件类型
    if (!ALLOWED_IMAGE_TYPES.includes(req.file.mimetype)) {
      return res.status(400).json({ code: 1, message: '仅支持图片文件' });
    }
    
    const result = await storage.upload(req.file.buffer, req.file.originalname, 'repairs');
    res.json({ code: 0, data: { url: result.url } });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

module.exports = router;
