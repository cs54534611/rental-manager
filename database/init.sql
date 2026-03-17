-- =====================================================
-- 租房管理系统 - MySQL 数据库初始化脚本
-- =====================================================

-- 创建数据库
CREATE DATABASE IF NOT EXISTS rental_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE rental_db;

-- =====================================================
-- 1. 房源表
-- =====================================================
CREATE TABLE IF NOT EXISTS houses (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
  house_no VARCHAR(20) UNIQUE NOT NULL COMMENT '房源编号',
  community VARCHAR(100) NOT NULL COMMENT '小区名称',
  address VARCHAR(200) NOT NULL COMMENT '详细地址',
  layout VARCHAR(50) NOT NULL COMMENT '户型，如2室1厅',
  area DECIMAL(10,2) NOT NULL COMMENT '面积(㎡)',
  floor VARCHAR(20) NOT NULL COMMENT '楼层，如10/20',
  orientation VARCHAR(20) NOT NULL COMMENT '朝向',
  decoration VARCHAR(20) NOT NULL COMMENT '装修情况',
  rent DECIMAL(10,2) NOT NULL COMMENT '月租金',
  deposit DECIMAL(10,2) NOT NULL COMMENT '押金',
  status TINYINT DEFAULT 0 COMMENT '状态: 0-空置 1-已出租 2-待出租',
  tags JSON COMMENT '标签，JSON数组',
  photos JSON COMMENT '照片URLs，JSON数组',
  facilities JSON COMMENT '配套设施，JSON数组',
  remark TEXT COMMENT '备注',
  is_deleted TINYINT DEFAULT 0 COMMENT '是否删除: 0-否 1-是',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_community (community),
  INDEX idx_status (status),
  INDEX idx_house_no (house_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='房源表';

-- =====================================================
-- 2. 租客表
-- =====================================================
CREATE TABLE IF NOT EXISTS tenants (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
  name VARCHAR(50) NOT NULL COMMENT '姓名',
  gender TINYINT NOT NULL COMMENT '性别: 0-女 1-男',
  phone VARCHAR(20) NOT NULL COMMENT '手机号',
  id_card VARCHAR(20) COMMENT '身份证号',
  emergency_contact VARCHAR(50) COMMENT '紧急联系人',
  emergency_phone VARCHAR(20) COMMENT '紧急联系人电话',
  avatar VARCHAR(500) COMMENT '头像URL',
  remark TEXT COMMENT '备注',
  status TINYINT DEFAULT 1 COMMENT '状态: 1-正常 0-拉黑',
  is_deleted TINYINT DEFAULT 0 COMMENT '是否删除',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_phone (phone),
  INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='租客表';

-- =====================================================
-- 3. 合同表
-- =====================================================
CREATE TABLE IF NOT EXISTS contracts (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
  contract_no VARCHAR(20) UNIQUE NOT NULL COMMENT '合同编号',
  house_id INT NOT NULL COMMENT '关联房源ID',
  tenant_id INT NOT NULL COMMENT '关联租客ID',
  type TINYINT DEFAULT 1 COMMENT '类型: 1-新签 2-续签 3-转租',
  start_date DATE NOT NULL COMMENT '开始日期',
  end_date DATE NOT NULL COMMENT '结束日期',
  monthly_rent DECIMAL(10,2) NOT NULL COMMENT '月租金',
  payment_method TINYINT NOT NULL COMMENT '付款方式: 1-押一付三 2-押一付一 3-半年付 4-年付',
  deposit DECIMAL(10,2) NOT NULL COMMENT '押金',
  attachment VARCHAR(500) COMMENT '合同附件URL',
  status TINYINT DEFAULT 1 COMMENT '状态: 1-生效 0-终止',
  remark TEXT COMMENT '备注',
  is_deleted TINYINT DEFAULT 0 COMMENT '是否删除',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  FOREIGN KEY (house_id) REFERENCES houses(id),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  INDEX idx_house_id (house_id),
  INDEX idx_tenant_id (tenant_id),
  INDEX idx_status (status),
  INDEX idx_end_date (end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='合同表';

-- =====================================================
-- 4. 租金/账单表
-- =====================================================
CREATE TABLE IF NOT EXISTS rentals (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
  bill_no VARCHAR(20) UNIQUE NOT NULL COMMENT '账单编号',
  contract_id INT NOT NULL COMMENT '关联合同ID',
  house_id INT NOT NULL COMMENT '关联房源ID',
  tenant_id INT NOT NULL COMMENT '关联租客ID',
  period VARCHAR(20) NOT NULL COMMENT '租金期间，如2024-01',
  receivable DECIMAL(10,2) NOT NULL COMMENT '应收金额',
  actual DECIMAL(10,2) COMMENT '实收金额',
  payment_method TINYINT COMMENT '付款方式: 1-微信 2-支付宝 3-银行转账 4-现金',
  paid_date DATE COMMENT '付款日期',
  due_date DATE NOT NULL COMMENT '到期日期',
  status TINYINT DEFAULT 0 COMMENT '状态: 0-未付 1-已付 2-逾期 3-减免',
  remark TEXT COMMENT '备注',
  is_deleted TINYINT DEFAULT 0 COMMENT '是否删除',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  FOREIGN KEY (contract_id) REFERENCES contracts(id),
  FOREIGN KEY (house_id) REFERENCES houses(id),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  INDEX idx_contract_id (contract_id),
  INDEX idx_status (status),
  INDEX idx_period (period)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='租金表';

-- =====================================================
-- 5. 报修表
-- =====================================================
CREATE TABLE IF NOT EXISTS repairs (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
  repair_no VARCHAR(20) UNIQUE NOT NULL COMMENT '报修编号',
  house_id INT NOT NULL COMMENT '关联房源ID',
  tenant_id INT COMMENT '报修人ID',
  type TINYINT NOT NULL COMMENT '类型: 1-水电 2-门窗 3-家电 4-家具 5-其他',
  urgency TINYINT DEFAULT 1 COMMENT '紧急程度: 1-普通 2-紧急 3-非常紧急',
  description TEXT NOT NULL COMMENT '问题描述',
  photos JSON COMMENT '照片JSON数组',
  expected_time DATETIME COMMENT '期望处理时间',
  handler VARCHAR(50) COMMENT '处理人',
  cost DECIMAL(10,2) COMMENT '维修费用',
  status TINYINT DEFAULT 0 COMMENT '状态: 0-待受理 1-已受理 2-已派单 3-处理中 4-待确认 5-已完成 6-已评价',
  rating TINYINT COMMENT '评分 1-5星',
  comment TEXT COMMENT '评价内容',
  remark TEXT COMMENT '备注',
  is_deleted TINYINT DEFAULT 0 COMMENT '是否删除',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  FOREIGN KEY (house_id) REFERENCES houses(id),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  INDEX idx_house_id (house_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='报修表';

-- =====================================================
-- 6. 消息通知表
-- =====================================================
CREATE TABLE IF NOT EXISTS messages (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
  type TINYINT NOT NULL COMMENT '类型: 1-租金提醒 2-合同提醒 3-报修提醒 4-系统通知',
  title VARCHAR(100) NOT NULL COMMENT '标题',
  content TEXT NOT NULL COMMENT '内容',
  target_id INT COMMENT '关联ID（如合同ID、账单ID）',
  target_type VARCHAR(50) COMMENT '关联类型',
  is_read TINYINT DEFAULT 0 COMMENT '是否已读: 0-否 1-是',
  is_deleted TINYINT DEFAULT 0 COMMENT '是否删除',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX idx_type (type),
  INDEX idx_is_read (is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='消息通知表';

-- =====================================================
-- 7. 系统设置表
-- =====================================================
CREATE TABLE IF NOT EXISTS settings (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
  `key` VARCHAR(50) UNIQUE NOT NULL COMMENT '配置键',
  value TEXT COMMENT '配置值',
  remark VARCHAR(200) COMMENT '说明',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统设置表';

-- =====================================================
-- 8. 房东信息表
-- =====================================================
CREATE TABLE IF NOT EXISTS owners (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
  name VARCHAR(50) NOT NULL COMMENT '姓名',
  phone VARCHAR(20) COMMENT '手机号',
  avatar VARCHAR(500) COMMENT '头像URL',
  wechat_openid VARCHAR(100) COMMENT '微信openid',
  wechat_unionid VARCHAR(100) COMMENT '微信unionid',
  remark TEXT COMMENT '备注',
  status TINYINT DEFAULT 1 COMMENT '状态: 1-启用 0-禁用',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='房东信息表';

-- =====================================================
-- 初始化默认数据
-- =====================================================

-- 初始化系统设置
INSERT INTO settings (`key`, value, remark) VALUES
('rent_reminder_days', '7,3,1', '租金到期提醒天数，逗号分隔'),
('contract_warning_days', '30', '合同到期预警天数'),
('repair_response_hours', '24', '维修响应时限（小时）'),
('default_deposit_months', '1', '默认押金月数'),
('owner_id', '1', '当前房东ID');

-- 初始化房东
INSERT INTO owners (id, name, phone) VALUES (1, '房东', '13800138000');

-- 初始化房源示例数据
INSERT INTO houses (house_no, community, address, layout, area, floor, orientation, decoration, rent, deposit, status, tags, facilities) VALUES
('RZ-001', '阳光小区', 'A栋301室', '2室1厅', 80, '3/20', '南', '精装', 2500, 2500, 1, '["地铁房", "精装"]', '["空调", "冰箱", "洗衣机", "热水器"]'),
('RZ-002', '阳光小区', 'A栋402室', '1室1厅', 55, '4/20', '南', '精装', 1800, 1800, 1, '["近学校"]', '["空调", "冰箱", "洗衣机"]'),
('RZ-003', '幸福花园', 'B栋201室', '3室2厅', 120, '2/18', '南北', '简装', 3200, 3200, 0, '["花园", "停车位"]', '["空调", "热水器", "洗衣机"]'),
('RZ-004', '幸福花园', 'B栋502室', '2室1厅', 90, '5/18', '南', '精装', 2800, 2800, 2, '["电梯房"]', '["空调", "冰箱", "洗衣机", "热水器", "沙发"]');

-- 初始化租客示例数据
INSERT INTO tenants (name, gender, phone, id_card, emergency_contact, emergency_phone) VALUES
('李先生', 1, '13900001111', '110101199001011234', '妻子', '13900001112'),
('张女士', 0, '13900002222', '110101199002021234', '丈夫', '13900002223');

-- 初始化合同示例数据
INSERT INTO contracts (contract_no, house_id, tenant_id, type, start_date, end_date, monthly_rent, payment_method, deposit, status) VALUES
('HT-2024-001', 1, 1, 1, '2024-01-01', '2024-12-31', 2500, 1, 2500, 1),
('HT-2024-002', 2, 2, 1, '2024-03-01', '2025-02-28', 1800, 2, 1800, 1);

-- 初始化租金示例数据
INSERT rentals (bill_no, contract_id, house_id, tenant_id, period, receivable, actual, payment_method, paid_date, due_date, status) VALUES
('ZD-2024-01-01', 1, 1, 1, '2024-01', 2500, 2500, 1, '2024-01-05', '2024-01-10', 1),
('ZD-2024-02-01', 1, 1, 1, '2024-02', 2500, 2500, 1, '2024-02-03', '2024-02-10', 1),
('ZD-2024-03-01', 1, 1, 1, '2024-03', 2500, 0, NULL, NULL, '2024-03-10', 0);

-- 查看所有表
SHOW TABLES;
