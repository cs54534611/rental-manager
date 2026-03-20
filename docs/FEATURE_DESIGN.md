# 🏠 租房管理系统 - 功能扩展设计方案

> 基于项目现状分析和市场需求调研

## 一、项目现状分析

### 1.1 已有功能模块

```
✅ 已实现：
├── 房源管理        - 列表、详情、添加/编辑、照片、配套设施
├── 租客管理        - CRUD、删除
├── 合同管理        - 列表、详情、添加、续签、合同模板
├── 租金管理        - 列表、添加、记收、删除、逾期提醒
├── 报修管理        - 列表、详情、添加、删除
├── 维修人员管理    - CRUD
├── 数据统计        - 概览、导出CSV、批量导入
├── 数据备份        - 手动/自动备份、还原
├── 系统设置        - 房东信息、租金提醒
├── 财务管理        - 收入统计、支付记录
├── 抄表记录        - 水电表录入、费用计算
├── 退房检查        - 退房申请、预约、物品检查、押金结算
├── 微信通知推送    - 租金/合同/报修通知
├── 多管理员权限    - super/admin/finance/repair/tenant
└── 登录认证        - JWT、bcrypt、限流
```

### 1.2 技术架构

| 层级 | 技术 | 状态 |
|------|------|------|
| 前端 | 微信小程序 | ✅ |
| 后端 | Node.js + Express | ✅ |
| 数据库 | MySQL 8.0 | ✅ |
| 认证 | JWT + bcrypt | ✅ |
| 存储 | 本地/OSS/COS | ✅ |
| 通知 | 微信模板消息 | ✅ |

---

## 二、市场同类产品调研

### 2.1 调研对象

1. **寓小二** - 长租公寓SaaS
2. **蘑菇租房** - 集中式公寓管理
3. **全房通** - 住宅租赁ERP
4. **房东利器** - 个人房东工具
5. **贝壳租房** - 平台型

### 2.2 核心功能对比

| 功能 | 本系统 | 寓小二 | 蘑菇租房 | 全房通 |
|------|--------|--------|----------|--------|
| 房源管理 | ✅ | ✅ | ✅ | ✅ |
| 租客管理 | ✅ | ✅ | ✅ | ✅ |
| 合同管理 | ✅ | ✅ | ✅ | ✅ |
| 租金管理 | ✅ | ✅ | ✅ | ✅ |
| 智能催租 | ❌ | ✅ | ✅ | ✅ |
| 在线签约 | ❌ | ✅ | ✅ | ❌ |
| 电子发票 | ❌ | ✅ | ❌ | ❌ |
| 房源推广 | ❌ | ✅ | ✅ | ❌ |
| 智能门锁 | ❌ | ✅ | ✅ | ❌ |
| 预付费账单 | ❌ | ✅ | ✅ | ❌ |
| 房态日历 | ❌ | ❌ | ✅ | ✅ |
| 保洁维修 | ❌ | ✅ | ✅ | ✅ |
| 投诉建议 | ❌ | ✅ | ✅ | ❌ |
| 数据分析 | ⚠️ | ✅ | ✅ | ✅ |
| 移动端App | ❌ | ✅ | ✅ | ❌ |
| 多门店管理 | ❌ | ✅ | ✅ | ✅ |

---

## 三、新功能设计方案

### 3.1 高优先级功能（建议优先开发）

#### 📌 P0 - 核心业务增强

---

#### **功能1：智能催租提醒**

**需求分析：**
- 当前系统有"待收统计"，但催租需要主动推送
- 租客经常忘记缴费，需要自动提醒
- 支持多次提醒（到期前3天、当天、逾期后）

**设计方案：**

```
API:
POST /api/reminders/send-all     - 发送所有待到期提醒
POST /api/reminders/send/{rentalId} - 发送单条提醒
GET  /api/reminders              - 提醒记录列表
PUT  /api/reminders/{id}        - 更新提醒设置

数据库:
reminders
- id, rental_id, type(1到期前3天/2当天/3逾期1天/4逾期3天/5逾期7天)
- send_status(0未发送/1已发送/2已通知)
- sent_at, created_at

提醒规则表 reminder_rules:
- id, rule_type, days_before, is_enabled, template_id
```

**小程序页面:**
- 提醒记录列表 `/pages/reminders/list`
- 提醒设置 `/pages/reminders/settings`

---

#### **功能2：房源推广发布**

**需求分析：**
- 房源信息可一键发布到多个平台（58同城、贝壳、闲鱼）
- 支持生成房源海报/链接分享
- 追踪推广效果（浏览量、咨询量）

**设计方案：**

```
API:
POST /api/listings/publish      - 发布到推广平台
GET  /api/listings/share/{houseId} - 生成推广链接/海报
GET  /api/listings/stats/{houseId} - 推广效果统计

数据库:
listing_publish_logs
- id, house_id, platform(58/beike/xianyu), status, published_at
- views, inquiries, conversions

share_links
- id, house_id, share_code, expires_at, views
```

