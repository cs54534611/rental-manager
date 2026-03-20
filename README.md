# 🏠 租房管理系统

> 微信小程序 + Node.js 后端 + MySQL 数据库

## 🔐 默认登录账号

| 账号 | 密码 | 角色 |
|------|------|------|
| admin | admin123 | 超级管理员 |
| 13900001111 | admin123 | 租客-李先生 |
| 13900002222 | admin123 | 租客-张女士 |
| 13800138002 | repair123 | 维修人员 |

## 📱 功能模块

### 基础模块
| 模块 | 功能 | 入口 |
|------|------|------|
| 房源管理 | 列表、详情、添加/编辑、照片上传、配套设施 | TabBar → 房源 |
| 租客管理 | 列表、详情、添加/编辑、删除 | 首页 → 租客管理 |
| 合同管理 | 列表、详情、添加、续签、合同模板 | TabBar → 合同 |
| 租金管理 | 列表、添加、记收、删除、逾期提醒 | TabBar → 租金 |
| 报修管理 | 列表、详情、添加、删除 | TabBar → 报修 |
| 财务管理 | 收入统计、支付记录 | TabBar → 财务 |
| 抄表记录 | 水电表录入、费用计算 | TabBar → 抄表 |
| 退房检查 | 退房申请、预约、物品检查、押金结算 | 首页 → 退房检查 |
| 维修人员 | 列表、添加/编辑、删除 | 设置 → 维修人员管理 |
| 数据统计 | 概览、导出CSV、批量导入 | 首页 → 数据统计 |
| 数据备份 | 手动/自动备份、还原 | 设置 → 数据备份 |
| 系统设置 | 房东信息、租金提醒 | TabBar → 我的 |

### Phase 1: 智能催租提醒
- 自动提醒规则（到期前7/3/1天、当天、逾期1/3/7天）
- 发送提醒、统计待发/已发数量
- 可查看每条提醒详情
- **API**: `/api/reminders/*`

### Phase 2: 房态日历
- 单个房源月度日历视图（每天显示入住/空置状态）
- 所有房源月度入住概览（入住率统计）
- 切换上/下月导航
- **API**: `/api/calendar/*`

### Phase 3: 房源推广
- 生成唯一推广链接（可分享）
- 一键发布到58同城/贝壳/闲鱼/百姓网
- 推广效果统计（浏览量、咨询量）
- **API**: `/api/promotion/*`

### Phase 4: 经营分析大屏
- 月度总收入、待收金额
- 房源总数、在租套数、入住率
- 近6个月收入趋势图表
- 房源类型分布统计
- 风险预警（逾期租金提醒）
- **API**: `/api/analytics/dashboard`

### Phase 5: 保洁维修服务
- 服务预约（保洁/维修/其他）
- 维修人员派单管理
- 服务状态跟踪（已预约→已派单→进行中→已完成）
- 服务完成记录费用和评价
- **API**: `/api/services/*`

### Phase 6: 在线签约（电子合同）
- 发起电子合同签署流程
- 签署方（发起人/租客）分别签署
- 签署状态跟踪（草稿→已签署）
- 合同唯一标识码
- **API**: `/api/econtracts/*`

### Phase 7: 预付费钱包
- 账户余额查询
- 充值功能
- 交易记录明细
- 自动扣款开关（租金到期自动扣除）
- **API**: `/api/wallet/*`

### Phase 8: 投诉建议
- 提交投诉/建议/表扬
- 管理员查看所有反馈
- 回复反馈
- 状态跟踪（待处理→已回复→已关闭）
- **API**: `/api/feedback/*`

## 🛠️ 技术栈

- **前端**: 微信小程序 (原生)
- **后端**: Node.js + Express
- **数据库**: MySQL 8.0

## 🚀 快速启动

### 1. 克隆项目
```bash
git clone https://github.com/cs54534611/rental-manager.git
cd rental-manager
```

### 2. 初始化数据库
```bash
mysql -u root -p < database/init.sql
mysql -u root -p < database/notify.sql
mysql -u root -p < database/storage.sql
mysql -u root -p < database/admin.sql
mysql -u root -p < database/contract_template.sql
mysql -u root -p < database/meter.sql
mysql -u root -p < database/checkout.sql
mysql -u root -p < database/transactions.sql
mysql -u root -p < database/payments.sql
mysql -u root -p < database/reminder.sql
mysql -u root -p < database/promotion.sql
```

