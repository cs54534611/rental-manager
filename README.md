# 🏠 租房管理系统

> 微信小程序 + Node.js 后端 + MySQL 数据库

## 📱 功能模块

| 模块 | 功能 |
|------|------|
| 房源管理 | 列表、详情、添加/编辑、照片上传、配套设施 |
| 租客管理 | 列表、详情、添加/编辑 |
| 合同管理 | 列表、详情、添加、续签 |
| 租金管理 | 列表、添加、逾期提醒 |
| 报修管理 | 列表、详情、添加、照片上传、分配维修人员 |
| 维修人员 | 列表、添加/编辑、删除 |
| 数据统计 | 概览、导出CSV、批量导入 |
| 数据备份 | 手动/自动备份、还原 |
| 系统设置 | 房东信息、租金提醒 |

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

### 2. 启动后端
```bash
cd server
npm install
npm start
```
服务运行在 http://localhost:3000

### 3. 配置小程序
1. 用**微信开发者工具**打开 `miniprogram/` 目录
2. 修改 `app.js` 中的 `baseUrl` 为你的服务器地址
3. 配置 AppID（可在微信公众平台申请测试号）

## 📁 项目结构

```
rental-manager/
├── miniprogram/          # 微信小程序前端
│   └── pages/
│       ├── index/        # 首页
│       ├── houses/      # 房源管理
│       ├── tenants/      # 租客管理
│       ├── contracts/    # 合同管理
│       ├── rentals/      # 租金管理
│       ├── repairs/      # 报修管理
│       ├── staff/        # 维修人员
│       ├── stats/        # 数据统计
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

| 路由 | 方法 | 说明 |
|------|------|------|
| `/api/houses` | GET/POST | 房源列表/添加 |
| `/api/houses/:id` | GET/PUT/DELETE | 房源详情/更新/删除 |
| `/api/tenants` | GET/POST | 租客列表/添加 |
| `/api/contracts` | GET/POST | 合同列表/添加 |
| `/api/contracts/renew/:id` | POST | 合同续签 |
| `/api/rentals` | GET/POST | 租金列表/添加 |
| `/api/rentals/generate` | POST | 批量生成账单 |
| `/api/repairs` | GET/POST | 报修列表/添加 |
| `/api/staff` | GET/POST | 维修人员列表/添加 |
| `/api/stats/export/:type` | GET | 导出CSV |
| `/api/stats/import/:type` | POST | 批量导入 |
| `/api/backup` | GET/POST | 备份列表/手动备份 |

## 🔄 待完善功能

- [x] 微信通知推送
- [ ] 云存储（照片/附件）
- [ ] 多管理员权限
- [ ] 收款功能对接
- [ ] 财务报表
- [ ] 合同模板生成
- [ ] 抄表记录
- [ ] 退房检查

## 📄 License

MIT
