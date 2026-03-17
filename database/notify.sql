-- 通知模板配置表
CREATE TABLE IF NOT EXISTS `notify_templates` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `type` VARCHAR(50) NOT NULL COMMENT '通知类型: rent_due/contract_expiring/repair_status',
  `template_id` VARCHAR(100) COMMENT '微信模板ID',
  `title` VARCHAR(100),
  `content` VARCHAR(500),
  `enabled` TINYINT DEFAULT 1,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 通知记录表
CREATE TABLE IF NOT EXISTS `notify_logs` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `user_id` INT DEFAULT 0,
  `type` VARCHAR(50),
  `title` VARCHAR(100),
  `content` VARCHAR(500),
  `status` TINYINT DEFAULT 0 COMMENT '0待发送 1已发送 2失败',
  `send_time` DATETIME,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 插入默认模板
INSERT INTO `notify_templates` (`type`, `title`, `content`, `enabled`) VALUES
('rent_due', '租金到期提醒', '您有租金即将到期，请及时缴纳', 1),
('contract_expiring', '合同到期提醒', '您的合同即将到期，请及时处理', 1),
('repair_status', '报修状态更新', '您的报修单状态已更新', 1);
