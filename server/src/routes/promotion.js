// server/src/routes/promotion.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const crypto = require('crypto');

// 生成推广链接
router.get('/share/:houseId', async (req, res) => {
  try {
    const { houseId } = req.params;
    const [houses] = await db.query(`SELECT * FROM houses WHERE id = ?`, [houseId]);
    if (houses.length === 0) return res.status(404).json({ code: 1, message: '房源不存在' });
    
    const house = houses[0];
    const shareCode = crypto.randomBytes(8).toString('hex');
    const shareUrl = `https://api.example.com/house/${shareCode}`;
    
    await db.query(`INSERT INTO share_links (house_id, share_code, url, expires_at) VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL 30 DAY))`, [houseId, shareCode, shareUrl]);
    
    res.json({
      code: 0,
      data: {
        house_id: houseId, share_code: shareCode, share_url: shareUrl,
        house_info: { community: house.community, address: house.address, monthly_rent: house.monthly_rent, status: house.status === 0 ? '空置' : '已出租' }
      }
    });
  } catch (err) { res.status(500).json({ code: 1, message: err.message }); }
});

// 获取推广统计
router.get('/stats/:houseId', async (req, res) => {
  try {
    const { houseId } = req.params;
    const [links] = await db.query(`SELECT * FROM share_links WHERE house_id = ? ORDER BY created_at DESC`, [houseId]);
    const totalViews = links.reduce((sum, l) => sum + (l.views || 0), 0);
    const totalInquiries = links.reduce((sum, l) => sum + (l.inquiries || 0), 0);
    res.json({ code: 0, data: { house_id: houseId, total_links: links.length, total_views: totalViews, total_inquiries: totalInquiries, links } });
  } catch (err) { res.status(500).json({ code: 1, message: err.message }); }
});

// 记录浏览
router.post('/view/:shareCode', async (req, res) => {
  try {
    await db.query(`UPDATE share_links SET views = COALESCE(views, 0) + 1 WHERE share_code = ?`, [req.params.shareCode]);
    res.json({ code: 0, message: '浏览已记录' });
  } catch (err) { res.status(500).json({ code: 1, message: err.message }); }
});

// 发布到平台
router.post('/publish', async (req, res) => {
  try {
    const { house_id, platform, description } = req.body;
    const platforms = ['58同城', '贝壳', '闲鱼', '百姓网'];
    if (!platforms.includes(platform)) return res.status(400).json({ code: 1, message: '不支持的平台' });
    
    const [houses] = await db.query(`SELECT * FROM houses WHERE id = ?`, [house_id]);
    if (houses.length === 0) return res.status(404).json({ code: 1, message: '房源不存在' });
    
    const house = houses[0];
    const publishId = `PUB${Date.now()}`;
    await db.query(`INSERT INTO listing_publish_logs (house_id, platform, publish_id, title, description, status, published_at) VALUES (?, ?, ?, ?, ?, 'published', NOW())`, [house_id, platform, publishId, `${house.community} ${house.address}`, description || '']);
    
    res.json({ code: 0, message: `已发布到${platform}`, data: { publish_id: publishId, platform, title: `${house.community} ${house.address}`, monthly_rent: house.monthly_rent, status: 'published', published_at: new Date().toISOString() } });
  } catch (err) { res.status(500).json({ code: 1, message: err.message }); }
});

// 获取发布记录
router.get('/logs/:houseId', async (req, res) => {
  try {
    const [logs] = await db.query(`SELECT * FROM listing_publish_logs WHERE house_id = ? ORDER BY created_at DESC`, [req.params.houseId]);
    res.json({ code: 0, data: logs });
  } catch (err) { res.status(500).json({ code: 1, message: err.message }); }
});

module.exports = router;
