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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='鍚堝悓琛';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contracts`
--

LOCK TABLES `contracts` WRITE;
/*!40000 ALTER TABLE `contracts` DISABLE KEYS */;
INSERT INTO `contracts` VALUES (1,'HT-2024-001',1,1,1,'2024-01-01','2024-12-31',2500.00,1,2500.00,NULL,1,NULL,0,'2026-03-16 08:28:12','2026-03-16 08:28:12'),(2,'HT-2024-002',2,2,1,'2024-03-01','2025-02-28',1800.00,2,1800.00,NULL,1,NULL,0,'2026-03-16 08:28:12','2026-03-16 08:28:12');
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
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='鎴挎簮琛';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `houses`
--

LOCK TABLES `houses` WRITE;
/*!40000 ALTER TABLE `houses` DISABLE KEYS */;
INSERT INTO `houses` VALUES (1,'RZ-001','阳光小区','A栋301室','2室1厅',80.00,'3/20','南','精装',2500.00,2500.00,1,'[\"地铁房\", \"精装\"]',NULL,'[\"空调\", \"冰箱\", \"洗衣机\", \"热水器\"]',NULL,0,'2026-03-16 08:28:12','2026-03-16 08:28:12'),(2,'RZ-002','阳光小区','A栋402室','1室1厅',55.00,'4/20','南','精装',1800.00,1800.00,1,'[\"近学校\"]',NULL,'[\"空调\", \"冰箱\", \"洗衣机\"]',NULL,0,'2026-03-16 08:28:12','2026-03-16 08:28:12'),(3,'RZ-003','幸福花园','B栋201室','3室2厅',120.00,'2/18','南北','简装',3200.00,3200.00,0,'[\"花园\", \"停车位\"]',NULL,'[\"空调\", \"热水器\", \"洗衣机\"]',NULL,0,'2026-03-16 08:28:12','2026-03-16 08:28:12'),(4,'RZ-004','幸福花园','B栋502室','2室1厅',90.00,'5/18','南','精装',2800.00,2800.00,2,'[\"电梯房\"]',NULL,'[\"空调\", \"冰箱\", \"洗衣机\", \"热水器\", \"沙发\"]',NULL,0,'2026-03-16 08:28:12','2026-03-16 08:28:12'),(5,'RZ-1773653339428','测试','测试','1室0厅',50.00,'5/24','东','精装',600.00,600.00,0,'[]','[\"http://tmp/BECRvgKYEEnEbbc70ffb61b76fcf6fedaca37bcf6bd7.png\"]','[]','',0,'2026-03-16 09:28:59','2026-03-17 06:21:26'),(6,'RZ-1773734356191','阳光城','龙泉','4室2厅',150.00,'12/34','东','精装',3000.00,3000.00,0,'[]','[\"wxfile://tmp_fbf401e8d029dbcc4178ff4b5a1e80fa2f413d9f88c024e1.jpg\"]','[\"停车位\"]','龙潭是我',0,'2026-03-17 07:59:16','2026-03-17 07:59:16');
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
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='绉熼噾琛';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rentals`
--

LOCK TABLES `rentals` WRITE;
/*!40000 ALTER TABLE `rentals` DISABLE KEYS */;
INSERT INTO `rentals` VALUES (1,'ZD-2024-01-01',1,1,1,'2024-01',2500.00,2500.00,1,'2024-01-05','2024-01-10',1,NULL,0,'2026-03-16 08:28:12','2026-03-16 08:28:12'),(2,'ZD-2024-02-01',1,1,1,'2024-02',2500.00,2500.00,1,'2024-02-03','2024-02-10',1,NULL,0,'2026-03-16 08:28:12','2026-03-16 08:28:12'),(3,'ZD-2024-03-01',1,1,1,'2024-03',2500.00,0.00,NULL,NULL,'2024-03-10',0,NULL,0,'2026-03-16 08:28:12','2026-03-16 08:28:12'),(4,'ZD-1773727356237',2,2,2,'2026-03',1800.00,1800.00,2,'2026-03-17','2026-03-10',1,'',0,'2026-03-17 06:02:36','2026-03-17 06:02:36'),(5,'ZD-1773727378251',2,2,2,'2026-03',1800.00,1800.00,1,'2026-03-17','2026-03-10',1,'',0,'2026-03-17 06:02:58','2026-03-17 06:02:58');
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
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `specialty` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` tinyint DEFAULT '1',
  `remark` text COLLATE utf8mb4_unicode_ci,
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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='绉熷?琛';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tenants`
--

LOCK TABLES `tenants` WRITE;
/*!40000 ALTER TABLE `tenants` DISABLE KEYS */;
INSERT INTO `tenants` VALUES (1,'李先生',1,'13900001111','110101199001011234','妻子','13900001112',NULL,NULL,1,0,'2026-03-16 08:28:12','2026-03-16 08:28:12'),(2,'张女士',0,'13900002222','110101199002021234','丈夫','13900002223',NULL,NULL,1,0,'2026-03-16 08:28:12','2026-03-16 08:28:12');
/*!40000 ALTER TABLE `tenants` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-17 16:51:13
