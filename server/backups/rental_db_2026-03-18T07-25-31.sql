-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: localhost    Database: rental_db
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `admin_users`
--

DROP TABLE IF EXISTS `admin_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin_users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'admin' COMMENT 'super/admin/finance/repair',
  `name` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `avatar` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` tinyint DEFAULT '1' COMMENT '0禁用 1正常',
  `last_login` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_users`
--

LOCK TABLES `admin_users` WRITE;
/*!40000 ALTER TABLE `admin_users` DISABLE KEYS */;
INSERT INTO `admin_users` VALUES (1,'admin','admin123','super','系统管理员',NULL,NULL,1,NULL,'2026-03-17 18:02:35');
/*!40000 ALTER TABLE `admin_users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `checkouts`
--

DROP TABLE IF EXISTS `checkouts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `checkouts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `contract_id` int NOT NULL,
  `apply_date` datetime DEFAULT CURRENT_TIMESTAMP,
  `check_date` datetime DEFAULT NULL,
  `status` tinyint DEFAULT '0' COMMENT '0申请中 1已预约 2已完成 3已取消',
  `house_photos` json DEFAULT NULL COMMENT '退房照片',
  `checklist` json DEFAULT NULL COMMENT '物品检查清单',
  `deposit_expected` decimal(10,2) DEFAULT '0.00' COMMENT '应收押金',
  `deposit_refund` decimal(10,2) DEFAULT '0.00' COMMENT '退还押金',
  `deposit_deduct` decimal(10,2) DEFAULT '0.00' COMMENT '扣款',
  `deduct_reason` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '扣款原因',
  `remark` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `operator_id` int DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `checkouts`
--

