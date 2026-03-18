-- 收支记录表
CREATE TABLE IF NOT EXISTS `transactions` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `type` VARCHAR(20) NOT NULL COMMENT 'income收入/expense支出',
  `category` VARCHAR(50) NOT NULL COMMENT '租金/押金/维修/物业/水电/其他',
  `amount` DECIMAL(10,2) NOT NULL,
  `house_id` INT,
  `tenant_id` INT,
  `related_id` INT,
  `related_type` VARCHAR(20) COMMENT 'rental/repair',
  `remark` VARCHAR(500),
  `operator_id` INT,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 索引
ALTER TABLE `transactions` ADD INDEX idx_house_id (`house_id`);
ALTER TABLE `transactions` ADD INDEX idx_created_at (`created_at`);
ALTER TABLE `transactions` ADD INDEX idx_type (`type`);
