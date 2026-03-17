// server/src/routes/upload.js - 文件上传
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const storage = require('../storage');

// 配置multer
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// 通用文件上传
router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ code: 1, message: '请选择文件' });
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

// 房源照片上传
router.post('/house', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ code: 1, message: '请选择图片' });
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
    
    const result = await storage.upload(req.file.buffer, req.file.originalname, 'contracts');
    res.json({ code: 0, data: { url: result.url } });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 报修照片上传
router.post('/repair', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ code: 1, message: '请选择图片' });
    }
    
    const result = await storage.upload(req.file.buffer, req.file.originalname, 'repairs');
    res.json({ code: 0, data: { url: result.url } });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

module.exports = router;
