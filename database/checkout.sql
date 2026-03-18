-- 退房检查表
CREATE TABLE IF NOT EXISTS `checkouts` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `contract_id` INT NOT NULL,
  `apply_date` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `check_date` DATETIME,
  `status` TINYINT DEFAULT 0 COMMENT '0申请中 1已预约 2已完成 3已取消',
  `house_photos` JSON COMMENT '退房照片',
  `checklist` JSON COMMENT '物品检查清单',
  `deposit_expected` DECIMAL(10,2) DEFAULT 0 COMMENT '应收押金',
  `deposit_refund` DECIMAL(10,2) DEFAULT 0 COMMENT '退还押金',
  `deposit_deduct` DECIMAL(10,2) DEFAULT 0 COMMENT '扣款',
  `deduct_reason` VARCHAR(500) COMMENT '扣款原因',
  `remark` VARCHAR(500),
  `operator_id` INT,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
);
