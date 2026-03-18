-- 抄表记录表
CREATE TABLE IF NOT EXISTS `meter_readings` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `house_id` INT NOT NULL,
  `period` VARCHAR(7) NOT NULL COMMENT '2024-03',
  `water_last` DECIMAL(10,2) DEFAULT 0 COMMENT '上次读数',
  `water_current` DECIMAL(10,2) DEFAULT 0 COMMENT '当前读数',
  `water_usage` DECIMAL(10,2) DEFAULT 0 COMMENT '用量',
  `water_rate` DECIMAL(10,2) DEFAULT 3.5 COMMENT '水价',
  `water_fee` DECIMAL(10,2) DEFAULT 0 COMMENT '水费',
  `electric_last` DECIMAL(10,2) DEFAULT 0 COMMENT '上次读数',
  `electric_current` DECIMAL(10,2) DEFAULT 0 COMMENT '当前读数',
  `electric_usage` DECIMAL(10,2) DEFAULT 0 COMMENT '用量',
  `electric_rate` DECIMAL(10,2) DEFAULT 0.5 COMMENT '电价',
  `electric_fee` DECIMAL(10,2) DEFAULT 0 COMMENT '电费',
  `total_fee` DECIMAL(10,2) DEFAULT 0 COMMENT '合计费用',
  `remark` VARCHAR(200),
  `recorded_by` INT,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_house_period (`house_id`, `period`)
);
