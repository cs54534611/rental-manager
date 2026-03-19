// server/src/routes/houses.js - 房源管理
const express = require('express');
const router = express.Router();
const db = require('../db');
const { v4: uuidv4 } = require('uuid');

// 获取房源列表
router.get('/', async (req, res) => {
  try {
    const { status, keyword, page = 1, pageSize = 20 } = req.query;
    let sql = 'SELECT * FROM houses WHERE is_deleted = 0';
    let params = [];
    
    if (status !== undefined && status !== '') {
      sql += ' AND status = ?';
      params.push(status);
    }
    if (keyword) {
      sql += ' AND (community LIKE ? OR address LIKE ? OR house_no LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
    }
    
    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(pageSize), (parseInt(page) - 1) * parseInt(pageSize));
    
    const [rows] = await db.query(sql, params);
    
    // 转换JSON字段（兼容普通字符串和JSON格式）
    const houses = rows.map(h => {
      let tags = [], photos = [], facilities = [];
      try { tags = h.tags ? JSON.parse(h.tags) : []; } catch(e) { tags = typeof h.tags === 'string' ? h.tags.split(',').filter(t=>t) : []; }
      try { photos = h.photos ? JSON.parse(h.photos) : []; } catch(e) { photos = []; }
      try { facilities = h.facilities ? JSON.parse(h.facilities) : []; } catch(e) { facilities = typeof h.facilities === 'string' ? h.facilities.split(',').filter(t=>t) : []; }
      return { ...h, tags, photos, facilities };
    });
    
    // 获取总数
    let countSql = 'SELECT COUNT(*) as total FROM houses WHERE is_deleted = 0';
    let countParams = [];
    if (status !== undefined && status !== '') {
      countSql += ' AND status = ?';
      countParams.push(status);
    }
    if (keyword) {
      countSql += ' AND (community LIKE ? OR address LIKE ? OR house_no LIKE ?)';
      countParams.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
    }
    const [[{ total }]] = await db.query(countSql, countParams);
    
    res.json({ code: 0, data: { list: houses, total, page: parseInt(page), pageSize: parseInt(pageSize) } });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 获取房源详情
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM houses WHERE id = ? AND is_deleted = 0', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ code: 1, message: '房源不存在' });
    }
    const house = {
      ...rows[0],
      tags: (() => { try { return rows[0].tags ? JSON.parse(rows[0].tags) : []; } catch(e) { return typeof rows[0].tags === 'string' ? rows[0].tags.split(',').filter(t=>t) : []; } })(),
      photos: (() => { try { return rows[0].photos ? JSON.parse(rows[0].photos) : []; } catch(e) { return []; } })(),
      facilities: (() => { try { return rows[0].facilities ? JSON.parse(rows[0].facilities) : []; } catch(e) { return typeof rows[0].facilities === 'string' ? rows[0].facilities.split(',').filter(t=>t) : []; } })()
    };
    res.json({ code: 0, data: house });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 添加房源
router.post('/', async (req, res) => {
  try {
    const { community, address, layout, area, floor, orientation, decoration, rent, deposit, tags, photos, facilities, remark } = req.body;
    const houseNo = 'RZ-' + Date.now();
    
    const [result] = await db.query(
      `INSERT INTO houses (house_no, community, address, layout, area, floor, orientation, decoration, rent, deposit, tags, photos, facilities, remark) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [houseNo, community, address, layout, area, floor, orientation, decoration, rent, deposit, 
       JSON.stringify(tags || []), JSON.stringify(photos || []), JSON.stringify(facilities || []), remark || '']
    );
    
    res.json({ code: 0, message: '添加成功', data: { id: result.insertId, house_no: houseNo } });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 更新房源 - 支持部分更新
router.put('/:id', async (req, res) => {
  try {
    const { community, address, layout, area, floor, orientation, decoration, rent, deposit, status, tags, photos, facilities, remark } = req.body;
    
    // 构建动态更新语句，只更新传入的字段
    const updates = [];
    const values = [];
    
    if (community !== undefined) { updates.push('community=?'); values.push(community); }
    if (address !== undefined) { updates.push('address=?'); values.push(address); }
    if (layout !== undefined) { updates.push('layout=?'); values.push(layout); }
    if (area !== undefined) { updates.push('area=?'); values.push(area); }
    if (floor !== undefined) { updates.push('floor=?'); values.push(floor); }
    if (orientation !== undefined) { updates.push('orientation=?'); values.push(orientation); }
    if (decoration !== undefined) { updates.push('decoration=?'); values.push(decoration); }
    if (rent !== undefined) { updates.push('rent=?'); values.push(rent); }
    if (deposit !== undefined) { updates.push('deposit=?'); values.push(deposit); }
    if (status !== undefined) { updates.push('status=?'); values.push(status); }
    if (tags !== undefined) { updates.push('tags=?'); values.push(JSON.stringify(tags)); }
    if (photos !== undefined) { updates.push('photos=?'); values.push(JSON.stringify(photos)); }
    if (facilities !== undefined) { updates.push('facilities=?'); values.push(JSON.stringify(facilities)); }
    if (remark !== undefined) { updates.push('remark=?'); values.push(remark); }
    
    if (updates.length === 0) {
      return res.json({ code: 0, message: '没有需要更新的字段' });
    }
    
    values.push(req.params.id);
    await db.query(`UPDATE houses SET ${updates.join(',')} WHERE id=?`, values);
    
    res.json({ code: 0, message: '更新成功' });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 删除房源（逻辑删除）
router.delete('/:id', async (req, res) => {
  try {
    await db.query('UPDATE houses SET is_deleted = 1 WHERE id = ?', [req.params.id]);
    res.json({ code: 0, message: '删除成功' });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 更新房源状态
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    await db.query('UPDATE houses SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ code: 0, message: '状态更新成功' });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 上传房源照片
router.post('/upload/:id/photo', async (req, res) => {
  try {
    const { photo } = req.body; // base64 或 URL
    
    // 获取现有照片
    const [rows] = await db.query('SELECT photos FROM houses WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ code: 1, message: '房源不存在' });
    }
    
    let photos = [];
    try {
      photos = rows[0].photos ? JSON.parse(rows[0].photos) : [];
    } catch(e) {
      photos = [];
    }
    
    // 添加新照片
    if (photo) {
      photos.push(photo);
    }
    
    await db.query('UPDATE houses SET photos = ? WHERE id = ?', [JSON.stringify(photos), req.params.id]);
    
    res.json({ code: 0, message: '照片上传成功', data: { photos } });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 删除房源照片
router.delete('/upload/:id/photo', async (req, res) => {
  try {
    const { photo_index } = req.body;
    
    const [rows] = await db.query('SELECT photos FROM houses WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ code: 1, message: '房源不存在' });
    }
    
    let photos = [];
    try {
      photos = rows[0].photos ? JSON.parse(rows[0].photos) : [];
    } catch(e) {
      photos = [];
    }
    
    // 删除指定索引的照片
    if (photo_index >= 0 && photo_index < photos.length) {
      photos.splice(photo_index, 1);
    }
    
    await db.query('UPDATE houses SET photos = ? WHERE id = ?', [JSON.stringify(photos), req.params.id]);
    
    res.json({ code: 0, message: '照片删除成功', data: { photos } });
  } catch (err) {
    res.status(500).json(500, { code: 1, message: err.message });
  }
});

module.exports = router;
