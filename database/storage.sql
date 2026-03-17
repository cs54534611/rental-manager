-- 阿里云OSS / 腾讯云COS 配置表
CREATE TABLE IF NOT EXISTS `storage_config` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `provider` VARCHAR(20) NOT NULL COMMENT 'aliyun/tencent/local',
  `access_key_id` VARCHAR(100),
  `access_key_secret` VARCHAR(100),
  `bucket` VARCHAR(50),
  `region` VARCHAR(30),
  `domain` VARCHAR(100) COMMENT '自定义域名',
  `enabled` TINYINT DEFAULT 0,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 插入默认配置（本地存储）
INSERT INTO `storage_config` (`provider`, `enabled`) VALUES ('local', 1);