### 3. 启动后端
```bash
cd server
npm install
npm start
```
服务运行在 http://localhost:3000（局域网: http://192.168.0.139:3000）

### 4. 配置小程序
1. 用**微信开发者工具**打开 `miniprogram/` 目录
2. 修改 `app.js` 中的 `apiBase` 为你的服务器地址
3. 配置 AppID（可在微信公众平台申请测试号）

## 📁 项目结构

```
rental-manager/
├── miniprogram/          # 微信小程序前端
│   └── pages/
│       ├── index/        # 首页
│       ├── houses/       # 房源管理
│       ├── tenants/       # 租客管理
│       ├── contracts/    # 合同管理
│       ├── rentals/      # 租金管理
│       ├── payments/     # 支付记录
│       ├── repairs/       # 报修管理
│       ├── staff/        # 维修人员
│       ├── stats/        # 数据统计
│       ├── finance/      # 财务管理
│       ├── meter/        # 抄表记录
│       ├── checkout/     # 退房检查
│       ├── backup/       # 数据备份
│       ├── reminders/    # 催租提醒
│       ├── wallet/       # 预付费钱包
│       ├── feedback/     # 投诉建议
│       └── settings/     # 系统设置
├── server/               # Node.js 后端
│   └── src/
│       ├── routes/      # API 路由
│       ├── middleware/  # 中间件
│       └── db.js        # 数据库连接
└── database/            # MySQL 初始化脚本
```

## 📦 API 接口总览

### 基础接口
| 路由 | 方法 | 说明 |
|------|------|------|
| `/api/auth/login` | POST | 登录 |
| `/api/auth/me` | GET | 当前用户信息 |
| `/api/houses` | GET/POST | 房源列表/添加 |
| `/api/houses/:id` | GET/PUT/DELETE | 房源详情/更新/删除 |
| `/api/tenants` | GET/POST | 租客列表/添加 |
| `/api/tenants/:id` | GET/PUT/DELETE | 租客详情/更新/删除 |
| `/api/contracts` | GET/POST | 合同列表/添加 |
| `/api/contracts/:id` | GET/PUT/DELETE | 合同详情/更新/删除 |
| `/api/contracts/renew/:id` | POST | 合同续签 |
| `/api/rentals` | GET/POST | 租金列表/添加 |
| `/api/rentals/generate` | POST | 批量生成账单 |
| `/api/repairs` | GET/POST | 报修列表/添加 |
| `/api/staff` | GET/POST | 维修人员列表/添加 |
| `/api/staff/:id` | GET/PUT/DELETE | 维修人员详情/更新/删除 |
| `/api/backup` | GET/POST | 备份列表/手动备份 |
| `/api/backup/:filename` | DELETE/POST | 删除/还原备份 |

### Phase 1: 催租提醒
| 路由 | 方法 | 说明 |
|------|------|------|
| `/api/reminders/rules` | GET | 获取提醒规则列表 |
| `/api/reminders/pending` | GET | 获取待发送提醒 |
| `/api/reminders/send` | POST | 发送提醒 |
| `/api/reminders/send/:id` | POST | 发送单条提醒 |
| `/api/reminders/stats` | GET | 获取提醒统计 |

### Phase 2: 房态日历
| 路由 | 方法 | 说明 |
|------|------|------|
| `/api/calendar/overview` | GET | 月度房源概览（入住率） |
| `/api/calendar/:houseId` | GET | 单个房源月度日历 |

### Phase 3: 房源推广
| 路由 | 方法 | 说明 |
|------|------|------|
| `/api/promotion/share/:houseId` | GET | 生成推广链接 |
| `/api/promotion/stats/:houseId` | GET | 推广统计 |
| `/api/promotion/publish` | POST | 发布到平台 |
| `/api/promotion/logs/:houseId` | GET | 发布记录 |
| `/api/promotion/view/:shareCode` | POST | 记录浏览 |

### Phase 4: 经营分析
| 路由 | 方法 | 说明 |
|------|------|------|
| `/api/analytics/dashboard` | GET | 大屏数据（收入/入住率/预警） |

### Phase 5: 保洁维修
| 路由 | 方法 | 说明 |
|------|------|------|
| `/api/services` | GET/POST | 服务列表/预约 |
| `/api/services/:id` | GET | 服务详情 |
| `/api/services/:id/dispatch` | PUT | 派单 |
| `/api/services/:id/complete` | PUT | 完成服务 |
| `/api/services/:id/rate` | PUT | 评价服务 |
| `/api/services/:id/cancel` | PUT | 取消服务 |

