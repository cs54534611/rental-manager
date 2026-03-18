-- 合同模板表
CREATE TABLE IF NOT EXISTS `contract_templates` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `content` TEXT NOT NULL,
  `is_default` TINYINT DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 插入默认模板
INSERT INTO `contract_templates` (`name`, `content`, `is_default`) VALUES
('标准租房合同', '甲方（房东）：{{owner_name}}
身份证号：{{owner_idcard}}
联系电话：{{owner_phone}}

乙方（租客）：{{tenant_name}}
身份证号：{{tenant_idcard}}
联系电话：{{tenant_phone}}

房屋地址：{{house_address}}

一、租赁期限
自 {{start_date}} 至 {{end_date}}，共 {{months}} 个月。

二、租金及支付方式
月租金：¥{{monthly_rent}}（{{monthly_rent_cn}}）
支付方式：{{payment_method}}

三、押金
乙方需向甲方缴纳押金¥{{deposit}}。

四、双方责任
1. 甲方责任：提供正常居住设施 ...
2. 乙方责任：按时缴纳租金 ...

甲方签字：___________  乙方签字：___________
日期：___________', 1);
