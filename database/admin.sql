-- 管理员用户表
CREATE TABLE IF NOT EXISTS `admin_users` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `username` VARCHAR(50) UNIQUE NOT NULL,
  `password` VARCHAR(100) NOT NULL,
  `role` VARCHAR(20) NOT NULL DEFAULT 'admin' COMMENT 'super/admin/finance/repair',
  `name` VARCHAR(50),
  `phone` VARCHAR(20),
  `avatar` VARCHAR(200),
  `status` TINYINT DEFAULT 1 COMMENT '0禁用 1正常',
  `last_login` DATETIME,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 默认超级管理员
INSERT INTO `admin_users` (`username`, `password`, `role`, `name`) VALUES 
('admin', 'admin123', 'super', '系统管理员');

-- 权限配置表
CREATE TABLE IF NOT EXISTS `permissions` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `role` VARCHAR(20) NOT NULL,
  `module` VARCHAR(20) NOT NULL COMMENT 'houses/tenants/contracts/rentals/repairs/settings',
  `actions` VARCHAR(100) NOT NULL COMMENT 'create,read,update,delete'
);

-- 插入默认权限
INSERT INTO `permissions` (`role`, `module`, `actions`) VALUES
-- 超级管理员
('super', 'houses', 'create,read,update,delete'),
('super', 'tenants', 'create,read,update,delete'),
('super', 'contracts', 'create,read,update,delete'),
('super', 'rentals', 'create,read,update,delete'),
('super', 'repairs', 'create,read,update,delete'),
('super', 'settings', 'create,read,update,delete'),
('super', 'staff', 'create,read,update,delete'),
('super', 'stats', 'read'),
-- 普通管理员
('admin', 'houses', 'create,read,update,delete'),
('admin', 'tenants', 'create,read,update,delete'),
('admin', 'contracts', 'create,read,update,delete'),
('admin', 'rentals', 'create,read,update,delete'),
('admin', 'repairs', 'create,read,update,delete'),
('admin', 'settings', 'read'),
('admin', 'staff', 'create,read,update,delete'),
('admin', 'stats', 'read'),
-- 财务人员
('finance', 'houses', 'read'),
('finance', 'tenants', 'read'),
('finance', 'contracts', 'read'),
('finance', 'rentals', 'create,read,update,delete'),
('finance', 'stats', 'read'),
-- 维修人员
('repair', 'houses', 'read'),
('repair', 'repairs', 'create,read,update,delete');