**小程序页面:**
- 房源推广 `/pages/houses/publish`
- 推广效果 `/pages/houses/promo-stats`

---

#### **功能3：房态日历**

**需求分析：**
- 直观展示房源的出租状态
- 支持按月查看，入住/退房日期标注
- 与合同日期联动

**设计方案：**

```
API:
GET /api/calendar/{houseId}     - 获取房源日历数据
GET /api/calendar/year/{year}   - 按年获取

返回数据:
{
  "house_id": 1,
  "year": 2026,
  "months": [
    {
      "month": 1,
      "days": [
        {"day": 1, "status": "occupied", "contract_id": 1},
        {"day": 2, "status": "occupied"},
        {"day": 15, "status": "checkout", "contract_id": 1},
        {"day": 16, "status": "available"}
      ]
    }
  ]
}

状态: available(可租)/occupied(已租)/checkout(退房日)/checkin(入住日)/reserved(预留)
```

**小程序页面:**
- 房源日历 `/pages/houses/calendar`

---

### 📌 P1 - 运营效率提升

---

#### **功能4：在线签约（电子合同）**

**需求分析：**
- 租客可在线签署合同，无需线下见面
- 使用电子签名技术，法律效力
- 合同存储云端，可随时查看

**设计方案：**

```
API:
POST /api/econtracts/initiate    - 发起合同签署
GET  /api/econtracts/{id}        - 获取合同详情
POST /api/econtracts/{id}/sign   - 签署合同
GET  /api/econtracts/{id}/status - 获取签署状态
POST /api/econtracts/{id}/download - 下载合同PDF

数据库:
econtracts
- id, contract_id, unique_code
- initiator_sign, tenant_sign, initiated_at, signed_at
- status(draft/sent/signed/completed/cancelled)
- pdf_url, expires_at
```

**小程序页面:**
- 合同签署 `/pages/contracts/sign`
- 我的合同 `/pages/contracts/my-contracts`

---

#### **功能5：预付费账单（先付后住）**

**需求分析：**
- 支持押金+预付租金模式
- 租客预存资金，系统自动扣款
- 余额不足提醒

**设计方案：**

```
API:
POST /api/prepaid/topup          - 租客充值
GET  /api/prepaid/balance        - 查询余额
GET  /api/prepaid/history        - 充值/消费记录
POST /api/prepaid/auto-deduct    - 设置自动扣款
GET  /api/prepaid/statistics     - 预付费统计

数据库:
prepaid_accounts
- id, tenant_id, balance, auto_deduct_enabled
- created_at, updated_at

prepaid_transactions
- id, account_id, type(topup/deduct/refund)
- amount, balance_before, balance_after
- related_rental_id, created_at
```

**小程序页面(租客):**
- 我的钱包 `/pages/tenant/wallet`
- 充值 `/pages/tenant/topup`

---

#### **功能6：保洁维修服务**

**需求分析：**
- 租客可预约保洁、维修服务
- 管理员派单给维修人员
- 支持服务评价

**设计方案：**

```
API:
POST /api/services/book           - 预约服务
GET  /api/services/{id}           - 服务详情
PUT  /api/services/{id}/status    - 更新状态
POST /api/services/{id}/dispatch - 派单
POST /api/services/{id}/complete  - 完成服务
POST /api/services/{id}/rate      - 评价

数据库:
services
- id, house_id, tenant_id, staff_id
- type(cleaning/repair/other), scheduled_date
- status(booked/assigned/in_progress/completed/cancelled)
- description, fee, rating, comment
- created_at, completed_at
```

**小程序页面:**
- 服务预约 `/pages/services/book`
- 我的预约 `/pages/services/my-bookings`
- 服务详情 `/pages/services/detail`

---

### 📌 P2 - 数据分析增强

---

#### **功能7：经营分析大屏**

**需求分析：**
- 直观展示经营状况
- 图表化呈现收入、空置率、到期合同
- 支持自定义时间范围

**设计方案：**

```
API:
GET /api/analytics/dashboard     - 获取大屏数据
GET /api/analytics/income-detail - 收入明细分
GET /api/analytics/occupancy-trend - 入住率趋势
GET /api/analytics/risk-warning  - 风险预警

返回数据:
{
  "summary": {
    "total_income": 125000,
    "month_income": 28000,
    "occupancy_rate": 87.5,
    "pending_rentals": 5,
    "expiring_contracts_30d": 3
  },
  "charts": {
    "income_trend": [...],
    "occupancy_trend": [...],
    "room_type_distribution": [...]
  },
  "warnings": [
    {"type": "expiring_contract", "house": "xxx", "days_left": 5},
    {"type": "overdue_rental", "tenant": "xxx", "amount": 2000}
  ]
}
```

**小程序页面:**
- 数据大屏 `/pages/stats/dashboard`

---

#### **功能8：财务报表导出**

**需求分析：**
- 支持导出月度/年度财务报表
- 包含收支明细、汇总、对比
- 支持 PDF/Excel 格式

**设计方案：**

