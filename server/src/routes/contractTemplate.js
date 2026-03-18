// server/src/routes/contractTemplate.js - 合同模板管理
const express = require('express');
const router = express.Router();
const db = require('../db');

// 数字转中文
function numberToChinese(num) {
  const cn = '零一二三四五六七八九';
  const unit = ['', '十', '百', '千', '万'];
  if (num <= 0) return '零';
  let result = '';
  let str = num.toString();
  for (let i = 0; i < str.length; i++) {
    result += cn[parseInt(str[i])];
    if (str.length - i - 1 > 0) result += unit[str.length - i - 1];
  }
  return result.replace(/零[十百千]/g, '零').replace(/零+$/, '');
}

// 获取模板列表
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM contract_templates ORDER BY is_default DESC, created_at DESC');
    res.json({ code: 0, data: rows });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 获取模板详情
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM contract_templates WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ code: 1, message: '模板不存在' });
    }
    res.json({ code: 0, data: rows[0] });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 添加模板
router.post('/', async (req, res) => {
  try {
    const { name, content, is_default } = req.body;
    
    if (is_default) {
      await db.query('UPDATE contract_templates SET is_default = 0');
    }
    
    const [result] = await db.query(
      'INSERT INTO contract_templates (name, content, is_default) VALUES (?, ?, ?)',
      [name, content, is_default || 0]
    );
    
    res.json({ code: 0, message: '添加成功', data: { id: result.insertId } });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 更新模板
router.put('/:id', async (req, res) => {
  try {
    const { name, content, is_default } = req.body;
    
    if (is_default) {
      await db.query('UPDATE contract_templates SET is_default = 0');
    }
    
    await db.query(
      'UPDATE contract_templates SET name = ?, content = ?, is_default = ? WHERE id = ?',
      [name, content, is_default || 0, req.params.id]
    );
    
    res.json({ code: 0, message: '更新成功' });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 删除模板
router.delete('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT is_default FROM contract_templates WHERE id = ?', [req.params.id]);
    if (rows.length > 0 && rows[0].is_default) {
      return res.status(400).json({ code: 1, message: '不能删除默认模板' });
    }
    
    await db.query('DELETE FROM contract_templates WHERE id = ?', [req.params.id]);
    res.json({ code: 0, message: '删除成功' });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 生成合同预览
router.post('/preview', async (req, res) => {
  try {
    const { template_id, data } = req.body;
    
    // 获取模板
    let template;
    if (template_id) {
      const [rows] = await db.query('SELECT * FROM contract_templates WHERE id = ?', [template_id]);
      if (rows.length === 0) return res.status(404).json({ code: 1, message: '模板不存在' });
      template = rows[0].content;
    } else {
      const [rows] = await db.query('SELECT content FROM contract_templates WHERE is_default = 1');
      if (rows.length === 0) return res.status(404).json({ code: 1, message: '请先创建模板' });
      template = rows[0].content;
    }
    
    // 获取房东信息
    const [owners] = await db.query('SELECT * FROM settings WHERE type = "owner" LIMIT 1');
    const owner = owners[0] || {};
    
    // 获取租客信息
    const [tenants] = await db.query('SELECT * FROM tenants WHERE id = ?', [data.tenant_id]);
    const tenant = tenants[0] || {};
    
    // 获取房屋信息
    const [houses] = await db.query('SELECT * FROM houses WHERE id = ?', [data.house_id]);
    const house = houses[0] || {};
    
    // 计算租期
    const startDate = new Date(data.start_date);
    const endDate = new Date(data.end_date);
    const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth()) + 1;
    
    // 替换变量
    let content = template
      .replace(/{{owner_name}}/g, owner.name || '')
      .replace(/{{owner_idcard}}/g, owner.idcard || '')
      .replace(/{{owner_phone}}/g, owner.phone || '')
      .replace(/{{tenant_name}}/g, tenant.name || '')
      .replace(/{{tenant_idcard}}/g, tenant.idcard || '')
      .replace(/{{tenant_phone}}/g, tenant.phone || '')
      .replace(/{{house_address}}/g, house.address || '')
      .replace(/{{start_date}}/g, data.start_date || '')
      .replace(/{{end_date}}/g, data.end_date || '')
      .replace(/{{months}}/g, months)
      .replace(/{{monthly_rent}}/g, data.monthly_rent || '')
      .replace(/{{monthly_rent_cn}}/g, numberToChinese(parseInt(data.monthly_rent) || 0))
      .replace(/{{payment_method}}/g, data.payment_method || '月付')
      .replace(/{{deposit}}/g, data.deposit || data.monthly_rent || '');
    
    res.json({ code: 0, data: { content } });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

module.exports = router;
