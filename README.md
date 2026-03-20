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

| 模块 | 功能 | 入口 |
|------|------|------|
| 房源管理 | 列表、详情、添加/编辑、照片上传、配套设施 | 首页 → 房源管理 |
| 租客管理 | 列表、详情、添加/编辑、删除 | 首页 → 租客管理 |
| 合同管理 | 列表、详情、添加、续签、合同模板 | 首页 → 合同管理 |
| 租金管理 | 列表、添加、记收、删除、逾期提醒 | 首页 → 租金管理 |
| 报修管理 | 列表、详情、添加、删除 | 首页 → 报修管理 |
| 维修人员 | 列表、添加/编辑、删除 | 首页 → 维修人员 |
| 数据统计 | 概览、导出CSV、批量导入 | 首页 → 数据统计 |
| 数据备份 | 手动/自动备份、还原 | 首页 → 数据备份 |
| 系统设置 | 房东信息、租金提醒 | 首页 → 系统设置 |
| 财务管理 | 收入统计、支付记录、收款 | 首页 → 财务 |
| 抄表记录 | 水电表录入、费用计算、编辑、删除 | 首页 → 抄表 |
| 退房检查 | 退房申请、预约、物品检查、押金结算 | 首页 → 退房 |

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
# 执行 database 目录下的所有 SQL 文件
mysql -u root -p < database/init.sql
mysql -u root -p < database/notify.sql
mysql -u root -p < database/storage.sql
mysql -u root -p < database/admin.sql
mysql -u root -p < database/contract_template.sql
mysql -u root -p < database/meter.sql
mysql -u root -p < database/checkout.sql
mysql -u root -p < database/transactions.sql
mysql -u root -p < database/payments.sql
```

### 3. 启动后端
```bash
cd server
npm install
npm start
```
服务运行在 http://localhost:3000

### 4. 配置小程序
1. 用**微信开发者工具**打开 `miniprogram/` 目录
2. 修改 `app.js` 中的 `apiBase` 为你的服务器地址
3. 配置 AppID（可在微信公众平台申请测试号）

## 📁 项目结构

```
rental-manager/
├── miniprogram/          # 微信小程序前端
│   └── pages/
│       ├── index/        # 首页（功能入口）
│       ├── houses/       # 房源管理
│       ├── tenants/       # 租客管理
│       ├── contracts/    # 合同管理
│       ├── rentals/      # 租金管理
│       ├── payments/     # 支付/收款
│       ├── repairs/       # 报修管理
│       ├── staff/        # 维修人员
│       ├── stats/        # 数据统计
│       ├── finance/      # 财务管理
│       ├── meter/        # 抄表记录
│       ├── checkout/     # 退房检查
│       ├── backup/       # 数据备份
│       └── settings/     # 系统设置
├── server/               # Node.js 后端
│   └── src/
│       ├── routes/      # API 路由
│       ├── backup.js    # 备份模块
│       └── db.js        # 数据库连接
└── database/            # MySQL 初始化脚本
```

## 📦 API 接口

### 核心接口
| 路由 | 方法 | 说明 |
|------|------|------|
| `/api/houses` | GET/POST | 房源列表/添加 |
| `/api/houses/:id` | GET/PUT/DELETE | 房源详情/更新/删除 |
| `/api/tenants` | GET/POST | 租客列表/添加 |
| `/api/tenants/:id` | GET/PUT/DELETE | 租客详情/更新/删除 |
| `/api/contracts` | GET/POST | 合同列表/添加 |
| `/api/contracts/:id` | GET/PUT/DELETE | 合同详情/更新/删除 |
| `/api/contracts/renew/:id` | POST | 合同续签 |
| `/api/rentals` | GET/POST | 租金列表/添加 |
| `/api/rentals/:id` | GET/PUT/DELETE | 租金详情/更新/删除 |
| `/api/rentals/generate` | POST | 批量生成账单 |
| `/api/rentals/stats/pending` | GET | 待收租金统计 |
| `/api/repairs` | GET/POST | 报修列表/添加 |
| `/api/repairs/:id` | GET/PUT/DELETE | 报修详情/更新/删除 |
| `/api/staff` | GET/POST | 维修人员列表/添加 |
| `/api/staff/:id` | GET/PUT/DELETE | 维修人员详情/更新/删除 |
| `/api/stats/overview` | GET | 经营概览 |
| `/api/stats/export/:type` | GET | 导出CSV |
| `/api/stats/import/:type` | POST | 批量导入 |
| `/api/backup` | GET/POST | 备份列表/手动备份 |

### 扩展接口
| 路由 | 方法 | 说明 |
|------|------|------|
| `/api/payments/channels` | GET | 获取支付渠道 |
| `/api/payments/create` | POST | 创建支付订单 |
| `/api/payments/list` | GET | 支付记录列表 |
| `/api/payments/stats` | GET | 支付统计 |
| `/api/payments/notify` | POST | 支付回调 |
| `/api/payments/refund` | POST | 退款 |
| `/api/transactions` | GET/POST | 收支记录 |
| `/api/meter` | GET/POST | 抄表记录 |
| `/api/meter/:id` | GET/PUT/DELETE | 抄表详情/更新/删除 |
| `/api/meter/calculate` | POST | 计算费用 |
| `/api/checkout` | GET/POST | 退房列表/申请 |
| `/api/checkout/:id` | GET/PUT/DELETE | 退房详情/更新/删除 |
| `/api/checkout/:id/book` | PUT | 预约退房时间 |
| `/api/checkout/:id/complete` | PUT | 完成退房检查 |
| `/api/notify/templates` | GET | 通知模板 |
| `/api/notify/send` | POST | 发送通知 |
| `/api/contract-templates` | GET/POST | 合同模板 |
| `/api/storage/config` | GET/PUT | 存储配置 |

### 管理接口
| 路由 | 方法 | 说明 |
|------|------|------|
| `/api/auth/login` | POST | 管理员/租客登录 |
| `/api/auth/register` | POST | 注册管理员 |
| `/api/auth/verify` | GET | 验证token |
| `/api/auth/permissions` | GET | 获取权限 |
| `/api/auth/users` | GET | 用户列表 |
| `/api/auth/users` | POST | 添加用户 |
| `/api/auth/users/:id` | PUT | 更新用户 |
| `/api/auth/users/:id` | DELETE | 删除用户 |
| `/api/auth/password` | PUT | 修改密码 |

### 统计接口
| 路由 | 方法 | 说明 |
|------|------|------|
| `/api/stats/overview` | GET | 经营概览 |
| `/api/stats/income` | GET | 收入趋势 |
| `/api/stats/houses/distribution` | GET | 房源分布 |
| `/api/stats/occupancy` | GET | 入住率统计 |
| `/api/stats/revenue` | GET | 营收统计 |
| `/api/stats/export/:type` | GET | 导出CSV |
| `/api/stats/import/:type` | POST | 批量导入 |

### 健康检查
| 路由 | 方法 | 说明 |
|------|------|------|
| `/api/` | GET | 服务健康检查 |

## 🔄 已实现功能详情

## 📋 更新日志

### 2026-03-20 更新

#### 小程序优化
- ✅ **自定义 TabBar** - 根据用户角色显示不同菜单
  - 租客：房源、合同、租金、报修、我的
  - 维修人员：报修、抄表、我的
  - 财务：房源、租金、财务、我的
  - 管理员：首页、房源、租金、财务、我的

- ✅ **租客权限优化**
  - 租客合同列表不显示"新建合同"按钮
  - 报修提交按钮位置优化（避开底部 TabBar）
  - 个人信息页面正确显示租客信息

- ✅ **首页快捷功能修复**
  - 修复部分快捷功能点击无反应问题
  - 区分 tabBar 页面和普通页面的跳转方式

#### 后端 API
- ✅ **新增 `/api/auth/me` 接口** - 获取当前登录用户完整信息
  - 返回用户基本信息 + 租客详细信息（含身份证、紧急联系人等）

- ✅ **维修人员账号支持** - 维修人员可登录小程序

- ✅ **数据修复**
  - 修复租客用户信息（姓名、管理员账号绑定）
  - 清理重复的租客记录
  - 为测试租客创建合同和租金数据

#### 安全测试
- ✅ **完整安全测试脚本** (`server/test-security-full.js`)
  - 认证测试（有效/无效 token）
  - SQL 注入防护测试
  - XSS 防护测试
  - 暴力破解防护测试
  - 角色权限测试

- ✅ **全页面功能测试** (`server/test-all-pages.js`)
  - 测试所有页面 API 接口
  - 测试不同角色的访问权限

## 🛡️ 安全特性

### 1. 登录认证 ✅
- JWT token 认证
- 密码 bcrypt 加密存储
- 登录/登出功能
- token 过期自动跳转登录
- 支持管理员/租客两种登录方式
- 登录限流（每分钟10次）

### 2. 安全防护 ✅
- 全局 API 认证中间件
- CORS 跨域限制
- 文件上传类型限制
- SQL 参数化查询（防注入）
- .env 敏感信息保护
- 请求限流（每分钟100次）
- 请求日志记录

### 3. 微信通知推送 ✅
- 租金到期提醒
- 合同到期提醒
- 报修状态通知
- 可配置通知模板

### 2. 云存储（OSS/COS）✅
- 阿里云OSS支持
- 腾讯云COS支持
- 本地存储（默认）

### 3. 多管理员权限 ✅
- 角色：super/admin/finance/repair
- 细粒度权限控制

### 4. 收款功能 ✅
- 微信支付
- 支付宝
- 支付记录查询
- 退款功能
- 收入统计

### 5. 财务报表 ✅
- 收支记录
- 收入统计
- 支付方式分析
- 趋势图表

### 6. 合同模板 ✅
- 自定义合同模板
- 变量替换
- 一键生成
- 新建合同自动生成租金账单

### 7. 抄表记录 ✅
- 水表记录
- 电表记录
- 自动计算费用
- 编辑/删除功能

### 8. 退房检查 ✅
- 退房申请（需先结清租金）
- 预约退房时间
- 物品检查清单
- 押金结算（扣款/退款）
- 合同状态自动变更

### 9. 租客权限 ✅
- 租客可登录小程序
- 只能查看自己的房源、合同、租金
- 可提交报修
- 根据手机号关联租客账号

## 👥 角色权限说明

| 角色 | 说明 | 可访问模块 |
|------|------|-----------|
| super | 超级管理员 | 全部功能 |
| admin | 管理员 | 全部功能（除用户管理） |
| finance | 财务人员 | 房源、租客、合同、租金、财务、统计 |
| repair | 维修人员 | 报修管理、抄表记录 |
| tenant | 租客 | 自己的房源、合同、租金、报修 |

### 租客登录
- 登录类型选择"租客"
- 输入手机号（需提前绑定）
- 密码与管理端一致

## 🧪 测试

### 运行 API 测试
```bash
cd server
node test/api-test.js
```

### 测试安全修复
```bash
cd server
node test-security.js
```

MIT