```
API:
GET /api/reports/monthly/{year}/{month} - 月度报告
GET /api/reports/yearly/{year}         - 年度报告
GET /api/reports/download/{reportId}   - 下载报告

报告内容:
1. 收支汇总表
2. 房源收益明细
3. 租金收缴情况
4. 费用支出明细
5. 环比同比分析
```

---

### 📌 P3 - 增值服务

---

#### **功能9：智能门锁集成**

**需求分析：**
- 对接智能门锁API（云丁、优点科技）
- 生成临时密码发给租客
- 开锁记录查询

**设计方案：**

```
API:
POST /api/locks/temp-password    - 生成临时密码
GET  /api/locks/records/{houseId} - 开锁记录
POST /api/locks/unbind            - 解绑门锁

支持的的门锁品牌:
- 云丁科技(叮咚)
- 优点科技
- 绿米(Aqara)
- 涂鸦智能
```

---

#### **功能10：投诉建议通道**

**需求分析：**
- 租客可提交投诉或建议
- 管理员处理并反馈
- 数据分析改进服务

**设计方案：**

```
API:
POST /api/feedback/submit        - 提交反馈
GET  /api/feedback/{id}          - 反馈详情
PUT  /api/feedback/{id}/reply    - 回复反馈
PUT  /api/feedback/{id}/status   - 更新状态

数据库:
feedbacks
- id, tenant_id, house_id
- type(complaint/suggestion/praise)
- content, images
- status(submitted/processing/replied/resolved)
- reply, replied_at, replied_by
- created_at
```

---

#### **功能11：多门店/多房东支持**

**需求分析：**
- 支持中介公司多门店管理
- 各门店独立数据，独立员工
- 总部可查看汇总数据

**设计方案：**

```
数据库:
stores
- id, name, address, manager_id
- status, created_at

admin_users 增加 store_id 字段

API:
GET /api/stores                 - 门店列表
POST /api/stores                - 创建门店
GET /api/stores/{id}/summary   - 门店经营汇总
```

---

#### **功能12：押金托管**

**需求分析：**
- 押金由第三方托管，退房时自动退还
- 避免押金纠纷
- 租客更放心

**设计方案：**

```
API:
POST /api/deposit/trusteeship   - 开通押金托管
GET  /api/deposit/{contractId}   - 查询押金状态
POST /api/deposit/refund-request - 申请退押金

托管状态:
deposit_trusteeship
- id, contract_id, amount, status
- truster_name(托管机构)
- truster_status(deposited/held/releasing/released)
- deposited_at, refund_request_at, released_at
```

---

## 四、功能优先级建议

### 4.1 推荐开发顺序

| 阶段 | 功能 | 预计工时 | 价值 |
|------|------|----------|------|
| **Phase 1** | 智能催租提醒 | 3天 | 高 |
| **Phase 1** | 房态日历 | 2天 | 高 |
| **Phase 2** | 房源推广 | 3天 | 高 |
| **Phase 2** | 经营分析大屏 | 3天 | 中高 |
| **Phase 3** | 预付费账单 | 5天 | 中 |
| **Phase 3** | 保洁维修服务 | 4天 | 中 |
| **Phase 4** | 在线签约 | 5天 | 中 |
| **Phase 4** | 投诉建议 | 2天 | 低 |
| **Phase 5** | 多门店支持 | 5天 | 中 |
| **Phase 6** | 押金托管 | 5天 | 低 |
| **Phase 6** | 智能门锁 | 7天 | 低 |

### 4.2 MVP 版本规划

**MVP (1-2周):**
1. ✅ 智能催租提醒
2. ✅ 房态日历
3. ✅ 房源推广（分享链接）

**V1.1 (3-4周):**
4. ✅ 经营分析大屏
5. ✅ 保洁维修预约

**V2.0 (1-2月):**
6. ✅ 在线签约
7. ✅ 预付费账单
8. ✅ 多门店支持

---

## 五、技术实现建议

### 5.1 前端技术升级

```
当前: 微信小程序原生

建议:
- 考虑使用 Taro/Uni-app 实现多端统一
- 使用 Vant Weapp 作为UI组件库
- 引入 ECharts 实现图表
```

### 5.2 后端优化

```
建议:
- 引入 Redis 缓存热门数据
- 使用 Koa 重构提升性能
- 引入 WebSocket 支持实时通知
- 使用 Docker 部署
```

### 5.3 数据库优化

```
建议:
- 定期归档历史数据
- 添加必要索引
- 考虑分库分表（未来数据量大时）
```

---

## 六、结论

当前租房管理系统已具备**核心功能**，可满足**小规模个人房东/中小中介**的使用需求。

建议按 **Phase 1 → Phase 2 → Phase 3** 的顺序逐步开发新功能，重点关注：
1. **智能催租提醒** - 提升租金收缴率
2. **房态日历** - 优化房源可视化
3. **房源推广** - 降低空置率

这些功能投入产出比高，能显著提升系统价值和用户体验。

---

*文档版本: v1.0*
*最后更新: 2026-03-20*