LOCK TABLES `checkouts` WRITE;
/*!40000 ALTER TABLE `checkouts` DISABLE KEYS */;
INSERT INTO `checkouts` VALUES (1,1,'2026-03-15 00:00:00',NULL,2,NULL,NULL,2500.00,2300.00,200.00,'墙壁破损维修',NULL,NULL,'2026-03-18 11:02:42'),(3,3,'2026-03-18 14:54:27','2036-05-17 00:00:00',3,NULL,NULL,100000.00,0.00,0.00,NULL,'',NULL,'2026-03-18 14:54:27');
/*!40000 ALTER TABLE `checkouts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contract_templates`
--

DROP TABLE IF EXISTS `contract_templates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contract_templates` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_default` tinyint DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contract_templates`
--

LOCK TABLES `contract_templates` WRITE;
/*!40000 ALTER TABLE `contract_templates` DISABLE KEYS */;
INSERT INTO `contract_templates` VALUES (1,'标准租房合同','甲方（房东）：{{owner_name}}\n身份证号：{{owner_idcard}}\n联系电话：{{owner_phone}}\n\n乙方（租客）：{{tenant_name}}\n身份证号：{{tenant_idcard}}\n联系电话：{{tenant_phone}}\n\n房屋地址：{{house_address}}\n\n一、租赁期限\n自 {{start_date}} 至 {{end_date}}，共 {{months}} 个月。\n\n二、租金及支付方式\n月租金：¥{{monthly_rent}}（{{monthly_rent_cn}}）\n支付方式：{{payment_method}}\n\n三、押金\n乙方需向甲方缴纳押金¥{{deposit}}。\n\n四、双方责任\n1. 甲方责任：提供正常居住设施 ...\n2. 乙方责任：按时缴纳租金 ...\n\n甲方签字：___________  乙方签字：___________\n日期：___________',1,'2026-03-17 18:02:51');
/*!40000 ALTER TABLE `contract_templates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contracts`
--

DROP TABLE IF EXISTS `contracts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contracts` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '涓婚敭ID',
  `contract_no` varchar(20) NOT NULL COMMENT '鍚堝悓缂栧彿',
  `house_id` int NOT NULL COMMENT '鍏宠仈鎴挎簮ID',
  `tenant_id` int NOT NULL COMMENT '鍏宠仈绉熷?ID',
  `type` tinyint DEFAULT '1' COMMENT '绫诲瀷: 1-鏂扮? 2-缁?? 3-杞??',
  `start_date` date NOT NULL COMMENT '寮??鏃ユ湡',
  `end_date` date NOT NULL COMMENT '缁撴潫鏃ユ湡',
  `monthly_rent` decimal(10,2) NOT NULL COMMENT '鏈堢?閲',
  `payment_method` tinyint NOT NULL COMMENT '浠樻?鏂瑰紡: 1-鎶间竴浠樹笁 2-鎶间竴浠樹竴 3-鍗婂勾浠?4-骞翠粯',
  `deposit` decimal(10,2) NOT NULL COMMENT '鎶奸噾',
  `attachment` varchar(500) DEFAULT NULL COMMENT '鍚堝悓闄勪欢URL',
  `status` tinyint DEFAULT '1' COMMENT '鐘舵?: 1-鐢熸晥 0-缁堟?',
  `remark` text COMMENT '澶囨敞',
  `is_deleted` tinyint DEFAULT '0' COMMENT '鏄?惁鍒犻櫎',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '鍒涘缓鏃堕棿',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '鏇存柊鏃堕棿',
  PRIMARY KEY (`id`),
  UNIQUE KEY `contract_no` (`contract_no`),
  KEY `idx_house_id` (`house_id`),
  KEY `idx_tenant_id` (`tenant_id`),
  KEY `idx_status` (`status`),
  KEY `idx_end_date` (`end_date`),
  CONSTRAINT `contracts_ibfk_1` FOREIGN KEY (`house_id`) REFERENCES `houses` (`id`),
  CONSTRAINT `contracts_ibfk_2` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='鍚堝悓琛';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contracts`
--

LOCK TABLES `contracts` WRITE;
/*!40000 ALTER TABLE `contracts` DISABLE KEYS */;
INSERT INTO `contracts` VALUES (1,'HT-2024-001',1,1,1,'2024-01-01','2024-12-31',2500.00,1,2500.00,NULL,1,NULL,0,'2026-03-16 08:28:12','2026-03-16 08:28:12'),(2,'HT-2024-002',2,2,1,'2024-03-01','2025-02-28',1800.00,2,1800.00,NULL,2,NULL,0,'2026-03-16 08:28:12','2026-03-18 06:07:24'),(3,'HT-1773816414436',7,3,1,'2026-03-18','2036-05-18',30000.00,1,100000.00,'',2,'',0,'2026-03-18 06:46:54','2026-03-18 06:54:27'),(4,'HT-1773818180719',5,3,1,'2025-03-18','2026-03-22',600.00,1,600.00,'',1,'',0,'2026-03-18 07:16:20','2026-03-18 07:16:20');
/*!40000 ALTER TABLE `contracts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `houses`
--

DROP TABLE IF EXISTS `houses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `houses` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '涓婚敭ID',
  `house_no` varchar(20) NOT NULL COMMENT '鎴挎簮缂栧彿',
  `community` varchar(100) NOT NULL COMMENT '灏忓尯鍚嶇О',
  `address` varchar(200) NOT NULL COMMENT '璇︾粏鍦板潃',
  `layout` varchar(50) NOT NULL COMMENT '鎴峰瀷锛屽?2瀹?鍘',
  `area` decimal(10,2) NOT NULL COMMENT '闈㈢Н(銕?',
  `floor` varchar(20) NOT NULL COMMENT '妤煎眰锛屽?10/20',
  `orientation` varchar(20) NOT NULL COMMENT '鏈濆悜',
  `decoration` varchar(20) NOT NULL COMMENT '瑁呬慨鎯呭喌',
  `rent` decimal(10,2) NOT NULL COMMENT '鏈堢?閲',
  `deposit` decimal(10,2) NOT NULL COMMENT '鎶奸噾',
  `status` tinyint DEFAULT '0' COMMENT '鐘舵?: 0-绌虹疆 1-宸插嚭绉?2-寰呭嚭绉',
  `tags` json DEFAULT NULL COMMENT '鏍囩?锛孞SON鏁扮粍',
  `photos` json DEFAULT NULL COMMENT '鐓х墖URLs锛孞SON鏁扮粍',
  `facilities` json DEFAULT NULL COMMENT '閰嶅?璁炬柦锛孞SON鏁扮粍',
  `remark` text COMMENT '澶囨敞',
  `is_deleted` tinyint DEFAULT '0' COMMENT '鏄?惁鍒犻櫎: 0-鍚?1-鏄',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '鍒涘缓鏃堕棿',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '鏇存柊鏃堕棿',
  PRIMARY KEY (`id`),
  UNIQUE KEY `house_no` (`house_no`),
  KEY `idx_community` (`community`),
  KEY `idx_status` (`status`),
  KEY `idx_house_no` (`house_no`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='鎴挎簮琛';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `houses`
--

LOCK TABLES `houses` WRITE;
/*!40000 ALTER TABLE `houses` DISABLE KEYS */;
INSERT INTO `houses` VALUES (1,'RZ-001','阳光小区','A栋301室','2室1厅',80.00,'3/20','南','精装',2500.00,2500.00,1,'[\"地铁房\", \"精装\"]',NULL,'[\"空调\", \"冰箱\", \"洗衣机\", \"热水器\"]',NULL,0,'2026-03-16 08:28:12','2026-03-16 08:28:12'),(2,'RZ-002','阳光小区','A栋402室','1室1厅',55.00,'4/20','南','精装',1800.00,1800.00,0,'[\"近学校\"]',NULL,'[\"空调\", \"冰箱\", \"洗衣机\"]',NULL,0,'2026-03-16 08:28:12','2026-03-18 06:15:21'),(3,'RZ-003','幸福花园','B栋201室','3室2厅',120.00,'2/18','南北','简装',3200.00,3200.00,0,'[\"花园\", \"停车位\"]',NULL,'[\"空调\", \"热水器\", \"洗衣机\"]',NULL,0,'2026-03-16 08:28:12','2026-03-16 08:28:12'),(4,'RZ-004','幸福花园','B栋502室','2室1厅',90.00,'5/18','南','精装',2800.00,2800.00,2,'[\"电梯房\"]',NULL,'[\"空调\", \"冰箱\", \"洗衣机\", \"热水器\", \"沙发\"]',NULL,0,'2026-03-16 08:28:12','2026-03-16 08:28:12'),(5,'RZ-1773653339428','测试','测试','1室0厅',50.00,'5/24','东','精装',600.00,600.00,1,'[]','[\"http://tmp/BECRvgKYEEnEbbc70ffb61b76fcf6fedaca37bcf6bd7.png\"]','[]','',0,'2026-03-16 09:28:59','2026-03-18 07:16:20'),(6,'RZ-1773734356191','阳光城','龙泉','4室2厅',150.00,'12/34','东','精装',3000.00,3000.00,0,'[]','[\"wxfile://tmp_fbf401e8d029dbcc4178ff4b5a1e80fa2f413d9f88c024e1.jpg\"]','[\"停车位\"]','龙潭是我',0,'2026-03-17 07:59:16','2026-03-17 07:59:16'),(7,'RZ-1773816360951','渔人小镇','辽宁市大连市沙河口区渔人码头','5室2厅',1300.00,'1/3','东南','精装',30000.00,100000.00,1,'[]','[\"wxfile://tmp_f3c306989f037e862a9e3822183ba253675577223f85a8b5.jpg\"]','[\"空调\", \"冰箱\", \"洗衣机\", \"沙发\", \"燃气\", \"停车位\"]','小别墅',0,'2026-03-18 06:46:00','2026-03-18 06:46:54');
/*!40000 ALTER TABLE `houses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `messages`
--

DROP TABLE IF EXISTS `messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `messages` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '涓婚敭ID',
  `type` tinyint NOT NULL COMMENT '绫诲瀷: 1-绉熼噾鎻愰啋 2-鍚堝悓鎻愰啋 3-鎶ヤ慨鎻愰啋 4-绯荤粺閫氱煡',
  `title` varchar(100) NOT NULL COMMENT '鏍囬?',
  `content` text NOT NULL COMMENT '鍐呭?',
  `target_id` int DEFAULT NULL COMMENT '鍏宠仈ID锛堝?鍚堝悓ID銆佽处鍗旾D锛',
  `target_type` varchar(50) DEFAULT NULL COMMENT '鍏宠仈绫诲瀷',
  `is_read` tinyint DEFAULT '0' COMMENT '鏄?惁宸茶?: 0-鍚?1-鏄',
  `is_deleted` tinyint DEFAULT '0' COMMENT '鏄?惁鍒犻櫎',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '鍒涘缓鏃堕棿',
  PRIMARY KEY (`id`),
  KEY `idx_type` (`type`),
  KEY `idx_is_read` (`is_read`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='娑堟伅閫氱煡琛';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `messages`
--

LOCK TABLES `messages` WRITE;
/*!40000 ALTER TABLE `messages` DISABLE KEYS */;
/*!40000 ALTER TABLE `messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `meter_readings`
--

DROP TABLE IF EXISTS `meter_readings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `meter_readings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `house_id` int NOT NULL,
  `period` varchar(7) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '2024-03',
  `water_last` decimal(10,2) DEFAULT '0.00' COMMENT '上次读数',
  `water_current` decimal(10,2) DEFAULT '0.00' COMMENT '当前读数',
  `water_usage` decimal(10,2) DEFAULT '0.00' COMMENT '用量',
  `water_rate` decimal(10,2) DEFAULT '3.50' COMMENT '水价',
  `water_fee` decimal(10,2) DEFAULT '0.00' COMMENT '水费',
  `electric_last` decimal(10,2) DEFAULT '0.00' COMMENT '上次读数',
  `electric_current` decimal(10,2) DEFAULT '0.00' COMMENT '当前读数',
  `electric_usage` decimal(10,2) DEFAULT '0.00' COMMENT '用量',
  `electric_rate` decimal(10,2) DEFAULT '0.50' COMMENT '电价',
  `electric_fee` decimal(10,2) DEFAULT '0.00' COMMENT '电费',
  `total_fee` decimal(10,2) DEFAULT '0.00' COMMENT '合计费用',
  `remark` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `recorded_by` int DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_house_period` (`house_id`,`period`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `meter_readings`
--

LOCK TABLES `meter_readings` WRITE;
/*!40000 ALTER TABLE `meter_readings` DISABLE KEYS */;
INSERT INTO `meter_readings` VALUES (1,1,'2026-03',100.00,120.00,20.00,3.50,70.00,500.00,650.00,150.00,0.60,90.00,160.00,NULL,NULL,'2026-03-18 11:02:22'),(2,2,'2026-03',80.00,95.00,15.00,3.50,52.50,300.00,420.00,120.00,0.60,72.00,124.50,NULL,NULL,'2026-03-18 11:02:22');
/*!40000 ALTER TABLE `meter_readings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notify_logs`
--

DROP TABLE IF EXISTS `notify_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notify_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT '0',
  `type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `title` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `content` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` tinyint DEFAULT '0' COMMENT '0寰呭彂閫?1宸插彂閫?2澶辫触',
  `send_time` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notify_logs`
--

LOCK TABLES `notify_logs` WRITE;
/*!40000 ALTER TABLE `notify_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `notify_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notify_templates`
--

DROP TABLE IF EXISTS `notify_templates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notify_templates` (
  `id` int NOT NULL AUTO_INCREMENT,
  `type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '閫氱煡绫诲瀷: rent_due/contract_expiring/repair_status',
  `template_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '寰?俊妯℃澘ID',
  `title` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `content` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `enabled` tinyint DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notify_templates`
--

LOCK TABLES `notify_templates` WRITE;
/*!40000 ALTER TABLE `notify_templates` DISABLE KEYS */;
INSERT INTO `notify_templates` VALUES (1,'rent_due',NULL,'租金到期提醒','您有租金即将到期，请及时缴纳',1,'2026-03-17 18:02:04'),(2,'contract_expiring',NULL,'合同到期提醒','您的合同即将到期，请及时处理',1,'2026-03-17 18:02:04'),(3,'repair_status',NULL,'报修状态更新','您的报修单状态已更新',1,'2026-03-17 18:02:04');
/*!40000 ALTER TABLE `notify_templates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `owners`
--

DROP TABLE IF EXISTS `owners`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `owners` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '涓婚敭ID',
  `name` varchar(50) NOT NULL COMMENT '濮撳悕',
  `phone` varchar(20) DEFAULT NULL COMMENT '鎵嬫満鍙',
  `avatar` varchar(500) DEFAULT NULL COMMENT '澶村儚URL',
  `wechat_openid` varchar(100) DEFAULT NULL COMMENT '寰?俊openid',
  `wechat_unionid` varchar(100) DEFAULT NULL COMMENT '寰?俊unionid',
  `remark` text COMMENT '澶囨敞',
  `status` tinyint DEFAULT '1' COMMENT '鐘舵?: 1-鍚?敤 0-绂佺敤',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '鍒涘缓鏃堕棿',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '鏇存柊鏃堕棿',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='鎴夸笢淇℃伅琛';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `owners`
--

LOCK TABLES `owners` WRITE;
/*!40000 ALTER TABLE `owners` DISABLE KEYS */;
INSERT INTO `owners` VALUES (1,'拥有者','13800138000',NULL,NULL,NULL,NULL,1,'2026-03-16 08:28:12','2026-03-17 07:57:06');
/*!40000 ALTER TABLE `owners` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payment_channels`
--

DROP TABLE IF EXISTS `payment_channels`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment_channels` (
  `id` int NOT NULL AUTO_INCREMENT,
  `channel_type` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'wechat/alipay/bank',
  `channel_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `app_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '搴旂敤ID',
  `mch_id` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '鍟嗘埛鍙',
  `api_key` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'API瀵嗛挜',
  `cert_path` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '璇佷功璺?緞',
  `is_enabled` tinyint DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment_channels`
--

LOCK TABLES `payment_channels` WRITE;
/*!40000 ALTER TABLE `payment_channels` DISABLE KEYS */;
INSERT INTO `payment_channels` VALUES (1,'wechat','Wechat Pay',NULL,NULL,NULL,NULL,1,'2026-03-18 02:24:40','2026-03-18 02:24:40'),(2,'alipay','Alipay',NULL,NULL,NULL,NULL,1,'2026-03-18 02:24:40','2026-03-18 02:24:40');
/*!40000 ALTER TABLE `payment_channels` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `payment_no` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '鏀?粯娴佹按鍙',
  `rental_id` int DEFAULT NULL COMMENT '鍏宠仈绉熼噾ID',
  `tenant_id` int NOT NULL,
  `house_id` int NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `channel` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `transaction_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '绗?笁鏂逛氦鏄撳彿',
  `status` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'pending' COMMENT 'pending/success/failed/refunded',
  `pay_time` datetime DEFAULT NULL,
  `notify_data` json DEFAULT NULL,
  `remark` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `payment_no` (`payment_no`),
  KEY `idx_rental_id` (`rental_id`),
  KEY `idx_status` (`status`),
  KEY `idx_tenant_id` (`tenant_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
INSERT INTO `payments` VALUES (1,'PAY202603001',1,1,1,2500.00,'wechat',NULL,'success','2026-03-01 10:00:00',NULL,NULL,'2026-03-18 02:57:46','2026-03-18 02:57:46'),(2,'PAY202603002',2,1,1,2500.00,'alipay',NULL,'success','2026-03-02 14:30:00',NULL,NULL,'2026-03-18 02:57:46','2026-03-18 02:57:46'),(3,'PAY202603003',5,2,2,2800.00,'wechat',NULL,'success','2026-03-16 09:15:00',NULL,NULL,'2026-03-18 02:57:46','2026-03-18 03:23:35'),(4,'PAY202603004',4,2,2,2800.00,'bank',NULL,'success','2026-03-16 11:20:00',NULL,NULL,'2026-03-18 02:57:46','2026-03-18 03:23:32'),(5,'PAY202603005',3,2,2,18100.00,'bank',NULL,'success','2026-03-16 11:20:00',NULL,NULL,'2026-03-18 02:57:46','2026-03-18 03:23:21');
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `permissions`
--

DROP TABLE IF EXISTS `permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `permissions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `role` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `module` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'houses/tenants/contracts/rentals/repairs/settings',
  `actions` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'create,read,update,delete',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permissions`
--

LOCK TABLES `permissions` WRITE;
/*!40000 ALTER TABLE `permissions` DISABLE KEYS */;
INSERT INTO `permissions` VALUES (1,'super','houses','create,read,update,delete'),(2,'super','tenants','create,read,update,delete'),(3,'super','contracts','create,read,update,delete'),(4,'super','rentals','create,read,update,delete'),(5,'super','repairs','create,read,update,delete'),(6,'super','settings','create,read,update,delete'),(7,'super','staff','create,read,update,delete'),(8,'super','stats','read'),(9,'admin','houses','create,read,update,delete'),(10,'admin','tenants','create,read,update,delete'),(11,'admin','contracts','create,read,update,delete'),(12,'admin','rentals','create,read,update,delete'),(13,'admin','repairs','create,read,update,delete'),(14,'admin','settings','read'),(15,'admin','staff','create,read,update,delete'),(16,'admin','stats','read'),(17,'finance','houses','read'),(18,'finance','tenants','read'),(19,'finance','contracts','read'),(20,'finance','rentals','create,read,update,delete'),(21,'finance','stats','read'),(22,'repair','houses','read'),(23,'repair','repairs','create,read,update,delete');
/*!40000 ALTER TABLE `permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rentals`
--

DROP TABLE IF EXISTS `rentals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rentals` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '涓婚敭ID',
  `bill_no` varchar(20) NOT NULL COMMENT '璐﹀崟缂栧彿',
  `contract_id` int NOT NULL COMMENT '鍏宠仈鍚堝悓ID',
  `house_id` int NOT NULL COMMENT '鍏宠仈鎴挎簮ID',
  `tenant_id` int NOT NULL COMMENT '鍏宠仈绉熷?ID',
  `period` varchar(20) NOT NULL COMMENT '绉熼噾鏈熼棿锛屽?2024-01',
  `receivable` decimal(10,2) NOT NULL COMMENT '搴旀敹閲戦?',
  `actual` decimal(10,2) DEFAULT NULL COMMENT '瀹炴敹閲戦?',
  `payment_method` tinyint DEFAULT NULL COMMENT '浠樻?鏂瑰紡: 1-寰?俊 2-鏀?粯瀹?3-閾惰?杞?处 4-鐜伴噾',
  `paid_date` date DEFAULT NULL COMMENT '浠樻?鏃ユ湡',
  `due_date` date NOT NULL COMMENT '鍒版湡鏃ユ湡',
  `status` tinyint DEFAULT '0' COMMENT '鐘舵?: 0-鏈?粯 1-宸蹭粯 2-閫炬湡 3-鍑忓厤',
  `remark` text COMMENT '澶囨敞',
  `is_deleted` tinyint DEFAULT '0' COMMENT '鏄?惁鍒犻櫎',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '鍒涘缓鏃堕棿',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '鏇存柊鏃堕棿',
  PRIMARY KEY (`id`),
  UNIQUE KEY `bill_no` (`bill_no`),
  KEY `house_id` (`house_id`),
  KEY `tenant_id` (`tenant_id`),
  KEY `idx_contract_id` (`contract_id`),
  KEY `idx_status` (`status`),
  KEY `idx_period` (`period`),
  CONSTRAINT `rentals_ibfk_1` FOREIGN KEY (`contract_id`) REFERENCES `contracts` (`id`),
  CONSTRAINT `rentals_ibfk_2` FOREIGN KEY (`house_id`) REFERENCES `houses` (`id`),
  CONSTRAINT `rentals_ibfk_3` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='绉熼噾琛';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rentals`
--

LOCK TABLES `rentals` WRITE;
/*!40000 ALTER TABLE `rentals` DISABLE KEYS */;
INSERT INTO `rentals` VALUES (1,'ZD-2024-01-01',1,1,1,'2024-01',2500.00,2500.00,1,'2024-01-05','2024-01-10',1,NULL,0,'2026-03-16 08:28:12','2026-03-16 08:28:12'),(2,'ZD-2024-02-01',1,1,1,'2024-02',2500.00,2500.00,1,'2024-02-03','2024-02-10',1,NULL,0,'2026-03-16 08:28:12','2026-03-16 08:28:12'),(3,'ZD-2024-03-01',1,1,1,'2024-03',2500.00,0.00,1,'2026-03-18','2024-03-10',1,'',0,'2026-03-16 08:28:12','2026-03-18 06:34:47'),(4,'ZD-1773727356237',2,2,2,'2026-03',1800.00,1800.00,2,'2026-03-17','2026-03-10',1,'',0,'2026-03-17 06:02:36','2026-03-17 06:02:36'),(5,'ZD-1773727378251',2,2,2,'2026-03',1800.00,1800.00,1,'2026-03-17','2026-03-10',1,'',0,'2026-03-17 06:02:58','2026-03-17 06:02:58'),(6,'ZD-1773812821241',2,2,2,'2026-03',1800.00,1800.00,1,'2026-03-18','2026-03-10',1,'',0,'2026-03-18 05:47:01','2026-03-18 05:47:01'),(7,'ZD-1773816449773',3,7,3,'2026-03',130000.00,130000.00,1,'2026-03-18','2026-03-10',1,'',0,'2026-03-18 06:47:29','2026-03-18 06:47:29');
/*!40000 ALTER TABLE `rentals` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `repairs`
--

DROP TABLE IF EXISTS `repairs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `repairs` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '涓婚敭ID',
  `repair_no` varchar(20) NOT NULL COMMENT '鎶ヤ慨缂栧彿',
  `house_id` int NOT NULL COMMENT '鍏宠仈鎴挎簮ID',
  `tenant_id` int DEFAULT NULL COMMENT '鎶ヤ慨浜篒D',
  `type` tinyint NOT NULL COMMENT '绫诲瀷: 1-姘寸數 2-闂ㄧ獥 3-瀹剁數 4-瀹跺叿 5-鍏朵粬',
  `urgency` tinyint DEFAULT '1' COMMENT '绱ф?绋嬪害: 1-鏅?? 2-绱ф? 3-闈炲父绱ф?',
  `description` text NOT NULL COMMENT '闂??鎻忚堪',
  `photos` json DEFAULT NULL COMMENT '鐓х墖JSON鏁扮粍',
  `expected_time` datetime DEFAULT NULL COMMENT '鏈熸湜澶勭悊鏃堕棿',
  `handler` varchar(50) DEFAULT NULL COMMENT '澶勭悊浜',
  `cost` decimal(10,2) DEFAULT NULL COMMENT '缁翠慨璐圭敤',
  `status` tinyint DEFAULT '0' COMMENT '鐘舵?: 0-寰呭彈鐞?1-宸插彈鐞?2-宸叉淳鍗?3-澶勭悊涓?4-寰呯‘璁?5-宸插畬鎴?6-宸茶瘎浠',
  `rating` tinyint DEFAULT NULL COMMENT '璇勫垎 1-5鏄',
  `comment` text COMMENT '璇勪环鍐呭?',
  `remark` text COMMENT '澶囨敞',
  `is_deleted` tinyint DEFAULT '0' COMMENT '鏄?惁鍒犻櫎',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '鍒涘缓鏃堕棿',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '鏇存柊鏃堕棿',
  PRIMARY KEY (`id`),
  UNIQUE KEY `repair_no` (`repair_no`),
  KEY `tenant_id` (`tenant_id`),
  KEY `idx_house_id` (`house_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `repairs_ibfk_1` FOREIGN KEY (`house_id`) REFERENCES `houses` (`id`),
  CONSTRAINT `repairs_ibfk_2` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='鎶ヤ慨琛';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `repairs`
--

LOCK TABLES `repairs` WRITE;
/*!40000 ALTER TABLE `repairs` DISABLE KEYS */;
INSERT INTO `repairs` VALUES (1,'BX-1773653414061',5,NULL,1,1,'坏了','[]','2026-03-16 00:00:00','李二牛',NULL,5,NULL,NULL,'',0,'2026-03-16 09:30:14','2026-03-17 07:49:47'),(2,'BX-1773729566415',5,NULL,1,1,'aaa','[\"http://tmp/q5mvjOXFFZ6fe9766f024760aa810ac8c8ba58257033.png\"]','2026-03-17 00:00:00',NULL,NULL,0,NULL,NULL,'',0,'2026-03-17 06:39:26','2026-03-17 06:39:26'),(3,'BX-1773729619470',1,NULL,1,1,'test','[]',NULL,NULL,NULL,0,NULL,NULL,'',0,'2026-03-17 06:40:19','2026-03-17 06:40:19'),(4,'BX-1773729638706',1,NULL,1,1,'test with photos','[\"wxfile://test1.jpg\", \"wxfile://test2.jpg\"]',NULL,NULL,NULL,0,NULL,NULL,'',0,'2026-03-17 06:40:38','2026-03-17 06:40:38'),(5,'BX-1773729667038',1,NULL,1,1,'test','[]',NULL,'张三',NULL,5,NULL,NULL,'',0,'2026-03-17 06:41:07','2026-03-17 07:48:52'),(6,'BX-1773730001290',3,NULL,2,1,'asdasd','[\"http://tmp/W_X8ll9wG1Egbbc70ffb61b76fcf6fedaca37bcf6bd7.png\"]','2026-03-17 00:00:00',NULL,NULL,5,NULL,NULL,'',0,'2026-03-17 06:46:41','2026-03-17 07:37:45');
/*!40000 ALTER TABLE `repairs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `settings`
--

DROP TABLE IF EXISTS `settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `settings` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '涓婚敭ID',
  `key` varchar(50) NOT NULL COMMENT '閰嶇疆閿',
  `value` text COMMENT '閰嶇疆鍊',
  `remark` varchar(200) DEFAULT NULL COMMENT '璇存槑',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '鍒涘缓鏃堕棿',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '鏇存柊鏃堕棿',
  PRIMARY KEY (`id`),
  UNIQUE KEY `key` (`key`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='绯荤粺璁剧疆琛';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `settings`
--

LOCK TABLES `settings` WRITE;
/*!40000 ALTER TABLE `settings` DISABLE KEYS */;
INSERT INTO `settings` VALUES (1,'rent_reminder_days','7,3,1','租金到期提醒天数，逗号分隔','2026-03-16 08:28:12','2026-03-16 08:28:12'),(2,'contract_warning_days','30','合同到期预警天数','2026-03-16 08:28:12','2026-03-16 08:28:12'),(3,'repair_response_hours','24','维修响应时限（小时）','2026-03-16 08:28:12','2026-03-16 08:28:12'),(4,'default_deposit_months','1','默认押金月数','2026-03-16 08:28:12','2026-03-16 08:28:12'),(5,'owner_id','1','当前房东ID','2026-03-16 08:28:12','2026-03-16 08:28:12');
/*!40000 ALTER TABLE `settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staff`
--

DROP TABLE IF EXISTS `staff`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `staff` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `specialty` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` tinyint DEFAULT '1',
  `remark` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff`
--

LOCK TABLES `staff` WRITE;
/*!40000 ALTER TABLE `staff` DISABLE KEYS */;
INSERT INTO `staff` VALUES (1,'张三','110','',1,'','2026-03-17 07:23:56'),(2,'李二牛','120','',1,'','2026-03-17 07:36:53');
/*!40000 ALTER TABLE `staff` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `storage_config`
--

DROP TABLE IF EXISTS `storage_config`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `storage_config` (
  `id` int NOT NULL AUTO_INCREMENT,
  `provider` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'aliyun/tencent/local',
  `access_key_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `access_key_secret` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bucket` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `region` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `domain` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '自定义域名',
  `enabled` tinyint DEFAULT '0',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `storage_config`
--

LOCK TABLES `storage_config` WRITE;
/*!40000 ALTER TABLE `storage_config` DISABLE KEYS */;
INSERT INTO `storage_config` VALUES (1,'local',NULL,NULL,NULL,NULL,NULL,1,'2026-03-17 18:02:11');
/*!40000 ALTER TABLE `storage_config` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tenants`
--

DROP TABLE IF EXISTS `tenants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tenants` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '涓婚敭ID',
  `name` varchar(50) NOT NULL COMMENT '濮撳悕',
  `gender` tinyint NOT NULL COMMENT '鎬у埆: 0-濂?1-鐢',
  `phone` varchar(20) NOT NULL COMMENT '鎵嬫満鍙',
  `id_card` varchar(20) DEFAULT NULL COMMENT '韬?唤璇佸彿',
  `emergency_contact` varchar(50) DEFAULT NULL COMMENT '绱ф?鑱旂郴浜',
  `emergency_phone` varchar(20) DEFAULT NULL COMMENT '绱ф?鑱旂郴浜虹數璇',
  `avatar` varchar(500) DEFAULT NULL COMMENT '澶村儚URL',
  `remark` text COMMENT '澶囨敞',
  `status` tinyint DEFAULT '1' COMMENT '鐘舵?: 1-姝ｅ父 0-鎷夐粦',
  `is_deleted` tinyint DEFAULT '0' COMMENT '鏄?惁鍒犻櫎',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '鍒涘缓鏃堕棿',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '鏇存柊鏃堕棿',
  PRIMARY KEY (`id`),
  KEY `idx_phone` (`phone`),
  KEY `idx_name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='绉熷?琛';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tenants`
--

LOCK TABLES `tenants` WRITE;
/*!40000 ALTER TABLE `tenants` DISABLE KEYS */;
INSERT INTO `tenants` VALUES (1,'李先生',1,'13900001111','110101199001011234','妻子','13900001112',NULL,NULL,1,0,'2026-03-16 08:28:12','2026-03-16 08:28:12'),(2,'张女士',0,'13900002222','110101199002021234','丈夫','13900002223',NULL,NULL,1,0,'2026-03-16 08:28:12','2026-03-16 08:28:12'),(3,'张铁牛',1,'110','123','','','','',1,0,'2026-03-18 06:46:34','2026-03-18 06:46:34');
/*!40000 ALTER TABLE `tenants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transactions`
--

DROP TABLE IF EXISTS `transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transactions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `type` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'income收入/expense支出',
  `category` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '租金/押金/维修/物业/水电/其他',
  `amount` decimal(10,2) NOT NULL,
  `house_id` int DEFAULT NULL,
  `tenant_id` int DEFAULT NULL,
  `related_id` int DEFAULT NULL,
  `related_type` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'rental/repair',
  `remark` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `operator_id` int DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_house_id` (`house_id`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_type` (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transactions`
--

LOCK TABLES `transactions` WRITE;
/*!40000 ALTER TABLE `transactions` DISABLE KEYS */;
/*!40000 ALTER TABLE `transactions` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-18 15:25:32
