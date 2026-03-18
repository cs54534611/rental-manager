-- 支付渠道配置表
CREATE TABLE IF NOT EXISTS `payment_channels` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `channel_type` VARCHAR(20) NOT NULL COMMENT 'wechat/alipay/bank',
  `channel_name` VARCHAR(50) NOT NULL,
  `app_id` VARCHAR(100) COMMENT '应用ID',
  `mch_id` VARCHAR(50) COMMENT '商户号',
  `api_key` VARCHAR(200) COMMENT 'API密钥',
  `cert_path` VARCHAR(200) COMMENT '证书路径',
  `is_enabled` TINYINT DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 支付记录表
CREATE TABLE IF NOT EXISTS `payments` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `payment_no` VARCHAR(30) UNIQUE NOT NULL COMMENT '支付流水号',
  `rental_id` INT COMMENT '关联租金ID',
  `tenant_id` INT NOT NULL,
  `house_id` INT NOT NULL,
  `amount` DECIMAL(10,2) NOT NULL,
  `channel` VARCHAR(20) NOT NULL,
  `transaction_id` VARCHAR(100) COMMENT '第三方交易号',
  `status` VARCHAR(20) DEFAULT 'pending' COMMENT 'pending/success/failed/refunded',
  `pay_time` DATETIME,
  `notify_data` JSON,
  `remark` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_rental_id (rental_id),
  INDEX idx_status (status),
  INDEX idx_tenant_id (tenant_id)
);

-- 插入默认支付渠道
INSERT INTO `payment_channels` (`channel_type`, `channel_name`, `is_enabled`) VALUES
('wechat', 'Wechat Pay', 1),
('alipay', 'Alipay', 1);
