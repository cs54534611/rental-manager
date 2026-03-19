// server/src/routes/stats.js - 数据统计与导出
const express = require('express');
const router = express.Router();
const db = require('../db');

// 获取首页概览数据
router.get('/overview', async (req, res) => {
  try {
    const userRole = req.user?.role || '';
    const userId = req.user?.id;
    
    // 租客：只返回自己的数据
    if (userRole === 'tenant') {
      try {
        // 先获取用户手机号
        const [userResult] = await db.query(
          'SELECT phone FROM admin_users WHERE id = ?',
          [userId]
        );
        
        if (userResult.length === 0) {
          return res.json({ code: 0, data: { houses: { rented: 0 }, income: { receivable: 0 } } });
        }
        
        const phone = userResult[0].phone;
        
        // 通过手机号获取租客ID
        const [tenantResult] = await db.query(
          'SELECT id FROM tenants WHERE phone = ?',
          [phone]
        );
        
        if (tenantResult.length === 0) {
          return res.json({ code: 0, data: { houses: { rented: 0 }, income: { receivable: 0 } } });
        }
        
        const tenantId = tenantResult[0].id;
        
        // 租客在租房源数量
        const [[{ rented }]] = await db.query(
          `SELECT COUNT(*) as rented FROM contracts c 
           INNER JOIN houses h ON c.house_id = h.id 
           WHERE c.tenant_id = ? AND c.status = 1 
           AND c.start_date <= CURDATE() AND c.end_date >= CURDATE() AND c.is_deleted = 0`,
          [tenantId]
        );
        
        // 本月租金
        const currentMonth = new Date().toISOString().slice(0, 7);
        const [[{ receivable }]] = await db.query(
          'SELECT COALESCE(SUM(receivable), 0) as receivable FROM rentals WHERE tenant_id = ? AND period = ? AND is_deleted = 0',
          [tenantId, currentMonth]
        );
        
        return res.json({
          code: 0,
          data: {
            houses: { rented: rented || 0 },
            income: { receivable: receivable || 0 }
          }
        });
      } catch (err) {
        console.error('租客概览数据错误:', err);
        return res.json({ code: 0, data: { houses: { rented: 0 }, income: { receivable: 0 } } });
      }
    }
    
    // 管理员：返回全部数据
    // 房源统计
    const [[{ total }]] = await db.query('SELECT COUNT(*) as total FROM houses WHERE is_deleted = 0');
    const [[{ rented }]] = await db.query('SELECT COUNT(*) as rented FROM houses WHERE status = 1 AND is_deleted = 0');
    const [[{ vacant }]] = await db.query('SELECT COUNT(*) as vacant FROM houses WHERE status = 0 AND is_deleted = 0');
    
    // 入住率
    const occupancyRate = total > 0 ? Math.round((rented / total) * 100) : 0;
    
    // 本月收入统计
    const currentMonth = new Date().toISOString().slice(0, 7);
    const [[{ monthReceivable }]] = await db.query(
      'SELECT COALESCE(SUM(receivable), 0) as monthReceivable FROM rentals WHERE period = ? AND is_deleted = 0',
      [currentMonth]
    );
    const [[{ monthActual }]] = await db.query(
      'SELECT COALESCE(SUM(actual), 0) as monthActual FROM rentals WHERE period = ? AND status = 1 AND is_deleted = 0',
      [currentMonth]
    );
    
    // 待办提醒
    const [[{ expiringContracts }]] = await db.query(
      'SELECT COUNT(*) as expiringContracts FROM contracts WHERE status = 1 AND end_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY) AND is_deleted = 0'
    );
    const [[{ pendingRentals }]] = await db.query(
      'SELECT COUNT(*) as pendingRentals FROM rentals WHERE status = 0 AND is_deleted = 0'
    );
    const [[{ pendingRepairs }]] = await db.query(
      'SELECT COUNT(*) as pendingRepairs FROM repairs WHERE status < 5 AND is_deleted = 0'
    );
    
    // 待收租金
    const [[{ pendingAmount }]] = await db.query(
      'SELECT COALESCE(SUM(receivable - COALESCE(actual, 0)), 0) as pendingAmount FROM rentals WHERE status = 0 AND is_deleted = 0'
    );
    
    res.json({
      code: 0,
      data: {
        houses: { total, rented, vacant, occupancyRate },
        income: { receivable: monthReceivable, actual: monthActual },
        todos: {
          expiringContracts,
          pendingRentals,
          pendingRepairs,
          pendingAmount: pendingAmount || 0
        }
      }
    });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 收入趋势统计
router.get('/income', async (req, res) => {
  try {
    const { months = 12 } = req.query;
    const [rows] = await db.query(
      `SELECT period, SUM(receivable) as receivable, SUM(COALESCE(actual, 0)) as actual 
       FROM rentals 
       WHERE is_deleted = 0 
       GROUP BY period 
       ORDER BY period DESC 
       LIMIT ?`,
      [parseInt(months)]
    );
    res.json({ code: 0, data: rows.reverse() });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 房源状态分布
router.get('/houses/distribution', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT status, COUNT(*) as count 
       FROM houses 
       WHERE is_deleted = 0 
       GROUP BY status`
    );
    const statusMap = { 0: '空置', 1: '已出租', 2: '待出租' };
    const data = rows.map(r => ({ name: statusMap[r.status] || '未知', value: r.count }));
    res.json({ code: 0, data });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 维修统计
router.get('/repairs/stats', async (req, res) => {
  try {
    const [[{ total }]] = await db.query('SELECT COUNT(*) as total FROM repairs WHERE is_deleted = 0');
    const [[{ completed }]] = await db.query('SELECT COUNT(*) as completed FROM repairs WHERE status = 5 AND is_deleted = 0');
    const [[{ avgCost }]] = await db.query('SELECT AVG(cost) as avgCost FROM repairs WHERE cost > 0 AND is_deleted = 0');
    
    res.json({ code: 0, data: { total, completed, avgCost: avgCost || 0 } });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

// ========== 数据导出功能 ==========

// 导出数据为CSV
router.get('/export/:type', async (req, res) => {
  try {
    const { type } = req.params; // houses, tenants, contracts, rentals, repairs
    let data = [];
    let headers = [];
    let filename = '';
    
    switch(type) {
      case 'houses':
        [data] = await db.query('SELECT house_no, community, address, layout, area, floor, rent, deposit, status FROM houses WHERE is_deleted = 0');
        headers = ['房源编号', '小区', '地址', '户型', '面积', '楼层', '租金', '押金', '状态'];
        filename = '房源列表.csv';
        data = data.map(h => ({...h, status: ['空置', '出租中', '维修中'][h.status] || '未知'}));
        break;
        
      case 'tenants':
        [data] = await db.query('SELECT name, phone, id_card, emergency_contact, emergency_phone FROM tenants WHERE is_deleted = 0');
        headers = ['姓名', '电话', '身份证', '紧急联系人', '紧急联系电话'];
        filename = '租客列表.csv';
        break;
        
      case 'contracts':
        [data] = await db.query(`
          SELECT c.contract_no, h.address, t.name as tenant_name, c.start_date, c.end_date, c.monthly_rent, c.status
          FROM contracts c
          LEFT JOIN houses h ON c.house_id = h.id
          LEFT JOIN tenants t ON c.tenant_id = t.id
          WHERE c.is_deleted = 0
        `);
        headers = ['合同编号', '房源地址', '租客', '开始日期', '结束日期', '月租金', '状态'];
        filename = '合同列表.csv';
        data = data.map(c => ({...c, status: ['已终止', '生效中', '已退租', '已到期'][c.status] || '未知'}));
        break;
        
      case 'rentals':
        [data] = await db.query(`
          SELECT r.bill_no, h.address, t.name as tenant_name, r.period, r.receivable, r.actual, r.due_date, r.status
          FROM rentals r
          LEFT JOIN houses h ON r.house_id = h.id
          LEFT JOIN tenants t ON r.tenant_id = t.id
          WHERE r.is_deleted = 0
        `);
        headers = ['账单编号', '房源地址', '租客', '月份', '应收', '实收', '到期日', '状态'];
        filename = '租金列表.csv';
        data = data.map(r => ({...r, status: ['待缴', '已缴', '逾期', '减免'][r.status] || '未知'}));
        break;
        
      case 'repairs':
        [data] = await db.query(`
          SELECT r.repair_no, h.address, t.name as tenant_name, r.description, r.status, r.cost, r.created_at
          FROM repairs r
          LEFT JOIN houses h ON r.house_id = h.id
          LEFT JOIN tenants t ON r.tenant_id = t.id
          WHERE r.is_deleted = 0
        `);
        headers = ['报修编号', '房源地址', '租客', '问题描述', '状态', '费用', '创建时间'];
        filename = '报修列表.csv';
        data = data.map(r => ({...r, status: ['待处理', '处理中', '已完成', '已评价'][r.status] || '未知'}));
        break;
        
      default:
        return res.status(400).json({ code: 1, message: '不支持的导出类型' });
    }
    
    // 生成CSV
    const headerLine = '\ufeff' + headers.join(',');
    const csvLines = data.map(row => {
      return Object.values(row).map(val => {
        if (val === null || val === undefined) return '';
        const str = String(val);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return '"' + str.replace(/"/g, '""') + '"';
        }
        return str;
      }).join(',');
    });
    
    const csv = [headerLine, ...csvLines].join('\n');
    
    res.setHeader('Content-Type', 'text/csv;charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=${encodeURIComponent(filename)}`);
    res.send(csv);
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

module.exports = router;

// ========== 批量导入房源 ==========
router.post('/import/houses', async (req, res) => {
  try {
    const { houses } = req.body; // 数组格式的房源数据
    
    if (!houses || !Array.isArray(houses) || houses.length === 0) {
      return res.status(400).json({ code: 1, message: '请提供房源数据数组' });
    }
    
    let imported = 0;
    let failed = 0;
    const errors = [];
    
    for (let i = 0; i < houses.length; i++) {
      const h = houses[i];
      try {
        const houseNo = h.house_no || 'RZ-' + Date.now() + Math.random().toString(36).substr(2, 4);
        
        await db.query(
          `INSERT INTO houses (house_no, community, address, layout, area, floor, orientation, decoration, rent, deposit, status, tags, photos, facilities, remark) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            houseNo,
            h.community || '',
            h.address || '',
            h.layout || '',
            h.area || 0,
            h.floor || '',
            h.orientation || '',
            h.decoration || '',
            h.rent || 0,
            h.deposit || 0,
            h.status || 0,
            JSON.stringify(h.tags || []),
            JSON.stringify(h.photos || []),
            JSON.stringify(h.facilities || []),
            h.remark || ''
          ]
        );
        imported++;
      } catch (err) {
        failed++;
        errors.push({ row: i + 1, error: err.message });
      }
    }
    
    res.json({ 
      code: 0, 
      message: `导入完成：成功${imported}条，失败${failed}条`,
      data: { imported, failed, errors }
    });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 批量导入租客
router.post('/import/tenants', async (req, res) => {
  try {
    const { tenants } = req.body;
    
    if (!tenants || !Array.isArray(tenants) || tenants.length === 0) {
      return res.status(400).json({ code: 1, message: '请提供租客数据数组' });
    }
    
    let imported = 0;
    let failed = 0;
    const errors = [];
    
    for (let i = 0; i < tenants.length; i++) {
      const t = tenants[i];
      try {
        await db.query(
          `INSERT INTO tenants (name, gender, phone, id_card, emergency_contact, emergency_phone, remark) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            t.name || '',
            t.gender || 0,
            t.phone || '',
            t.id_card || '',
            t.emergency_contact || '',
            t.emergency_phone || '',
            t.remark || ''
          ]
        );
        imported++;
      } catch (err) {
        failed++;
        errors.push({ row: i + 1, error: err.message });
      }
    }
    
    res.json({ 
      code: 0, 
      message: `导入完成：成功${imported}条，失败${failed}条`,
      data: { imported, failed, errors }
    });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 批量导入合同
router.post('/import/contracts', async (req, res) => {
  try {
    const { contracts } = req.body;
    
    if (!contracts || !Array.isArray(contracts) || contracts.length === 0) {
      return res.status(400).json({ code: 1, message: '请提供合同数据数组' });
    }
    
    let imported = 0;
    let failed = 0;
    const errors = [];
    
    for (let i = 0; i < contracts.length; i++) {
      const c = contracts[i];
      try {
        // 查找对应房源
        const [houses] = await db.query('SELECT id FROM houses WHERE address LIKE ? LIMIT 1', ['%' + c.address + '%']);
        // 查找对应租客
        const [tenants] = await db.query('SELECT id FROM tenants WHERE name LIKE ? LIMIT 1', ['%' + c.tenant_name + '%']);
        
        const houseId = houses.length > 0 ? houses[0].id : null;
        const tenantId = tenants.length > 0 ? tenants[0].id : null;
        
        // 解析日期
        const startDate = c.start_date ? new Date(c.start_date).toISOString().split('T')[0] : null;
        const endDate = c.end_date ? new Date(c.end_date).toISOString().split('T')[0] : null;
        
        // 状态映射
        const statusMap = { '生效中': 1, '已终止': 0, '已退租': 2, '已到期': 3 };
        
        const contractNo = c.contract_no || 'HT-' + Date.now() + Math.random().toString(36).substr(2, 4);
        
        await db.query(
          `INSERT INTO contracts (contract_no, house_id, tenant_id, type, start_date, end_date, monthly_rent, deposit, payment_method, status, remark) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            contractNo,
            houseId,
            tenantId,
            c.type || 1,
            startDate,
            endDate,
            c.monthly_rent || 0,
            c.deposit || 0,
            c.payment_method || 1,
            statusMap[c.status] || 1,
            c.remark || ''
          ]
        );
        imported++;
      } catch (err) {
        failed++;
        errors.push({ row: i + 1, error: err.message });
      }
    }
    
    res.json({ 
      code: 0, 
      message: `导入完成：成功${imported}条，失败${failed}条`,
      data: { imported, failed, errors }
    });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 模板下载
router.get('/import/template/:type', async (req, res) => {
  try {
    const { type } = req.params;
    let headers = [];
    let example = [];
    
    switch(type) {
      case 'houses':
        headers = ['小区', '地址', '户型', '面积', '楼层', '朝向', '装修', '租金', '押金', '备注'];
        example = ['示例小区', 'A栋301室', '2室1厅', '80', '3/20', '南', '精装', '2500', '2500', '首次出租'];
        break;
      case 'tenants':
        headers = ['姓名', '性别(0男1女)', '电话', '身份证', '紧急联系人', '紧急联系人电话', '备注'];
        example = ['张三', '0', '13800138000', '510101199001011234', '李四', '13900139000', ''];
        break;
      default:
        return res.status(400).json({ code: 1, message: '不支持的类型' });
    }
    
    const csv = '\ufeff' + headers.join(',') + '\n' + example.join(',');
    
    res.setHeader('Content-Type', 'text/csv;charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=${type}_template.csv`);
    res.send(csv);
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});