### Phase 6: 电子合同
| 路由 | 方法 | 说明 |
|------|------|------|
| `/api/econtracts` | GET | 电子合同列表 |
| `/api/econtracts/initiate` | POST | 发起签署 |
| `/api/econtracts/:id/sign` | POST | 签署合同 |
| `/api/econtracts/:id` | GET | 合同详情 |

### Phase 7: 预付费钱包
| 路由 | 方法 | 说明 |
|------|------|------|
| `/api/wallet/balance/:tenantId` | GET | 余额查询 |
| `/api/wallet/topup` | POST | 充值 |
| `/api/wallet/history/:tenantId` | GET | 交易记录 |
| `/api/wallet/auto-deduct/:tenantId` | PUT | 设置自动扣款 |

### Phase 8: 投诉建议
| 路由 | 方法 | 说明 |
|------|------|------|
| `/api/feedback` | GET | 反馈列表 |
| `/api/feedback/submit` | POST | 提交反馈 |
| `/api/feedback/:id/reply` | PUT | 回复反馈 |
| `/api/feedback/:id/status` | PUT | 更新状态 |

### 其他接口
| 路由 | 方法 | 说明 |
|------|------|------|
| `/api/checkout` | GET/POST | 退房列表/申请 |
| `/api/meter` | GET/POST | 抄表记录 |
| `/api/finance/summary` | GET | 财务汇总 |
| `/api/stats/overview` | GET | 经营概览 |
| `/api/stats/export/:type` | GET | 导出CSV |
| `/api/health` | GET | 健康检查 |

## 🛡️ 安全特性

- JWT token 认证
- 密码 bcrypt 加密
- 登录限流（每分钟10次）
- 全局请求限流（每分钟100次）
- SQL 参数化查询（防注入）
- CORS 跨域限制
- .env 敏感信息保护
- 请求日志记录

## 👥 角色权限

| 角色 | 可访问模块 |
|------|-----------|
| super | 全部功能 |
| admin | 全部功能（除用户管理） |
| finance | 房源、租客、合同、租金、财务、统计 |
| repair | 报修管理、抄表记录 |
| tenant | 自己的房源、合同、钱包、投诉建议 |

## 🧪 测试

```bash
cd server
node test-full-matching.js   # 全部功能测试
node test-phase1-8.js          # Phase 1-8 功能测试
```

## 📋 更新日志

### 2026-03-20 Phase 1-8 功能更新

#### Phase 1: 智能催租提醒 ✅
- 6条提醒规则（到期前7/3/1天、当天、逾期1/3/7天）
- 发送提醒、统计待发/已发数量
- 数据库表：`reminder_rules`、`reminders`

#### Phase 2: 房态日历 ✅
- 单个房源月度日历视图
- 所有房源月度入住概览
- 数据库表：继承 houses 表

#### Phase 3: 房源推广 ✅
- 生成唯一推广链接
- 一键发布到58同城/贝壳/闲鱼/百姓网
- 推广统计（浏览/咨询量）
- 数据库表：`share_links`、`listing_publish_logs`

#### Phase 4: 经营分析大屏 ✅
- 月度收入/待收/入住率
- 近6个月收入趋势
- 房源类型分布
- 风险预警（逾期租金）
- 数据库表：继承 rentals/houses 表

#### Phase 5: 保洁维修服务 ✅
- 服务预约（保洁/维修/其他）
- 派单管理、服务状态跟踪
- 费用记录、评价
- 数据库表：`services`

#### Phase 6: 在线签约 ✅
- 发起电子合同签署
- 双方签署状态跟踪
- 数据库表：`econtracts`

#### Phase 7: 预付费钱包 ✅
- 余额查询、充值
- 交易记录明细
- 自动扣款开关
- 数据库表：`prepaid_accounts`、`prepaid_transactions`

#### Phase 8: 投诉建议 ✅
- 投诉/建议/表扬类型
- 管理员回复
- 状态跟踪
- 数据库表：`feedback`

#### 小程序页面更新 ✅
- 新增页面：`wallet/`（钱包）、`feedback/`（投诉建议）
- "我的"页面新增钱包、投诉建议入口
- 钱包页面：余额展示、充值、交易记录
- 投诉建议页面：列表、提交、回复

MIT
